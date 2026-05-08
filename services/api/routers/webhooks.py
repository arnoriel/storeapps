import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.config import settings
from core.redis import get_redis
from models.order import Order
from models.user import User
from services.events import publish_order_new_event, publish_payment_event
from services.hitpay import verify_webhook

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])


@router.post("/hitpay", status_code=status.HTTP_200_OK)
async def hitpay_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
):
    # 1. Parse form data dari HitPay
    try:
        form_data = await request.form()
        payload = dict(form_data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request body")

    logger.info(f"HitPay webhook received: {payload}")

    # 2. Verifikasi HMAC-SHA256
    # received_hmac = payload.get("hmac", "")
    # if not verify_webhook(payload, received_hmac):
    #     logger.warning(f"HitPay webhook HMAC verification failed: {payload}")
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Invalid HMAC signature",
    #     )

    #2. Verifikasi HMAC-SHA256 (skip di development)
    received_hmac = payload.get("hmac", "")
    if settings.APP_ENV != "development" and not verify_webhook(payload, received_hmac):
        logger.warning(f"HitPay webhook HMAC verification failed")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid HMAC signature",
        )

    # 3. Ambil data dari payload
    reference_number = payload.get("reference_number", "")
    payment_status = payload.get("status", "")

    if not reference_number:
        raise HTTPException(status_code=400, detail="Missing reference_number")

    # 4. Cari order di DB
    result = await db.execute(
        select(Order).where(Order.order_number == reference_number)
    )
    order = result.scalar_one_or_none()

    if not order:
        logger.warning(f"Order not found for reference: {reference_number}")
        # Return 200 supaya HitPay tidak retry terus
        return {"status": "ignored", "reason": "order not found"}

    # 5. Idempotency check — skip jika sudah PAID/FAILED
    if order.paid_status in ("PAID", "FAILED"):
        logger.info(f"Webhook already processed for {reference_number}, skipping")
        return {"status": "already_processed"}

    # 6. Update status berdasarkan payment_status dari HitPay
    if payment_status == "completed":
        order.paid_status = "PAID"
        order.order_status = "CONFIRMED"

        # Update omzet + orders_count ADMIN
        admin_result = await db.execute(
            select(User).where(User.role == "ADMIN").limit(1)
        )
        admin = admin_result.scalar_one_or_none()
        if admin:
            admin.omzet_totals = float(admin.omzet_totals) + float(order.total_amount)
            admin.orders_count = admin.orders_count + 1

        await db.commit()

        logger.info(f"Order {reference_number} marked as PAID")

        # 7. Publish events ke Redis
        await publish_payment_event(reference_number, "PAID", redis)
        await publish_order_new_event(
            {
                "order_number": reference_number,
                "paid_status": "PAID",
                "order_status": "CONFIRMED",
                "total_amount": float(order.total_amount),
                "customer_name": order.customer_name,
            },
            redis,
        )

    elif payment_status in ("failed", "expired"):
        order.paid_status = "FAILED"
        await db.commit()

        logger.info(f"Order {reference_number} marked as FAILED")

        await publish_payment_event(reference_number, "FAILED", redis)

    else:
        logger.info(f"Unhandled payment status: {payment_status} for {reference_number}")

    return {"status": "ok"}