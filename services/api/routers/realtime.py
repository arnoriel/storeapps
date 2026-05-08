import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

from core.redis import get_redis
from core.security import decode_token

logger = logging.getLogger(__name__)

router = APIRouter(tags=["realtime"])


# ─── SSE — Customer Payment Status ────────────────────────────────────────────

@router.get("/api/v1/stream/payment/{order_number}")
async def payment_stream(order_number: str):
    async def event_generator():
        redis = await get_redis()
        pubsub = redis.pubsub()
        await pubsub.subscribe(f"payment:{order_number}")
        logger.info(f"SSE subscribed: payment:{order_number}")

        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    yield f"data: {json.dumps(data)}\n\n"

                    # Tutup stream setelah PAID atau FAILED
                    if data.get("paid_status") in ("PAID", "FAILED"):
                        logger.info(f"SSE closing for {order_number}: {data['paid_status']}")
                        break
        except Exception as e:
            logger.error(f"SSE error for {order_number}: {e}")
        finally:
            await pubsub.unsubscribe(f"payment:{order_number}")
            logger.info(f"SSE unsubscribed: payment:{order_number}")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ─── WebSocket — Dashboard Owner ──────────────────────────────────────────────

@router.websocket("/api/v1/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection accepted")

    # Auth via first message — bukan query param
    try:
        auth_raw = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
        auth_data = json.loads(auth_raw)
        token = auth_data.get("token", "")
    except asyncio.TimeoutError:
        logger.warning("WebSocket auth timeout")
        await websocket.close(code=1008)
        return
    except (json.JSONDecodeError, Exception) as e:
        logger.warning(f"WebSocket auth parse error: {e}")
        await websocket.close(code=1008)
        return

    # Verify JWT
    payload = decode_token(token)
    if not payload:
        logger.warning("WebSocket invalid token")
        await websocket.close(code=1008)
        return

    user_id = payload.get("sub")
    role = payload.get("role")
    logger.info(f"WebSocket authenticated: user={user_id}, role={role}")

    # Konfirmasi auth berhasil ke client
    await websocket.send_text(json.dumps({"type": "auth_success", "role": role}))

    # Subscribe ke Redis channels
    redis = await get_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe("orders:new", "orders:updated")
    logger.info(f"WebSocket subscribed: orders:new, orders:updated")

    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                await websocket.send_text(message["data"])
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: user={user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await pubsub.unsubscribe("orders:new", "orders:updated")
        logger.info(f"WebSocket unsubscribed: user={user_id}")