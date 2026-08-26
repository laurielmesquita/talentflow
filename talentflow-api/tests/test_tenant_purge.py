from types import SimpleNamespace
from unittest.mock import MagicMock
from uuid import uuid4

import pytest

from app.services.tenant_purge import _cloudinary_assets, _delete_cloudinary_assets


def test_cloudinary_assets_are_scoped_and_deduplicated():
    tenant_id = uuid4()
    candidate = SimpleNamespace(
        photo_url="https://res.cloudinary.com/demo/image/upload/v1/tenant/photo.jpg",
        original_pdf_url="https://res.cloudinary.com/demo/raw/upload/v1/tenant/cv.pdf",
    )
    application = SimpleNamespace(
        original_pdf_url="https://res.cloudinary.com/demo/raw/upload/v1/tenant/cv.pdf",
    )
    db = MagicMock()
    db.query.side_effect = [
        MagicMock(filter=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[candidate])))),
        MagicMock(filter=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[application])))),
    ]

    assert _cloudinary_assets(db, tenant_id) == {
        ("tenant/photo", "image"),
        ("tenant/cv.pdf", "raw"),
    }


def test_cloudinary_not_found_is_idempotent(monkeypatch):
    destroy = MagicMock(return_value={"result": "not found"})
    monkeypatch.setattr("cloudinary.uploader.destroy", destroy)
    monkeypatch.setattr("ingest._configure_cloudinary", lambda: None)

    assert _delete_cloudinary_assets({("tenant/cv", "raw")}) == 1
    destroy.assert_called_once_with("tenant/cv", resource_type="raw", invalidate=True)


def test_cloudinary_provider_error_stops_purge(monkeypatch):
    monkeypatch.setattr("cloudinary.uploader.destroy", lambda *args, **kwargs: {"result": "error"})
    monkeypatch.setattr("ingest._configure_cloudinary", lambda: None)

    with pytest.raises(RuntimeError):
        _delete_cloudinary_assets({("tenant/cv", "raw")})
