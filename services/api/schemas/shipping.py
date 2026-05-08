import uuid
from pydantic import BaseModel, field_validator


class ShippingCheckRequest(BaseModel):
    destination_lat: float
    destination_lng: float
    product_id: uuid.UUID

    @field_validator("destination_lat")
    @classmethod
    def validate_lat(cls, v: float) -> float:
        if not -90 <= v <= 90:
            raise ValueError("Latitude tidak valid")
        return v

    @field_validator("destination_lng")
    @classmethod
    def validate_lng(cls, v: float) -> float:
        if not -180 <= v <= 180:
            raise ValueError("Longitude tidak valid")
        return v


class ShippingCostDetail(BaseModel):
    service: str        # REG, YES, OKE, dll
    description: str
    cost: int           # dalam Rupiah
    etd: str            # estimasi hari


class ShippingOption(BaseModel):
    courier: str        # JNE, J&T, SiCepat
    courier_code: str   # jne, jnt, sicepat
    services: list[ShippingCostDetail]


class ShippingCheckResponse(BaseModel):
    destination_city: str
    origin_city: str
    weight_grams: int
    options: list[ShippingOption]