import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Dict

import httpx

from .config import AUTH_JWKS_CACHE_TTL

logger = logging.getLogger(__name__)

_jwks_cache: Dict[str, Dict[str, Any]] = {}
_cache_lock = asyncio.Lock()
_http_client: httpx.AsyncClient | None = None


async def _get_http_client() -> httpx.AsyncClient:
    """Return a module-level HTTP client."""
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(timeout=30.0)
    return _http_client


async def _fetch_jwks(jwks_url: str) -> Dict[str, Any]:
    client = await _get_http_client()
    response = await client.get(jwks_url)
    response.raise_for_status()
    return response.json()


async def _refresh_jwk(kid: str, jwks_url: str) -> None:
    """Background refresh of a JWK for the given kid."""
    try:
        jwks = await _fetch_jwks(jwks_url)
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                async with _cache_lock:
                    _jwks_cache[kid] = {
                        "key": key,
                        "expires_at": datetime.utcnow()
                        + timedelta(seconds=AUTH_JWKS_CACHE_TTL),
                    }
                return
    except Exception as exc:  # pragma: no cover - best effort logging
        logger.error("Failed to refresh JWKS for kid %s: %s", kid, exc)


async def get_jwk(kid: str, jwks_url: str) -> Dict[str, Any]:
    """Return the JWK for the specified kid using cache with background refresh."""
    now = datetime.utcnow()
    async with _cache_lock:
        entry = _jwks_cache.get(kid)
        if entry:
            if entry["expires_at"] > now:
                return entry["key"]
            asyncio.create_task(_refresh_jwk(kid, jwks_url))
            return entry["key"]

    jwks = await _fetch_jwks(jwks_url)
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            async with _cache_lock:
                _jwks_cache[kid] = {
                    "key": key,
                    "expires_at": now + timedelta(seconds=AUTH_JWKS_CACHE_TTL),
                }
            return key
    raise KeyError(f"Key {kid} not found")
