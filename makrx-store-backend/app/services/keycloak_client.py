import os
from functools import lru_cache

import httpx

KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://keycloak:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "makrx")
CLIENT_ID = os.getenv("MAKRX_STORE_BACKEND_CLIENT_ID", "makrx-store-backend")
CLIENT_SECRET = os.getenv("MAKRX_STORE_BACKEND_CLIENT_SECRET", "")

@lru_cache()
def _token_endpoint() -> str:
    return f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token"

async def get_service_token() -> str:
    """Obtain access token using client credentials."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            _token_endpoint(),
            data={
                "grant_type": "client_credentials",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
            },
        )
        resp.raise_for_status()
        return resp.json()["access_token"]
