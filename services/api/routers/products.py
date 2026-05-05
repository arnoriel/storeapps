import math
import uuid

from fastapi import File, UploadFile, APIRouter, Depends, HTTPException, Query, status
from services.storage import upload_product_image
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_user
from models.product import Product
from models.user import User
from schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductStockUpdate,
    ProductUpdate,
)

router = APIRouter(prefix="/api/v1/products", tags=["products"])


# ─── PUBLIC ───────────────────────────────────────────────────────────────────

@router.get("", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit

    count_result = await db.execute(
        select(func.count()).select_from(Product).where(Product.is_active == True)
    )
    total = count_result.scalar_one()

    result = await db.execute(
        select(Product)
        .where(Product.is_active == True)
        .order_by(Product.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    products = result.scalars().all()

    return ProductListResponse(
        items=products,
        total=total,
        page=page,
        limit=limit,
        total_pages=math.ceil(total / limit) if total > 0 else 1,
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.is_active == True)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produk tidak ditemukan")
    return product

@router.post("/{product_id}/image", response_model=ProductResponse)
async def upload_image(
    product_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produk tidak ditemukan",
        )

    image_url = await upload_product_image(file, product_id)
    product.image_url = image_url

    await db.flush()
    await db.refresh(product)
    return product

# ─── PROTECTED ────────────────────────────────────────────────────────────────

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    body: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    product = Product(**body.model_dump())
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: uuid.UUID,
    body: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produk tidak ditemukan")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    await db.flush()
    await db.refresh(product)
    return product


@router.patch("/{product_id}/stock", response_model=ProductResponse)
async def update_stock(
    product_id: uuid.UUID,
    body: ProductStockUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produk tidak ditemukan")

    product.stock = body.stock
    await db.flush()
    await db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
async def delete_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produk tidak ditemukan")

    product.is_active = False
    await db.flush()
    return {"message": "Produk berhasil dihapus"}