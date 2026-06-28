"""
Application configuration loaded from environment variables.

All required fields raise a ValidationError at startup if missing.
Optional future-module fields default to None and are validated lazily
when their milestone is activated.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional


class Settings(BaseSettings):
    # ── Database ────────────────────────────────────────────────────
    database_url: str
    postgres_db: str = "chrono_db"
    postgres_user: str = "chrono_user"
    postgres_password: str = "chrono_pass"

    # ── Clerk ───────────────────────────────────────────────────────
    clerk_jwks_url: str

    # ── Application ─────────────────────────────────────────────────
    frontend_url: str
    environment: str = "development"

    # ── [FUTURE M3] AI ──────────────────────────────────────────────
    gemini_api_key: Optional[str] = None

    # ── [FUTURE M3] Redis ───────────────────────────────────────────
    redis_url: Optional[str] = None

    # ── [FUTURE M3] Email ───────────────────────────────────────────
    sendgrid_api_key: Optional[str] = None

    # ── [FUTURE M4] Observability ───────────────────────────────────
    sentry_dsn: Optional[str] = None
    datadog_api_key: Optional[str] = None

    # ── [FUTURE M5] Collaboration / Storage ─────────────────────────
    ably_api_key: Optional[str] = None
    cloudinary_url: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def is_production(self) -> bool:
        """True when running in a production environment."""
        return self.environment.lower() == "production"

    @field_validator("frontend_url")
    @classmethod
    def strip_trailing_slash(cls, v: str) -> str:
        """Ensure CORS origin has no trailing slash."""
        return v.rstrip("/")


# Module-level singleton — imported everywhere as `from src.core.config import settings`
settings = Settings()  # type: ignore[call-arg]
