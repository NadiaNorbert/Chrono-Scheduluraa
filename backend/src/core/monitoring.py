"""
Metrics / observability stub for Chrono Schedulura.

instrument_app() is called in create_app() and registers MetricsMiddleware.
To add real metrics in a future milestone, replace _record_request() with
Prometheus counters, Datadog StatsD calls, or OpenTelemetry spans — no
other files need changing.
"""

import time
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from src.core.logging import get_logger

logger = get_logger(__name__)


class MetricsMiddleware(BaseHTTPMiddleware):
    """
    HTTP request metrics middleware.

    Currently a no-op stub. Replace _record_request() with real metric
    emission in the monitoring milestone.
    """

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        start = time.monotonic()
        response: Response = await call_next(request)
        duration_ms = (time.monotonic() - start) * 1000
        _record_request(
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration_ms=duration_ms,
        )
        return response


def _record_request(
    method: str, path: str, status: int, duration_ms: float
) -> None:
    """
    Emit a request metric.

    Stub implementation — logs at DEBUG level only.
    Replace with:
        statsd.timing("http.request.duration", duration_ms, tags=[...])
        or prometheus_client Counter / Histogram calls.
    """
    logger.debug(
        "request",
        extra={
            "http_method": method,
            "http_path": path,
            "http_status": status,
            "duration_ms": round(duration_ms, 2),
        },
    )


def instrument_app(app: FastAPI) -> None:
    """
    Register all monitoring middleware on the FastAPI application.

    Call from create_app() before including routers.
    """
    app.add_middleware(MetricsMiddleware)
