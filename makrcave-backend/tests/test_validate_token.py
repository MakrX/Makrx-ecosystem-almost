import datetime
import os
import sys
from unittest.mock import AsyncMock

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException
from jose import jwt
from jose.utils import base64url_encode

# Allow importing dependencies module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import dependencies  # noqa: E402
from security import jwks as jwks_module  # noqa: E402

# Generate RSA key pair for tests
_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
PRIVATE_PEM = _private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption(),
)
_public_key = _private_key.public_key()
_numbers = _public_key.public_numbers()
E = base64url_encode(
    _numbers.e.to_bytes((_numbers.e.bit_length() + 7) // 8, "big")
).decode("utf-8")
N = base64url_encode(
    _numbers.n.to_bytes((_numbers.n.bit_length() + 7) // 8, "big")
).decode("utf-8")
JWKS = {
    "keys": [
        {"kty": "RSA", "kid": "test-key", "use": "sig", "alg": "RS256", "n": N, "e": E}
    ]
}


@pytest.fixture(autouse=True)
def patch_env(monkeypatch):
    monkeypatch.setattr(dependencies, "KEYCLOAK_AUDIENCE", "makrcave-backend")
    monkeypatch.setattr(dependencies, "KEYCLOAK_ISSUER", "http://keycloak/realms/makrx")
    monkeypatch.setattr(jwks_module, "get_jwk", AsyncMock(return_value=JWKS["keys"][0]))
    jwks_module._jwks_cache.clear()
    yield


def make_token(overrides=None, *, alg="RS256"):
    now = int(datetime.datetime.utcnow().timestamp())
    payload = {
        "sub": "123",
        "iss": dependencies.KEYCLOAK_ISSUER,
        "aud": dependencies.KEYCLOAK_AUDIENCE,
        "exp": now + 300,
        "iat": now,
        "nbf": now,
        "typ": "Bearer",
    }
    if overrides:
        payload.update(overrides)
    headers = {"kid": "test-key", "alg": alg}
    key = PRIVATE_PEM if alg.startswith("RS") else "secret"
    return jwt.encode(payload, key, algorithm=alg, headers=headers)


@pytest.mark.asyncio
async def test_rejects_wrong_issuer():
    token = make_token({"iss": "http://wrong"})
    with pytest.raises(HTTPException):
        await dependencies.validate_token(token)


@pytest.mark.asyncio
async def test_rejects_wrong_audience():
    token = make_token({"aud": "other-service"})
    with pytest.raises(HTTPException):
        await dependencies.validate_token(token)


@pytest.mark.asyncio
async def test_rejects_wrong_algorithm():
    token = make_token({}, alg="RS384")
    with pytest.raises(HTTPException):
        await dependencies.validate_token(token)


@pytest.mark.asyncio
async def test_rejects_id_token():
    token = make_token({"typ": "ID"})
    with pytest.raises(HTTPException):
        await dependencies.validate_token(token)


@pytest.mark.asyncio
async def test_rejects_expired_token():
    now = int(datetime.datetime.utcnow().timestamp())
    token = make_token({"exp": now - 61})
    with pytest.raises(HTTPException):
        await dependencies.validate_token(token)


@pytest.mark.asyncio
async def test_rejects_not_yet_valid_nbf():
    now = int(datetime.datetime.utcnow().timestamp())
    token = make_token({"nbf": now + 61})
    with pytest.raises(HTTPException):
        await dependencies.validate_token(token)


@pytest.mark.asyncio
async def test_rejects_future_iat():
    now = int(datetime.datetime.utcnow().timestamp())
    token = make_token({"iat": now + 61})
    with pytest.raises(HTTPException):
        await dependencies.validate_token(token)
