# Keycloak Operations Runbook

## Rotate Client Secret
1. Log in to the Keycloak admin console.
2. Navigate to **Clients** and select the desired client.
3. In the **Credentials** tab, click **Regenerate Secret**.
4. Update the client secret in application configuration and redeploy services.

## Add Makerspace Admin
1. In the admin console, go to **Users** and select or create the user.
2. Open the **Role Mappings** tab.
3. Assign the `makerspace_admin` role from the available realm roles.
4. Notify the user to re-login for the new permissions to take effect.
