import io
import time
import uuid

from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError
from supabase import create_client

from core.config import settings

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
BUCKET_NAME = "product-images"


def _get_supabase_client():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


async def upload_product_image(file: UploadFile, product_id: uuid.UUID) -> str:
    # Validasi mime type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format file tidak didukung. Gunakan JPG, PNG, atau WebP.",
        )

    # Baca file
    contents = await file.read()

    # Validasi ukuran
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ukuran file maksimal 5MB.",
        )

    # Convert ke WebP dengan Pillow
    try:
        image = Image.open(io.BytesIO(contents))
    except UnidentifiedImageError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File bukan gambar yang valid atau format tidak didukung.",
        )

    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    webp_buffer = io.BytesIO()
    image.save(webp_buffer, format="WEBP", quality=85)
    webp_buffer.seek(0)
    webp_bytes = webp_buffer.read()

    # Generate nama file unik
    timestamp = int(time.time())
    file_name = f"{product_id}-{timestamp}.webp"

    # Upload ke Supabase Storage
    supabase = _get_supabase_client()
    try:
        supabase.storage.from_(BUCKET_NAME).upload(
            path=file_name,
            file=webp_bytes,
            file_options={"content-type": "image/webp", "upsert": "true"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengupload gambar ke storage: {str(e)}",
        )

    # Return URL publik
    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_name)
    return public_url