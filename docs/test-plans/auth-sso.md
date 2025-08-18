# Auth SSO Test Plan

## Clients and Audience

- [ ] Token presented with wrong `aud` → expect 401/403.
- [ ] Token missing/invalid signature or issuer → 401.
- [ ] Requests from non-allowlisted origin → CORS failure.
