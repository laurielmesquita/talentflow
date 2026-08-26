"""Permanent, explicit tenant purge after the approved grace period.

This module is intentionally not called from request handlers or application
startup. A human-reviewed operational command must invoke it.
"""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.candidates import extract_cloudinary_public_id
from app.models.domain import (
    AuditLog,
    BatchJob,
    Candidate,
    Category,
    Experience,
    JobApplication,
    JobMatch,
    JobPosition,
    Skill,
    Tenant,
    User,
    candidate_category,
    candidate_skill,
)


@dataclass(frozen=True)
class PurgeResult:
    tenant_id: UUID
    candidates: int
    applications: int
    users: int
    files: int


def _cloudinary_assets(db: Session, tenant_id: UUID) -> set[tuple[str, str]]:
    """Return unique Cloudinary public IDs and resource types for a tenant."""
    assets: set[tuple[str, str]] = set()
    candidates = db.query(Candidate).filter(Candidate.tenant_id == tenant_id).all()
    for candidate in candidates:
        photo_id = extract_cloudinary_public_id(candidate.photo_url, is_raw=False)
        if photo_id:
            assets.add((photo_id, "image"))
        pdf_id = extract_cloudinary_public_id(candidate.original_pdf_url, is_raw=True)
        if pdf_id:
            assets.add((pdf_id, "raw"))

    applications = db.query(JobApplication).filter(JobApplication.tenant_id == tenant_id).all()
    for application in applications:
        pdf_id = extract_cloudinary_public_id(application.original_pdf_url, is_raw=True)
        if pdf_id:
            assets.add((pdf_id, "raw"))
    return assets


def _delete_cloudinary_assets(assets: Iterable[tuple[str, str]]) -> int:
    """Delete assets and raise on provider errors so the DB is not purged."""
    if not assets:
        return 0

    import cloudinary.uploader
    from ingest import _configure_cloudinary

    _configure_cloudinary()
    deleted = 0
    for public_id, resource_type in assets:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type, invalidate=True)
        if result.get("result") not in {"ok", "not found"}:
            raise RuntimeError(f"Cloudinary não confirmou a remoção do asset {public_id}.")
        deleted += 1
    return deleted


def purge_tenant(db: Session, tenant_id: UUID, *, now: datetime | None = None) -> PurgeResult | None:
    """Purge one due tenant. Returns None when it is not eligible.

    The tenant is locked before eligibility is checked. Cloudinary is cleaned
    first; database deletion happens only after all provider calls succeed.
    Re-running after an interruption is safe because "not found" is accepted
    and all SQL deletes are idempotent.
    """
    now = now or datetime.now(timezone.utc)
    tenant = (
        db.query(Tenant)
        .filter(
            Tenant.id == tenant_id,
            Tenant.closure_status == "pending",
            Tenant.closure_scheduled_for <= now,
        )
        .with_for_update()
        .first()
    )
    if not tenant:
        return None

    candidate_rows = db.query(Candidate).filter(Candidate.tenant_id == tenant_id).all()
    application_count = db.query(JobApplication).filter(JobApplication.tenant_id == tenant_id).count()
    user_count = db.query(User).filter(User.tenant_id == tenant_id).count()
    candidate_ids = [candidate.id for candidate in candidate_rows]
    job_ids = [job.id for job in db.query(JobPosition).filter(JobPosition.tenant_id == tenant_id).all()]

    files_deleted = _delete_cloudinary_assets(_cloudinary_assets(db, tenant_id))

    if candidate_ids:
        db.query(JobMatch).filter(
            or_(JobMatch.candidate_id.in_(candidate_ids), JobMatch.job_id.in_(job_ids or [None]))
        ).delete(synchronize_session=False)
        db.execute(candidate_category.delete().where(candidate_category.c.candidate_id.in_(candidate_ids)))
        db.execute(candidate_skill.delete().where(candidate_skill.c.candidate_id.in_(candidate_ids)))
        db.query(Experience).filter(Experience.candidate_id.in_(candidate_ids)).delete(synchronize_session=False)
    if job_ids:
        db.query(JobMatch).filter(JobMatch.job_id.in_(job_ids)).delete(synchronize_session=False)

    db.query(JobApplication).filter(JobApplication.tenant_id == tenant_id).delete(synchronize_session=False)
    db.query(AuditLog).filter(AuditLog.tenant_id == tenant_id).delete(synchronize_session=False)
    db.query(BatchJob).filter(BatchJob.tenant_id == tenant_id).delete(synchronize_session=False)
    db.query(Candidate).filter(Candidate.tenant_id == tenant_id).delete(synchronize_session=False)
    db.query(JobPosition).filter(JobPosition.tenant_id == tenant_id).delete(synchronize_session=False)
    db.query(Category).filter(Category.tenant_id == tenant_id).delete(synchronize_session=False)
    db.query(Skill).filter(Skill.tenant_id == tenant_id).delete(synchronize_session=False)
    db.query(User).filter(User.tenant_id == tenant_id).delete(synchronize_session=False)
    db.query(Tenant).filter(Tenant.id == tenant_id).delete(synchronize_session=False)
    db.commit()

    return PurgeResult(
        tenant_id=tenant_id,
        candidates=len(candidate_ids),
        applications=application_count,
        users=user_count,
        files=files_deleted,
    )


def purge_due_tenants(db: Session, *, now: datetime | None = None) -> list[PurgeResult]:
    """Purge every currently due tenant, one committed tenant at a time."""
    now = now or datetime.now(timezone.utc)
    tenant_ids = [
        tenant_id
        for (tenant_id,) in db.query(Tenant.id)
        .filter(Tenant.closure_status == "pending", Tenant.closure_scheduled_for <= now)
        .all()
    ]
    results = []
    for tenant_id in tenant_ids:
        result = purge_tenant(db, tenant_id, now=now)
        if result:
            results.append(result)
    return results
