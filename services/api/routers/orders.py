import asyncio
import uuid

from core.dependencies import get_current_user
from schemas.order import OrderStatusUpdate
from core.redis import get_redis
from core.dependencies import get_current_user, require_role
from services.events import publish_order_event
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.order import Order
from models.product import Product
from models.user import User
from schemas.order import (
    OrderCreate,
    OrderCreateResponse,
    OrderStatusResponse,
    PaymentLinkResponse,
)
from services.hitpay import create_payment
from services.order_service import generate_order_number

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])


@router.post("", response_model=OrderCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),  # tambah ini
):
    # 1. Lock produk dengan SELECT FOR UPDATE — atomic stock check
    result = await db.execute(
        select(Product)
        .where(Product.id == body.product_id, Product.is_active == True)
        .with_for_update()
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produk tidak ditemukan",
        )

    if product.stock < body.quantity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Stok tidak cukup. Tersisa: {product.stock}",
        )

    # 2. Decrement stock
    product.stock -= body.quantity

    # 3. Generate order number unik
    order_number = generate_order_number()

    # 4. Buat order dengan status PENDING
    order = Order(
        order_number=order_number,
        product_id=body.product_id,
        quantity=body.quantity,
        customer_name=body.customer_name,
        customer_phone=body.customer_phone,
        customer_email=body.customer_email,
        customer_address=body.customer_address,
        customer_location=body.customer_location,
        shipping_cost=body.shipping_cost,
        shipping_courier=body.shipping_courier,
        total_amount=body.total_amount,
        order_status="PENDING",
        paid_status="UNPAID",
    )
    db.add(order)
    await db.flush()  # Flush dulu untuk dapat order.id

    # 5. Hit HitPay API
    try:
        hitpay_response = await create_payment(
            order_number=order_number,
            amount=body.total_amount,
            email=body.customer_email,
            name=body.customer_name,
        )
        order.hitpay_payment_id = hitpay_response.get("id")
        order.hitpay_payment_url = hitpay_response.get("url")

    except Exception as e:
        print(f"HitPay error: {type(e).__name__}: {e}")  # tambah ini
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gagal membuat payment link. Silakan coba lagi.",
        )

    # 6. Commit semua perubahan
    await db.commit()

    asyncio.create_task(
        publish_order_event(
            channel="orders:new",
            order_number=order_number,
            customer_name=body.customer_name,
            total_amount=body.total_amount,
            order_status="PENDING",
            paid_status="UNPAID",
            redis=redis,
        )
    )

    return OrderCreateResponse(
        order_number=order_number,
        payment_url=order.hitpay_payment_url,
        total_amount=body.total_amount,
    )


@router.get("/{order_number}", response_model=OrderStatusResponse)
async def get_order(
    order_number: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order).where(Order.order_number == order_number)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order tidak ditemukan",
        )

    return order


@router.get("/{order_number}/payment-link", response_model=PaymentLinkResponse)
async def get_payment_link(
    order_number: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order).where(Order.order_number == order_number)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order tidak ditemukan",
        )

    return PaymentLinkResponse(
        order_number=order.order_number,
        payment_url=order.hitpay_payment_url,
        paid_status=order.paid_status,
    )

@router.put("/{order_id}/status", response_model=OrderStatusResponse)
async def update_order_status(
    order_id: uuid.UUID,
    body: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order tidak ditemukan",
        )

    order.order_status = body.order_status
    await db.commit()
    await db.refresh(order)

    # Publish ke Redis — fire-and-forget
    asyncio.create_task(
        publish_order_event(
            channel="orders:updated",
            order_number=order.order_number,
            customer_name=order.customer_name,
            total_amount=float(order.total_amount),
            order_status=order.order_status,
            paid_status=order.paid_status,
            redis=redis,
        )
    )

    return order

@router.patch("/{order_id}/claim", response_model=OrderStatusResponse)
async def claim_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order tidak ditemukan",
        )

    if order.handled_by_id is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order sudah di-claim",
        )

    order.handled_by_id = current_user.id
    await db.commit()
    await db.refresh(order)
    return order

@router.get("", response_model=list[OrderStatusResponse])
async def list_orders(
    order_status: str | None = None,
    paid_status: str | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import or_, desc

    query = select(Order)

    # Filter berdasarkan role
    if current_user.role == "BRANCH":
        query = query.where(
            or_(
                Order.handled_by_id == current_user.id,
                Order.handled_by_id == None,
            )
        )

    if order_status:
        query = query.where(Order.order_status == order_status)

    if paid_status:
        query = query.where(Order.paid_status == paid_status)

    if search:
        query = query.where(
            or_(
                Order.order_number.ilike(f"%{search}%"),
                Order.customer_name.ilike(f"%{search}%"),
                Order.customer_email.ilike(f"%{search}%"),
            )
        )

    query = query.order_by(desc(Order.created_at))
    query = query.offset((page - 1) * limit).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()