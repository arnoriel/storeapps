import json
import logging
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)


async def publish_event(channel: str, payload: dict[str, Any], redis) -> None:
    """Publish event ke Redis channel."""
    try:
        await redis.publish(channel, json.dumps(payload))
        logger.info(f"Published to {channel}: {payload}")
    except Exception as e:
        logger.error(f"Failed to publish to {channel}: {e}")


async def publish_payment_event(order_number: str, paid_status: str, redis) -> None:
    """Publish payment status update ke customer SSE."""
    await publish_event(
        channel=f"payment:{order_number}",
        payload={"order_number": order_number, "paid_status": paid_status},
        redis=redis,
    )


async def publish_order_new_event(order: dict[str, Any], redis) -> None:
    """Publish new order event ke dashboard WebSocket."""
    await publish_event(
        channel="orders:new",
        payload=order,
        redis=redis,
    )


async def publish_order_event(
    channel: str,
    order_number: str,
    customer_name: str,
    total_amount: float,
    order_status: str,
    paid_status: str,
    redis,
) -> None:
    """Publish order event dengan payload standar."""
    await publish_event(
        channel=channel,
        payload={
            "order_number": order_number,
            "customer_name": customer_name,
            "total_amount": total_amount,
            "order_status": order_status,
            "paid_status": paid_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        redis=redis,
    )