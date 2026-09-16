"""
Application configuration.

All configuration is loaded from environment variables (via .env in
development). Nothing sensitive is hardcoded, and nothing here is ever
exposed to the frontend directly -- the frontend only ever talks to our
own API, never reads this file.
"""
from functools import lru_cache
from typing import List, Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Core ---
    ENV: Literal["development", "staging", "production"] = "development"
    APP_NAME: str = "LifeOS"
    DEBUG: bool = False

    # --- Security ---
    # 64+ char random secret. Used to sign/verify server-side session tokens.
    SECRET_KEY: str = Field(..., min_length=32)
    SESSION_COOKIE_NAME: str = "lifeos_session"
    SESSION_TTL_SECONDS: int = 60 * 60 * 24 * 14  # 14 days
    SESSION_COOKIE_SECURE: bool = True
    SESSION_COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"

    # Account lockout / brute force protection
    MAX_LOGIN_ATTEMPTS: int = 5
    LOGIN_LOCKOUT_SECONDS: int = 15 * 60

    # --- Database ---
    DATABASE_URL: str = Field(
        ..., description="postgresql+psycopg://user:pass@host:5432/lifeos"
    )
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # --- Redis (rate limiting, background jobs, caching) ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- CORS ---
    FRONTEND_ORIGINS: List[str] = ["http://localhost:3000"]

    # Base URL of the frontend, used to build links in emails (password
    # reset, verification). Must not have a trailing slash.
    FRONTEND_URL: str = "http://localhost:3000"

    @field_validator("FRONTEND_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # --- Email (optional until configured) ---
    EMAIL_HOST: str | None = None
    EMAIL_PORT: int | None = None
    EMAIL_USERNAME: str | None = None
    EMAIL_PASSWORD: str | None = None
    EMAIL_FROM: str = "no-reply@lifeos.local"

    @property
    def email_configured(self) -> bool:
        return bool(self.EMAIL_HOST and self.EMAIL_USERNAME and self.EMAIL_PASSWORD)

    # --- AI provider (optional until configured) ---
    AI_API_KEY: str | None = None
    AI_MODEL: str = "claude-sonnet-4-6"

    @property
    def ai_configured(self) -> bool:
        return bool(self.AI_API_KEY)

    # --- Speech providers (optional until configured) ---
    STT_PROVIDER_API_KEY: str | None = None
    TTS_PROVIDER_API_KEY: str | None = None

    @property
    def voice_configured(self) -> bool:
        return bool(self.STT_PROVIDER_API_KEY and self.TTS_PROVIDER_API_KEY and self.ai_configured)

    # --- Rate limiting defaults (requests per window per IP or user) ---
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/minute"
    RATE_LIMIT_CONTACT: str = "3/minute"
    RATE_LIMIT_AI: str = "20/minute"
    RATE_LIMIT_DEFAULT: str = "100/minute"


@lru_cache
def get_settings() -> "Settings":
    return Settings()
