import json
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_user
from core.redis import get_redis
from models.order import Order
from models.product import Product
from models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

STATS_CACHE_TTL = 300  # 5 menit


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
    current_user: User = Depends(get_current_user),
):
    cache_key = f"dashboard:stats:{current_user.id}"

    # Cek cache Redis
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    seven_days_ago = now - timedelta(days=7)
    twenty_eight_days_ago = now - timedelta(days=28)

    # Base filter berdasarkan role
    def base_filter():
        if current_user.role == "BRANCH":
            return Order.handled_by_id == current_user.id
        return None  # ADMIN lihat semua

    # Omzet bulan ini
    omzet_query = select(func.coalesce(func.sum(Order.total_amount), 0)).where(
        Order.paid_status == "PAID",
        Order.created_at >= start_of_month,
    )
    if current_user.role == "BRANCH":
        omzet_query = omzet_query.where(Order.handled_by_id == current_user.id)
    omzet_result = await db.execute(omzet_query)
    omzet_this_month = float(omzet_result.scalar_one())

    # Order bulan ini
    orders_query = select(func.count(Order.id)).where(
        Order.created_at >= start_of_month,
    )
    if current_user.role == "BRANCH":
        orders_query = orders_query.where(Order.handled_by_id == current_user.id)
    orders_result = await db.execute(orders_query)
    orders_this_month = orders_result.scalar_one()

    # Total refund (placeholder — v2.0)
    total_refunds = 0.0
    if current_user.role == "ADMIN":
        admin_result = await db.execute(
            select(User.refund_totals).where(User.role == "ADMIN").limit(1)
        )
        total_refunds = float(admin_result.scalar_one() or 0)

    # Produk aktif (ADMIN only)
    active_products = 0
    if current_user.role == "ADMIN":
        products_result = await db.execute(
            select(func.count(Product.id)).where(Product.is_active == True)
        )
        active_products = products_result.scalar_one()

    # Orders per hari — 7 hari terakhir
    orders_per_day = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        q = select(func.count(Order.id)).where(
            and_(Order.created_at >= day_start, Order.created_at < day_end)
        )
        if current_user.role == "BRANCH":
            q = q.where(Order.handled_by_id == current_user.id)

        result = await db.execute(q)
        orders_per_day.append({
            "date": day.strftime("%d/%m"),
            "count": result.scalar_one(),
        })

    # Revenue per minggu — 4 minggu terakhir
    revenue_per_week = []
    for i in range(3, -1, -1):
        week_start = now - timedelta(days=(i + 1) * 7)
        week_end = now - timedelta(days=i * 7)

        q = select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            and_(
                Order.created_at >= week_start,
                Order.created_at < week_end,
                Order.paid_status == "PAID",
            )
        )
        if current_user.role == "BRANCH":
            q = q.where(Order.handled_by_id == current_user.id)

        result = await db.execute(q)
        revenue_per_week.append({
            "week": f"W{4 - i}",
            "amount": float(result.scalar_one()),
        })

    stats = {
        "omzet_this_month": omzet_this_month,
        "orders_this_month": orders_this_month,
        "total_refunds": total_refunds,
        "active_products": active_products,
        "orders_per_day": orders_per_day,
        "revenue_per_week": revenue_per_week,
    }

    # Cache ke Redis
    await redis.setex(cache_key, STATS_CACHE_TTL, json.dumps(stats))

    return stats