# IDP Runbooks

## SMTP Config
1. In the identity provider admin console, open **Realm Settings** → **Email**.
2. Set the SMTP **host** and **port** provided by infrastructure.
3. Set the **from** address that users will see when emails are sent.
4. Set the **reply-to** address for responses and support.
5. Save the settings and restart email-related services if required.

### Notes
- DKIM and SPF are managed by external DNS or email services and are not configured in the identity provider.
- After configuration changes, always test using throwaway accounts even in production to verify delivery and branding.

## Events and Admin Accounts

### Enable login and admin events
1. In the identity provider admin console, open **Realm Settings** → **Events**.
2. Under **Login Events**, toggle **Save Events**.
3. Under **Admin Events**, toggle **Save Events** and, if required, **Include representation**.
4. Click **Save** to apply.

### View events
1. From the left-hand menu, open **Events**.
2. To review login activity, select **View**.
3. To review administrative changes, select **Admin Events**.

### Notes
- Rotate the default `admin` credentials after deployment and on a regular schedule.
- Create a 2FA-enabled break-glass account and store its credentials securely for emergency use only.

## Frontend Clients

| Client ID | standardFlowEnabled | implicitFlowEnabled | directAccessGrantsEnabled | pkce.code.challenge.method | Redirect URIs | Web Origins | Post-logout Redirect URIs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| makrx-gateway-frontend | true | false | false | S256 | Dev: `http://localhost:3000/*`<br>Staging/Prod: `https://makrx.org/*` | Dev: `http://localhost:3000`<br>Staging/Prod: `https://makrx.org` | Dev: `http://localhost:3000/`<br>Staging/Prod: `https://makrx.org/` |
| makrcave-frontend | true | false | false | S256 | Dev: `http://localhost:3001/*`<br>Staging/Prod: `https://makrcave.com/*` | Dev: `http://localhost:3001`<br>Staging/Prod: `https://makrcave.com` | Dev: `http://localhost:3001/`<br>Staging/Prod: `https://makrcave.com/` |
| makrx-store-frontend | true | false | false | S256 | Dev: `http://localhost:3002/*`<br>Staging/Prod: `https://makrx.store/*` | Dev: `http://localhost:3002`<br>Staging/Prod: `https://makrx.store` | Dev: `http://localhost:3002/`<br>Staging/Prod: `https://makrx.store/` |

## Backend Clients and Service Accounts

### Confidential clients

Enable service accounts for backend services and treat them as confidential clients using the client credentials flow:

| Client ID | Service Accounts | Purpose |
| --- | --- | --- |
| makrcave-backend | Enabled | Reads catalog data from the Store service |
| makrx-store-backend | Enabled | Publishes job events to the Cave service |

### Role mappings

- **Store → Cave (job events):** Map the Cave realm's job-event role to `makrx-store-backend` so the Store backend can send job events to MakrCave.
- **Cave → Store (catalog read):** Map the Store realm's catalog-read role to `makrcave-backend` to allow MakrCave to read Store catalog data.

### Secret generation and rotation

1. In the admin console, open each backend client and navigate to **Credentials**.
2. Click **Regenerate Secret** to issue a new client secret.
3. Store the new secret in the secret manager and update dependent services to load it from there.
4. Once services are confirmed to use the new secret, revoke the previous secret and remove it from the secret manager.
