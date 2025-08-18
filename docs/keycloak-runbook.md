# Keycloak Operations Runbook

## Realm Security Settings
1. In the admin console, go to **Realm Settings → Login** and enable **Verify Email**.
2. Navigate to **Realm Settings → Security** and enable **Brute Force Detection**. Set thresholds such as **5 failed attempts** leading to a temporary lockout.
3. In **Realm Settings → Login**, disable **User registration** in production. Enable it only in development or staging if self-service sign-up is required.
4. Under **Realm Settings → General**, enable **Require SSL for external requests** in staging and production realms.
5. In **Realm Settings → Password Policy**, enforce strong credentials:
   - Minimum length 12 characters
   - Require lower-case, upper-case, digit and special character
   - Disallow reuse of the last 5 passwords

## Token and Session Settings
1. In **Realm Settings → Tokens**, set:
   - **Access token lifespan** to 10 minutes
   - **Refresh token lifespan** to 45 minutes
2. Under **Realm Settings → Sessions**, set **SSO Session Idle** to 45 minutes (30–60 minute range) and **SSO Session Max** to 8 hours.
3. Disable **Offline tokens** entirely or grant the `offline_access` role only to administrator groups.
4. Enable **Remember Me** only on non-shared devices when longer SSO sessions are required.

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
