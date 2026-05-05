from datetime import datetime, timezone
import uuid

from sqlalchemy import Boolean, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    store_location: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    store_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    omzet_totals: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    refund_totals: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    orders_count: Mapped[int] = mapped_column(Integer, default=0)
    role: Mapped[str] = mapped_column(String(20), default="BRANCH")
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )

    orders: Mapped[list["Order"]] = relationship(back_populates="handled_by")