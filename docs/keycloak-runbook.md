# Keycloak Operations Runbook

## Service Account Clients
1. In the admin console, go to **Clients → Create** and add two confidential clients:
   - `makrcave-backend`
   - `makrx-store-backend`
2. In each client's **Settings**:
   - Set **Access Type** to `confidential`.
   - Enable **Service Accounts**.
3. Open the **Credentials** tab, generate a client secret and store it in the secret manager as:
   - `KEYCLOAK_MAKRCAVE_BACKEND_CLIENT_SECRET`
   - `KEYCLOAK_STORE_BACKEND_CLIENT_SECRET`
4. Under **Service Account Roles** assign minimal permissions:
   - `makrx-store-backend` → roles on MakrCave allowing job event publish/read only.
   - `makrcave-backend` → roles on MakrX Store with read-only catalog/product access.

## Secret Rotation
1. Log in to the Keycloak admin console.
2. Navigate to **Clients** and select `makrcave-backend` or `makrx-store-backend`.
3. In the **Credentials** tab, click **Regenerate Secret**.
4. Update the corresponding entry in the secret manager.
5. Update deployment environment variables (`KEYCLOAK_MAKRCAVE_BACKEND_CLIENT_SECRET` or `KEYCLOAK_STORE_BACKEND_CLIENT_SECRET`).
6. Redeploy affected services.

## Add Makerspace Admin
1. In the admin console, go to **Users** and select or create the user.
2. Open the **Role Mappings** tab.
3. Assign the `makerspace_admin` role from the available realm roles.
4. Notify the user to re-login for the new permissions to take effect.
