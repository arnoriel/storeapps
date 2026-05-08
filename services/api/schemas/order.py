import uuid
from datetime import datetime
from pydantic import BaseModel, field_validator


class OrderCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = 1
    customer_name: str
    customer_phone: str
    customer_email: str
    customer_address: str
    customer_location: dict | None = None
    shipping_cost: float
    shipping_courier: str
    total_amount: float

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Quantity minimal 1")
        return v

    @field_validator("shipping_cost", "total_amount")
    @classmethod
    def amount_must_be_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Nilai tidak boleh negatif")
        return v


class OrderCreateResponse(BaseModel):
    order_number: str
    payment_url: str
    total_amount: float


class OrderStatusResponse(BaseModel):
    order_number: str
    order_status: str
    paid_status: str
    product_id: uuid.UUID
    quantity: int
    customer_name: str
    customer_email: str
    shipping_courier: str | None
    shipping_cost: float
    total_amount: float
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentLinkResponse(BaseModel):
    order_number: str
    payment_url: str | None
    paid_status: str