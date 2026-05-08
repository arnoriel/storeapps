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