# Authentication Policy

MakrX uses Keycloak for single sign-on across all applications. This policy defines password requirements, token lifetimes, session limits and logout behavior.

## Password Policy

The realm enforces a length + history + character variety policy:

- Minimum length **12** characters
- Must include at least one lowercase, one uppercase, one digit and one special character
- Users cannot reuse their last **5** passwords

## Token Lifetimes

| Token type | Lifetime | Notes |
|------------|----------|-------|
| **Access token** | 10 minutes | Short-lived JWT used for API calls |
| **Refresh token** | 45 minutes | Allows renewing access tokens while session is active |
| **Remember-me refresh token** | Up to 30 days | Stored when users select *Remember me*; persists across browser restarts |
| **Offline token** | Admin only; 30-day idle timeout, no max lifespan by default | Requires `offline_access` scope; use for long-lived background tasks |

## Session Timeout

- Sessions become idle after **45 minutes** of inactivity and require re-authentication.
- Active sessions end after **8 hours** regardless of activity.
- **Remember me** restores sessions after browser restarts until the extended refresh or offline token expires; enable this only on non-shared devices when longer SSO sessions are desired.
- All frontends show a banner one minute before token expiry so users can renew their session.

## Global Logout

- Logging out from any MakrX application triggers a Keycloak global logout.
- All access, refresh, remember-me, and offline tokens are revoked.
- Users must authenticate again to regain access to any MakrX service.
- Local storage and session storage entries for all MakrX apps are cleared before redirecting to Keycloak's end-session endpoint.

## SSO Cookie Scope

- **Cookie Domain**: `.makrx.org`
- **Hostnames**: `auth.makrx.org`, `makrx.org`, `cave.makrx.org`, `store.makrx.org`, `providers.makrx.org`

## Origins and CORS

MakrX frontends run on fixed origins per environment. APIs must configure CORS
to allow requests from these origins.

| Environment | Gateway | MakrCave | Store |
|-------------|---------|----------|-------|
| Development | `http://localhost:5173` | `http://localhost:5174` | `http://localhost:5175` |
| Staging | `https://staging.gateway.makrx.org` | `https://staging.makrcave.makrx.org` | `https://staging.store.makrx.org` |
| Production | `https://makrx.org` | `https://cave.makrx.org` | `https://store.makrx.org` |

MakrCave and Store APIs enforce these origins in their CORS configuration
(`allow_origins`/`CORS_ORIGINS`). Ensure staging deployments include the staging
subdomains in their settings.

## Claims and Audience

All MakrX tokens must include these standard claims:

- `sub`
- `email`
- `email_verified`
- `preferred_username`
- `realm_access.roles`
- `groups`

Optional mappers may add the following claims when needed:

- `makerspace_id`
- `provider_id`

Each API must verify that the JWT `aud` claim equals its Keycloak client ID and reject tokens with mismatched audiences.

These claims allow downstream services to perform authorization decisions based on user identity, realm roles and group membership.

## Token Verification

- **JWKS Endpoint**: Services retrieve signing keys from `https://auth.makrx.org/realms/makrx/protocol/openid-connect/certs` (or the configured Keycloak issuer).
- When refresh tokens expire, applications prompt the user to re-authenticate and preserve their current page so work can resume after login.

## Realm Security

- Email verification is enabled in all realms.
- Brute-force detection locks accounts after 5 failed attempts.
- Registration is disabled in production; other environments may enable it as needed.
- SSL is required for staging and production environments.

## UX

- MakrX login theme applied across login, verify, reset, consent, error flows.
- ToS/Privacy links validated.
- Internationalization disabled unless translations available.
