"""
Structured JSON logging for Chrono Schedulura.

Usage in every module:
    from src.core.logging import get_logger
    logger = get_logger(__name__)

configure_logging() is called once at application lifespan startup.
Output streams to stdout so log aggregators (Datadog, Loki, CloudWatch)
can collect it without any code changes.
"""

import logging
import json
from datetime import datetime, timezone
from typing import Any


class JSONFormatter(logging.Formatter):
    """Formats log records as single-line JSON for structured log aggregators."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj: dict[str, Any] = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info:
            log_obj["exc"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)


def configure_logging(level: str = "INFO") -> None:
    """
    Configure root logger with JSON output.

    Call exactly once at application lifespan startup.
    Pass level="DEBUG" in development via an env var if needed.
    """
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    logging.basicConfig(
        handlers=[handler],
        level=getattr(logging, level.upper(), logging.INFO),
        force=True,
    )


def get_logger(name: str) -> logging.Logger:
    """
    Return a named logger.

    Args:
        name: Typically ``__name__`` of the calling module.

    Returns:
        A standard Python Logger that emits JSON-formatted records.
    """
    return logging.getLogger(name)
