"""Operational command for reviewed tenant purges."""

import argparse
import json
from datetime import datetime, timezone

from app.core.database import SessionLocal
from app.models.domain import Tenant
from app.services.tenant_purge import purge_due_tenants


def main() -> None:
    parser = argparse.ArgumentParser(description="Purga tenants cuja carência de 30 dias venceu.")
    parser.add_argument("--dry-run", action="store_true", help="Lista tenants elegíveis sem apagar dados.")
    parser.add_argument("--confirm", action="store_true", help="Autoriza a purga permanente.")
    args = parser.parse_args()
    if not args.dry_run and not args.confirm:
        parser.error("use --dry-run para inspeção ou --confirm para executar a purga")

    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        if args.dry_run:
            rows = db.query(Tenant.id, Tenant.closure_scheduled_for).filter(
                Tenant.closure_status == "pending", Tenant.closure_scheduled_for <= now
            ).all()
            print(json.dumps([{"tenant_id": str(row[0]), "scheduled_for": row[1].isoformat()} for row in rows]))
            return

        results = purge_due_tenants(db, now=now)
        print(json.dumps([{
            "tenant_id": str(result.tenant_id),
            "candidates": result.candidates,
            "applications": result.applications,
            "users": result.users,
            "files": result.files,
        } for result in results]))
    finally:
        db.close()


if __name__ == "__main__":
    main()
