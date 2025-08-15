# Authentication Policy

MakrX uses Keycloak for single sign-on across all applications. This policy defines token lifetimes, session limits and logout behavior.

## Token Lifetimes

| Token type | Lifetime | Notes |
|------------|----------|-------|
| **Access token** | 5–10 minutes (default 5 min) | Short-lived JWT used for API calls |
| **Refresh token** | 30–60 minutes (default 30 min) | Allows renewing access tokens while session is active |
| **Remember-me refresh token** | Up to 30 days | Stored when users select *Remember me*; persists across browser restarts |
| **Offline token** | 30-day idle timeout, no max lifespan by default | Requires `offline_access` scope; use for long-lived background tasks |

## Session Timeout

- Sessions become idle after **30 minutes** of inactivity and require re-authentication.
- Active sessions end after **8 hours** regardless of activity.
- **Remember me** restores sessions after browser restarts until the extended refresh or offline token expires.
- All frontends show a banner one minute before token expiry so users can renew their session.

## Global Logout

- Logging out from any MakrX application triggers a Keycloak global logout.
- All access, refresh, remember-me, and offline tokens are revoked.
- Users must authenticate again to regain access to any MakrX service.
- Local storage and session storage entries for all MakrX apps are cleared before redirecting to Keycloak's end-session endpoint.

## SSO Cookie Scope

- **Cookie Domain**: `.makrx.org`
- **Hostnames**: `auth.makrx.org`, `makrx.org`, `cave.makrx.org`, `store.makrx.org`, `providers.makrx.org`

## Approved Origins

Only the following origins are authorized for browser clients and CORS requests:

- `https://makrx.org`
- `https://cave.makrx.org`
- `https://store.makrx.org`
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:5175`

## Token Claims

All MakrX clients are configured to expose the following OpenID Connect claims:

- `sub`
- `email`
- `email_verified`
- `preferred_username`
- `realm_access.roles`
- `groups`

Additional custom claims are included when required by specific services:

- `makerspace_id`
- `service_provider_id`

These claims allow downstream services to perform authorization decisions based on user identity, realm roles and group membership.

## Token Verification

- **JWKS Endpoint**: Services retrieve signing keys from `https://auth.makrx.org/realms/makrx/protocol/openid-connect/certs` (or the configured Keycloak issuer).
- **Audience Enforcement**: Every backend validates that the JWT `aud` claim matches its own Keycloak client ID, rejecting tokens meant for other services.
- When refresh tokens expire, applications prompt the user to re-authenticate and preserve their current page so work can resume after login.
