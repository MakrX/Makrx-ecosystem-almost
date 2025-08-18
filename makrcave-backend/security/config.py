"""Authentication configuration settings for token validation."""

import os
from typing import List

AUTH_ISSUER_URL: str = os.getenv("AUTH_ISSUER_URL", "")
AUTH_JWKS_URL: str = os.getenv("AUTH_JWKS_URL", "")
AUTH_AUDIENCE: str = os.getenv("AUTH_AUDIENCE", "")
AUTH_ALLOWED_ALGS: List[str] = [
    alg.strip()
    for alg in os.getenv("AUTH_ALLOWED_ALGS", "RS256").split(",")
    if alg.strip()
]
AUTH_CLOCK_SKEW_SECONDS: int = int(os.getenv("AUTH_CLOCK_SKEW_SECONDS", "60"))
AUTH_JWKS_CACHE_TTL: int = int(os.getenv("AUTH_JWKS_CACHE_TTL", "300"))
AUTH_SERVICE_AUDIENCE: str = os.getenv("AUTH_SERVICE_AUDIENCE", "")

__all__ = [
    "AUTH_ISSUER_URL",
    "AUTH_JWKS_URL",
    "AUTH_AUDIENCE",
    "AUTH_ALLOWED_ALGS",
    "AUTH_CLOCK_SKEW_SECONDS",
    "AUTH_JWKS_CACHE_TTL",
    "AUTH_SERVICE_AUDIENCE",
]
