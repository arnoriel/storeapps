import uuid
from datetime import datetime
from pydantic import BaseModel, field_validator


class ProductCreate(BaseModel):
    product_name: str
    product_description: str | None = None
    price: float
    stock: int = 0
    weight_grams: int = 500
    image_url: str | None = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Harga harus lebih dari 0")
        return v

    @field_validator("stock")
    @classmethod
    def stock_must_be_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Stock tidak boleh negatif")
        return v

    @field_validator("weight_grams")
    @classmethod
    def weight_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Berat harus lebih dari 0")
        return v


class ProductUpdate(BaseModel):
    product_name: str | None = None
    product_description: str | None = None
    price: float | None = None
    stock: int | None = None
    weight_grams: int | None = None
    image_url: str | None = None
    is_active: bool | None = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v: float | None) -> float | None:
        if v is not None and v <= 0:
            raise ValueError("Harga harus lebih dari 0")
        return v

    @field_validator("stock")
    @classmethod
    def stock_must_be_non_negative(cls, v: int | None) -> int | None:
        if v is not None and v < 0:
            raise ValueError("Stock tidak boleh negatif")
        return v

    @field_validator("weight_grams")
    @classmethod
    def weight_must_be_positive(cls, v: int | None) -> int | None:
        if v is not None and v <= 0:
            raise ValueError("Berat harus lebih dari 0")
        return v


class ProductStockUpdate(BaseModel):
    stock: int

    @field_validator("stock")
    @classmethod
    def stock_must_be_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Stock tidak boleh negatif")
        return v


class ProductResponse(BaseModel):
    id: uuid.UUID
    product_name: str
    product_description: str | None
    price: float
    stock: int
    weight_grams: int
    image_url: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int