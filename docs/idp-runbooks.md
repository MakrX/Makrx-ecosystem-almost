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
