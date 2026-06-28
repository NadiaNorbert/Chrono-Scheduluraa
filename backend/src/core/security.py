"""
JWT validation using Clerk's JWKS endpoint.

JWKS keys are cached in memory for JWKS_CACHE_TTL seconds (300s default)
to avoid hammering the Clerk endpoint on every request.
"""

import time
import httpx
from jose import jwt, JWTError
from fastapi import HTTPException, status
from src.core.config import settings
from src.core.logging import get_logger

logger = get_logger(__name__)

JWKS_CACHE_TTL: int = 300  # seconds

_jwks_cache: dict = {}
_jwks_fetched_at: float = 0.0


async def get_jwks() -> dict:
    """
    Fetch and cache Clerk's JSON Web Key Set.

    Returns:
        The JWKS dict containing the public signing keys.

    Raises:
        HTTPException 503 if the JWKS endpoint is unreachable.
    """
    global _jwks_cache, _jwks_fetched_at

    if _jwks_cache and (time.monotonic() - _jwks_fetched_at) < JWKS_CACHE_TTL:
        return _jwks_cache

    logger.info("Fetching JWKS from %s", settings.clerk_jwks_url)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(settings.clerk_jwks_url)
            resp.raise_for_status()
            _jwks_cache = resp.json()
            _jwks_fetched_at = time.monotonic()
            logger.info("JWKS cached successfully (%d keys)", len(_jwks_cache.get("keys", [])))
            return _jwks_cache
    except httpx.HTTPError as exc:
        logger.error("Failed to fetch JWKS: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"detail": "Authentication service unavailable", "code": "AUTH_SERVICE_UNAVAILABLE"},
        )


async def decode_clerk_jwt(token: str) -> dict:
    """
    Decode and validate a Clerk-issued JWT.

    Args:
        token: Raw Bearer token string.

    Returns:
        Decoded JWT payload dict.

    Raises:
        HTTPException 401 with code INVALID_TOKEN if validation fails.
    """
    jwks = await get_jwks()
    try:
        payload: dict = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Clerk tokens don't require audience claim
        )
        return payload
    except JWTError as exc:
        logger.warning("JWT validation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"detail": "Token is invalid or expired", "code": "INVALID_TOKEN"},
            headers={"WWW-Authenticate": "Bearer"},
        )
