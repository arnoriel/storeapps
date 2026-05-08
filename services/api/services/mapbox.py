import httpx
from core.config import settings


async def reverse_geocode(lat: float, lng: float) -> dict:
    """Konversi koordinat → nama kota untuk RajaOngkir city lookup."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.json",
            params={
                "access_token": settings.MAPBOX_TOKEN,
                "types": "place",
                "language": "id",
            },
        )
        response.raise_for_status()
        features = response.json().get("features", [])
        if features:
            return {
                "city_name": features[0]["text"],
                "full_name": features[0]["place_name"],
            }
        return {"city_name": None, "full_name": None}