from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # App
    APP_ENV: str = "development"
    STORE_NAME: str = "My Store"
    CURRENCY: str = "IDR"
    API_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    SECRET_KEY: str
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str

    # HitPay
    HITPAY_API_KEY: str
    HITPAY_SALT: str

    # RajaOngkir
    RAJAONGKIR_API_KEY: str

    # Mapbox
    MAPBOX_TOKEN: str

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str


settings = Settings()