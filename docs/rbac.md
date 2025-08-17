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

---

**Review Sign-off**

- Frontend Owner: ____________________
- Backend Owner: ____________________
- Identity Owner: ____________________
