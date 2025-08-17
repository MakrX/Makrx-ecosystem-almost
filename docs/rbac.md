# Role-Based Access Control (RBAC)

## Principles

- Least-privilege, deny on uncertainty.
- Roles describe capabilities; groups describe scope.
- Users may hold multiple roles/groups; effective access is role ∩ group scope.
- Default role assignment on registration is `user`.

## Group Taxonomy

Groups define the scope of a user's permissions:

- `makerspace:{slug}`
- `provider:{slug}`
- `org:{slug}` *(optional)*

Each group must provide an `id` and a human-readable `display_name`.

Slugs are lowercase and may include hyphens (e.g., `makerspace:central-lab`).

## Role Definitions

- `super_admin` – Full system control across all applications including configuration, makerspaces, and users.
- `admin` – Global administrative access for managing users and analytics without system-level actions.
- `makerspace_admin` – Manages resources within their assigned makerspace such as equipment and inventory.
- `service_provider` – Handles service orders and provider-specific tasks.
- `user` – Regular participant with access to basic features and self-service capabilities.

## Gateway

| Feature | Super Admin | Admin | Makerspace Admin | Service Provider | User |
| --- | --- | --- | --- | --- | --- |
| View public content | Can | Can | Can | Can | Can |
| Manage gateway settings | Can | Can | Cannot | Cannot | Cannot |
| Manage user accounts | Can | Can | Cannot | Cannot | Cannot |
| Access analytics | Can | Can | Cannot | Cannot | Cannot |
| Manage makerspace directory | Can | Can | Cannot | Cannot | Cannot |

## MakrCave

| Feature | Super Admin | Admin | Makerspace Admin | Service Provider | User |
| --- | --- | --- | --- | --- | --- |
| Create makerspaces | Can | Can | Cannot | Cannot | Cannot |
| Manage equipment | Can | Can | Can | Cannot | Cannot |
| Manage inventory | Can | Can | Can | Cannot | Cannot |
| View analytics | Can | Can | Can | Cannot | Cannot |
| Manage users | Can | Can | Can | Cannot | Cannot |
| Fulfill service orders | Can | Can | Can | Can | Cannot |

## Store

| Feature | Super Admin | Admin | Makerspace Admin | Service Provider | User |
| --- | --- | --- | --- | --- | --- |
| Browse catalog | Can | Can | Can | Can | Can |
| Purchase items | Can | Can | Can | Can | Can |
| Manage store settings | Can | Can | Cannot | Cannot | Cannot |
| Manage orders | Can | Can | Cannot | Can | Cannot |
| View store analytics | Can | Can | Cannot | Cannot | Cannot |

---

**Review Sign-off**

- Frontend Owner: ____________________
- Backend Owner: ____________________
- Identity Owner: ____________________
