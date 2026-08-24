from unittest.mock import MagicMock

import pytest
from starlette.requests import Request

from app.api import billing
from app.core.config import settings


def _request(body: bytes = b"signed-payload") -> Request:
    consumed = False

    async def receive():
        nonlocal consumed
        if consumed:
            return {"type": "http.disconnect"}
        consumed = True
        return {"type": "http.request", "body": body, "more_body": False}

    return Request(
        {"type": "http", "headers": [], "query_string": b""}, receive=receive
    )


@pytest.mark.asyncio
async def test_checkout_webhook_updates_tenant_and_is_idempotent(monkeypatch):
    event = {
        "id": "evt_test_checkout_1",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "client_reference_id": "tenant-1",
                "customer": "cus_123",
                "subscription": "sub_123",
            }
        },
    }
    tenant = MagicMock()
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = tenant
    monkeypatch.setattr(settings, "STRIPE_WEBHOOK_SECRET", "whsec_test")
    monkeypatch.setattr(billing.stripe.Webhook, "construct_event", lambda *args: event)
    billing._processed_stripe_events.clear()
    first = await billing.stripe_webhook(_request(), db)
    second = await billing.stripe_webhook(_request(), db)

    assert first == {"status": "success"}
    assert second["message"] == "Event already processed"
    assert tenant.stripe_customer_id == "cus_123"
    assert tenant.stripe_subscription_id == "sub_123"
    assert tenant.plan_name == "pro"
    assert tenant.candidate_count_limit == billing.PLAN_LIMITS["pro"]
    assert db.commit.call_count == 1


@pytest.mark.asyncio
async def test_webhook_is_unavailable_without_secret(monkeypatch):
    monkeypatch.setattr(settings, "STRIPE_WEBHOOK_SECRET", "")

    with pytest.raises(Exception) as error:
        await billing.stripe_webhook(_request(), MagicMock())

    assert error.value.status_code == 503
