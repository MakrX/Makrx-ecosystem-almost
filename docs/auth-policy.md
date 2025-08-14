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

## Global Logout

- Logging out from any MakrX application triggers a Keycloak global logout.
- All access, refresh, remember-me, and offline tokens are revoked.
- Users must authenticate again to regain access to any MakrX service.
