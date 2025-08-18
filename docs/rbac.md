# Role-Based Access Control (RBAC)

## Principles

- Least-privilege, deny on uncertainty.
- Roles describe capabilities; groups describe scope.
- Users may hold multiple roles/groups; effective access is role ∩ group scope.
- Default role assignment on registration is `user`.

## Group Taxonomy

Groups define the scope of a user's permissions. All slugs are lowercase and use hyphens to separate words (e.g., `makerspace:central-lab`).

### makerspace:{slug}

Attributes:

- `makerspace_id`
- `display_name`

### provider:{slug}

Attributes:

- `provider_id`
- `display_name`

### org:{slug} *(optional)*

Attributes:

- `org_id`
- `display_name`

## Role Definitions

These roles determine the actions a user can perform:

- `super_admin` – Full system control across all applications including configuration, makerspaces, and users.
- `admin` – Global administrative access for managing users and analytics without system-level actions.
- `makerspace_admin` – Manages resources within their assigned makerspace such as equipment and inventory.
- `service_provider` – Handles service orders and provider-specific tasks.
- `user` – Regular participant with access to basic features and self-service capabilities.

## Gateway

| Role | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| super_admin | Can | Can | Can | Can |
| admin | Can | Can | Can | Cannot |
| makerspace_admin* | Cannot | Can | Cannot | Cannot |
| service_provider | Cannot | Can | Cannot | Cannot |
| user | Cannot | Can | Cannot | Cannot |

\*Limited to their makerspace membership.

## MakrCave

| Role | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| super_admin | Can | Can | Can | Can |
| admin | Can | Can | Can | Can |
| makerspace_admin* | Can | Can | Can | Can |
| service_provider | Can | Can | Can¹ | Cannot |
| user | Cannot | Can | Cannot | Cannot |

\*Limited to their makerspace membership.  
¹ May update only their own jobs.

## MakrX Store

| Role | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| super_admin | Can | Can | Can | Can |
| admin | Can | Can | Can | Cannot |
| makerspace_admin* | Can | Can | Cannot | Cannot |
| service_provider | Can | Can | Can | Cannot |
| user | Can | Can | Cannot | Cannot |

\*Limited to their makerspace membership.

## Evaluation Semantics

- A user's effective permissions are the union of all roles they hold.
- A resource operation must target at least one of the user's groups.
- Requests are denied when the requested scope does not match any group.

## Post-login Routing

Role routing resolves in the following priority order. The first matching role wins:

1. `super_admin`
2. `admin`
3. `makerspace_admin`
4. `service_provider`
5. `user`

If a user has no recognized role, they fall back to the `user` dashboard.

| Role | Dev URL | Staging URL | Prod URL |
| --- | --- | --- | --- |
| super_admin | https://dev.gateway.makrx.org/admin | https://staging.gateway.makrx.org/admin | https://gateway.makrx.org/admin |
| admin | https://dev.gateway.makrx.org/admin | https://staging.gateway.makrx.org/admin | https://gateway.makrx.org/admin |
| makerspace_admin | https://dev.makrcave.makrx.org | https://staging.makrcave.makrx.org | https://makrcave.makrx.org |
| service_provider | https://dev.store.makrx.org/provider | https://staging.store.makrx.org/provider | https://store.makrx.org/provider |
| user | https://dev.makrcave.makrx.org | https://staging.makrcave.makrx.org | https://makrcave.makrx.org |


## Token Contents

Mandatory claims:

- `sub`
- `email`
- `roles`
- `groups`
- Standard JWT fields (`iat`, `exp`, `iss`, `aud`)

Optional claims:

- `makerspace_id`
- `provider_id`

PII limited to email.

## Governance

- **Group creation:** Identity team creates groups and slugs.
- **Membership management:** Makerspace or provider admins manage membership within their scope.
- **Role grants:** Super admins or automated workflows assign roles upon approved requests.

## Migration

Checklist for renaming roles/groups or backfilling attributes:

- [ ] Update role and group slugs in the identity provider.
- [ ] Adjust application role mappings.
- [ ] Backfill `makerspace_id` and `provider_id` claims.
- [ ] Notify affected teams of the changes.

Current migrations: N/A

## RBAC v1 (Frozen)

This document defines RBAC v1. Future changes require an Architecture Decision Record (ADR) and sign-off from Frontend, Backend, and Identity owners before the document is marked frozen.

---

**Review Sign-off**

- Frontend Owner: ____________________
- Backend Owner: ____________________
- Identity Owner: ____________________
