# Auth Provisioning Runbook

This runbook outlines how to manage user access in the MakrX ecosystem using Keycloak.

## Inviting Users vs. Promoting Existing Accounts

### Invite by Email
1. In the Keycloak admin console, navigate to **Users → Add user**.
2. Enter the user's email and required fields.
3. Select **Send email** to dispatch a registration link.
4. The user sets their password and completes profile setup on first login.

### Promote Existing User
1. Search for the user under **Users**.
2. Open the account and mark **Email verified** if not already.
3. Assign the appropriate roles or groups as described below.
4. Notify the user that access has been elevated.

## Assigning Roles and Groups

Roles and groups determine a user's permissions across makerspaces and provider portals.

### Makerspaces
- Assign the user to the `makerspace-admin` group for full makerspace administration.
- Use the `makerspace-member` group for general member capabilities.
- Additional realm roles may be required for inventory or equipment management.

### Providers
- Place service providers into the `provider` group for portal access.
- Grant specific provider roles such as `fabrication-manager` or `order-fulfillment` based on responsibilities.
- Combine roles with group membership for fine-grained permissions.

## Revoking Access and Token Invalidation

1. Remove the user from all roles and groups.
2. Disable the account or set **Temporary** status if suspension is temporary.
3. In **Sessions**, click **Logout all sessions** to invalidate refresh tokens.
4. Revoked users must log in again; existing access tokens expire naturally within a few minutes.

---

For token lifetimes and session policies, see the [Authentication Policy](./auth-policy.md).
