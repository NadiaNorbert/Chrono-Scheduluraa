"""
Chrono Schedulura — FastAPI application factory.

create_app() wires together all middleware, routers, and lifecycle hooks.
The module-level `app` instance is what uvicorn imports.
"""

import logging
import traceback
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.core.config import settings
from src.core.logging import configure_logging, get_logger
from src.core.monitoring import instrument_app
from src.api.v1.router import api_v1_router

logger = get_logger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Application lifespan manager.

    Startup:  configure logging, prefetch JWKS keys.
    Shutdown: future workers register their stop() hooks here.
    """
    configure_logging(level="DEBUG" if not settings.is_production else "INFO")
    logger.info("Chrono Schedulura API starting (env=%s)", settings.environment)

    # Prefetch Clerk JWKS so the first request isn't slow
    try:
        from src.core.security import get_jwks
        await get_jwks()
    except Exception:
        logger.warning("Could not prefetch JWKS on startup — will retry on first request")

    yield

    # [FUTURE M3] await scheduler_worker.stop()
    # [FUTURE M3] await notification_worker.stop()
    logger.info("Chrono Schedulura API shutting down")


# ── Exception handler ─────────────────────────────────────────────────────────
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler — logs full traceback and returns a safe 500 response."""
    logger.error("Unhandled exception on %s %s\n%s", request.method, request.url, traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "code": "INTERNAL_ERROR"},
    )


# ── App factory ───────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    """
    Build and configure the FastAPI application.

    Returns:
        A fully configured FastAPI instance ready for uvicorn.
    """
    app = FastAPI(
        title="Chrono Schedulura API",
        description="AI-powered scheduling platform — production API",
        version="1.0.0",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url=None,
        lifespan=lifespan,
    )

    # CORS — allow requests from the configured frontend origin
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Metrics middleware (no-op stub — swap implementation in M4)
    instrument_app(app)

    # All API routes under /api/v1
    app.include_router(api_v1_router, prefix="/api/v1")

    # Global unhandled exception handler
    app.add_exception_handler(Exception, unhandled_exception_handler)

    return app


app: FastAPI = create_app()
