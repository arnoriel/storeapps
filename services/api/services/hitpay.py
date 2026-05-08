import hashlib
import hmac

import httpx

from core.config import settings

HITPAY_BASE = "https://api.sandbox.hit-pay.com/v1"
# Ganti ke https://api.hit-pay.com/v1 saat production


async def create_payment(
    order_number: str, amount: float, email: str, name: str
) -> dict:
    async with httpx.AsyncClient(timeout=30.0) as client:
        payload = {
            "amount": f"{amount:.2f}",
            "currency": settings.CURRENCY,
            "email": email,
            "name": name,
            "reference_number": order_number,
            "redirect_url": f"{settings.FRONTEND_URL}/orders/{order_number}",
        }

        if "localhost" not in settings.API_URL:
            payload["webhook"] = f"{settings.API_URL}/api/v1/webhooks/hitpay"

        response = await client.post(
            f"{HITPAY_BASE}/payment-requests",
            headers={"X-BUSINESS-API-KEY": settings.HITPAY_API_KEY},
            json=payload,
        )
        print(f"HitPay response body: {response.text}")
        response.raise_for_status()
        return response.json()


def verify_webhook(payload: dict, received_hmac: str) -> bool:
    sorted_payload = "&".join(
        f"{k}={v}" for k, v in sorted(payload.items()) if k != "hmac"
    )
    expected = hmac.new(
        settings.HITPAY_SALT.encode(),
        sorted_payload.encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, received_hmac)