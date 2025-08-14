# MakrX Architecture Overview

This document provides a quick reference for how the ecosystem fits together so a new engineer can trace a request and know where to add features.

## System Map

| Component | Role |
|-----------|------|
| **Gateway** | Public entry point and profile hub that links to sub‑apps |
| **MakrCave Frontend** | Makerspace management UI |
| **MakrCave Backend** | Inventory, jobs and reservations API |
| **Store Frontend** | E‑commerce and quoting UI |
| **Store Backend** | Quote calculation and order management; publishes jobs to MakrCave |
| **Keycloak** | Central identity provider issuing JWTs |
| **PostgreSQL** | Primary relational datastore for all services |
| **Reverse Proxy (Nginx)** | Routes traffic to frontends/backends and terminates TLS |
| **Storage/CDN** | Object storage (MinIO/S3) for uploads served through a CDN |

## Runtime Environments

### Development
Docker Compose starts the stack with optional helpers. Common ports:

| Service | Port |
|---------|------|
| Postgres | 5432 |
| Keycloak | 8080 |
| MakrCave API | 8002 |
| Store API | 8003 |
| Gateway UI | 3000 |
| MakrCave UI | 3001 |
| Store UI | 3002 |
| Reverse proxy | 80/443 |
| Optional MinIO | 9000 |

Additional services like Redis or mail can be added as needed.

### Production
Frontends build to static assets served via CDN behind Nginx. Backends run behind the proxy with managed Postgres, Keycloak, Redis and S3‑compatible storage.

## Authentication Flows

- **Login** – Frontends redirect users to Keycloak. After successful auth, access and refresh tokens are issued and stored client‑side as `Authorization: Bearer`.
- **Refresh** – Clients call `/api/auth/refresh` with the refresh token when the access token expires to obtain a new pair.
- **Logout** – Apps hit Keycloak's end‑session endpoint and clear local tokens.
- **Service‑to‑service** – Internal calls (e.g., Store ➜ MakrCave) use `X-API-Key` and `X-Service` headers.
- **Keycloak clients/roles** – `gateway-frontend`, `makrcave-frontend`, and `makrx-store-frontend` clients with roles such as `member`, `makerspace_admin`, and `customer`.

## Store ➜ MakrCave Bridge Flow

1. Store backend generates a **Quote** for an uploaded STL.
2. Accepting the quote creates a `ServiceOrder` which is published to MakrCave via `/jobs/publish` using the service order ID as `external_order_id`.
3. MakrCave creates a **Job** and tracks lifecycle: `accepted → in_progress → printing → post_processing → quality_check → ready_for_pickup → shipped/completed`.
4. MakrCave posts status callbacks to `/jobs/{job_id}/status`, which the Store maps to its own order states.
5. Idempotency is maintained by reusing the same `external_order_id` for retries.
6. Failures return 5xx responses; the Store logs them and retries or flags for manual intervention.

## Data Contracts (MVP)

| Entity | Key Fields | Reference |
|--------|------------|-----------|
| **UserProfile** | `id`, `email`, `name`, `roles`, `makerspaces[]` | [API docs](docs/API.md) |
| **Makerspace** | `id`, `name`, `description`, `location`, `member_count` | [API docs](docs/API.md#makerspaces) |
| **InventoryItem** | `id`, `name`, `category`, `quantity`, `location`, `status` | MakrCave API inventory |
| **FilamentRoll** | `id`, `makerspace_id`, `material`, `color`, `current_weight_g`, `status` | MakrCave filament tracking |
| **Quote** | `quote_id`, `file_info`, `options[]`, `total_price`, `expires_at` | Store API quotes |
| **Job** | `job_id`, `external_order_id`, `status`, `requirements`, `provider_id` | MakrCave jobs API |
| **EquipmentReservation** | `id`, `equipment_id`, `user_id`, `requested_start`, `requested_end`, `status` | MakrCave reservations API |

## Cross‑Cutting Concerns

- **Feature flags** – `@makrx/feature-flags` package with `FeatureFlagProvider` and `FlagGuard` for controlled rollouts.
- **Logging & observability** – Structured JSON logs with correlation IDs and middleware‑based request metrics.
- **Error strategy** – Consistent `{success, data | error}` response envelope with standard codes.
- **Security headers** – Middleware sets `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`, and CSP.
- **CORS** – Frontends are whitelisted in development and tightened in production.

## Non‑Goals for MVP

- Real‑time collaboration, advanced analytics, automated equipment control, and full payment settlement are deferred.
- Decision history is tracked in the [ADR directory](docs/adr/README.md), where files are named `YYYYMMDD-short-title.md`.

---
A typical request flows `Gateway → Keycloak → service API → Postgres`. To add features, extend routes under `makrx-store-backend/app/routes/*` or `makrcave-backend/routes/*` and update the corresponding frontend in `frontend/`.
