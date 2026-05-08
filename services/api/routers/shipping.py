from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.product import Product
from models.user import User
from schemas.shipping import (
    ShippingCheckRequest,
    ShippingCheckResponse,
    ShippingCostDetail,
    ShippingOption,
)
from services.mapbox import reverse_geocode
from services.rajaongkir import check_ongkir, search_destination

router = APIRouter(prefix="/api/v1/shipping", tags=["shipping"])

COURIER_NAMES = {
    "jne": "JNE",
    "jnt": "J&T Express",
    "sicepat": "SiCepat",
}


@router.post("/check", response_model=ShippingCheckResponse)
async def check_shipping(
    body: ShippingCheckRequest,
    db: AsyncSession = Depends(get_db),
):
    # 1. Ambil produk dari DB
    product_result = await db.execute(
        select(Product).where(Product.id == body.product_id, Product.is_active == True)
    )
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produk tidak ditemukan",
        )

    # 2. Ambil store_location dari user ADMIN
    admin_result = await db.execute(
        select(User).where(User.role == "ADMIN").limit(1)
    )
    admin = admin_result.scalar_one_or_none()
    if not admin or not admin.store_location:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Lokasi toko belum dikonfigurasi",
        )

    origin_lat = admin.store_location["lat"]
    origin_lng = admin.store_location["lng"]

    # 3. Reverse geocode origin dan destination
    origin_geo = await reverse_geocode(origin_lat, origin_lng)
    destination_geo = await reverse_geocode(body.destination_lat, body.destination_lng)

    if not origin_geo["city_name"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Kota asal tidak ditemukan",
        )

    if not destination_geo["city_name"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Kota tujuan tidak ditemukan",
        )

    # 4. Lookup city_id dari RajaOngkir (dengan Redis cache)
    origin_dest = await search_destination(origin_geo["city_name"])
    destination_dest = await search_destination(destination_geo["city_name"])

    if not origin_dest:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Kota asal '{origin_geo['city_name']}' tidak ditemukan di RajaOngkir",
        )

    if not destination_dest:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Kota tujuan '{destination_geo['city_name']}' tidak ditemukan di RajaOngkir",
        )

    results = await check_ongkir(
        origin_id=origin_dest["id"],
        destination_id=destination_dest["id"],
        weight_grams=product.weight_grams,
    )

    # 6. Parse response RajaOngkir
    options: list[ShippingOption] = []
    for courier_result in results:
        courier_code = courier_result["code"].lower()
        services: list[ShippingCostDetail] = []

        for cost_item in courier_result["costs"]:
            # V2 format: cost langsung integer, bukan array
            cost_value = cost_item["cost"] if isinstance(cost_item["cost"], int) else cost_item["cost"][0]["value"]
            etd = cost_item.get("etd") or cost_item.get("estimated_delivery") or "-"

            services.append(
                ShippingCostDetail(
                    service=cost_item.get("service", ""),
                    description=cost_item.get("description", ""),
                    cost=cost_value,
                    etd=str(etd),
                )
            )

        options.append(
            ShippingOption(
                courier=COURIER_NAMES.get(courier_code, courier_result["name"]),
                courier_code=courier_code,
                services=services,
            )
        )

    return ShippingCheckResponse(
        destination_city=destination_geo["city_name"],
        origin_city=origin_geo["city_name"],
        weight_grams=product.weight_grams,
        options=options,
    )