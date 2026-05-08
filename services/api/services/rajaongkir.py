import httpx
from core.config import settings
from core.redis import get_redis

RAJAONGKIR_BASE = "https://rajaongkir.komerce.id/api/v1"
CITY_CACHE_TTL = 86400  # 24 jam


async def search_destination(city_name: str) -> dict | None:
    """Cari destination ID dari nama kota. Cache di Redis TTL 24 jam."""
    redis = await get_redis()
    cache_key = f"rajaongkir:dest:{city_name.lower()}"

    cached = await redis.get(cache_key)
    if cached:
        return {"id": cached, "name": city_name}

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{RAJAONGKIR_BASE}/destination/domestic-destination",
            headers={"key": settings.RAJAONGKIR_API_KEY},
            params={
                "search": city_name,
                "limit": 10,
                "offset": 0,
            },
        )
        response.raise_for_status()
        data = response.json()

    results = data.get("data", [])
    if not results:
        return None

    # Ambil match pertama
    match = results[0]
    dest_id = str(match["id"])

    await redis.setex(cache_key, CITY_CACHE_TTL, dest_id)
    return {"id": dest_id, "name": match.get("district_name") or match.get("city_name") or city_name}


async def check_ongkir(
    origin_id: str,
    destination_id: str,
    weight_grams: int,
    couriers: list[str] = ["jne", "jnt", "sicepat"],
) -> list[dict]:
    """Cek ongkir — satu request per kurir, compile jadi list."""
    all_results = []

    async with httpx.AsyncClient() as client:
        for courier in couriers:
            try:
                response = await client.post(
                    f"{RAJAONGKIR_BASE}/calculate/domestic-cost",
                    headers={
                        "key": settings.RAJAONGKIR_API_KEY,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    data={
                        "origin": origin_id,
                        "destination": destination_id,
                        "weight": weight_grams,
                        "courier": courier,
                        "price": "lowest",
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("data", [])
                    if results:
                        all_results.append({
                            "code": courier,
                            "name": courier.upper(),
                            "costs": results,
                        })
            except Exception:
                continue

    return all_results