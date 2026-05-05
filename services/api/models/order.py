from datetime import datetime, timezone
import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    order_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)

    # Produk
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    # Customer
    customer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(100), nullable=False)
    customer_location: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    customer_address: Mapped[str] = mapped_column(Text, nullable=False)

    # Pengiriman
    shipping_cost: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    shipping_courier: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Total
    total_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)

    # Status
    order_status: Mapped[str] = mapped_column(String(30), default="PENDING")
    paid_status: Mapped[str] = mapped_column(String(20), default="UNPAID")

    # HitPay
    hitpay_payment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    hitpay_payment_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Refund (v2.0 — field disiapkan, fitur belum diimplementasi)
    is_refunded: Mapped[bool] = mapped_column(Boolean, default=False)
    refund_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Handler cabang
    handled_by_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    product: Mapped["Product"] = relationship()
    handled_by: Mapped["User | None"] = relationship(back_populates="orders")