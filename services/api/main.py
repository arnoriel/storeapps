from contextlib import asynccontextmanager
from routers.products import router as products_router
from routers.shipping import router as shipping_router
from routers.orders import router as orders_router
from routers.webhooks import router as webhooks_router

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.redis import close_redis
from routers.auth import router as auth_router  


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_redis()


app = FastAPI(
    title=settings.STORE_NAME,
    version="1.0.0",
    docs_url=None if settings.APP_ENV == "production" else "/docs",
    redoc_url=None if settings.APP_ENV == "production" else "/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "env": settings.APP_ENV}


app.include_router(auth_router)
app.include_router(products_router)
app.include_router(shipping_router)
app.include_router(orders_router)
app.include_router(webhooks_router)