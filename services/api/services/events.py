import json
from typing import Any


async def publish_event(channel: str, payload: dict[str, Any], redis) -> None:
    """Publish event ke Redis channel."""
    await redis.publish(channel, json.dumps(payload))


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