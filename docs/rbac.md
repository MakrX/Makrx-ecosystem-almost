# Role-Based Access Control (RBAC)

## Role Definitions

- **Super Admin** – Full system control across all applications including configuration, makerspaces, and users.
- **Admin** – Global administrative access for managing users and analytics without system-level actions.
- **Makerspace Admin** – Manages resources within their assigned makerspace such as equipment and inventory.
- **Service Provider** – Handles service orders and provider-specific tasks.
- **User** – Regular participant with access to basic features and self-service capabilities.

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
