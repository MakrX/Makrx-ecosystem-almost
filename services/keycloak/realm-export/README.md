# Keycloak Realm Exports

This directory holds sanitized Keycloak realm exports. There is one JSON file per environment:

- `dev-realm.json`
- `staging-realm.json`
- `prod-realm.json`

Secrets such as client secrets, SMTP credentials, and keys are removed from all files.

## Update procedure

1. Apply configuration changes in the Keycloak admin console.
2. Export the realm.
3. Scrub any secrets from the export.
4. Commit the sanitized JSON in a pull request.

## Recreating the development realm

To rebuild a fresh dev realm from the export:

```bash
cp services/keycloak/realm-export/dev-realm.json services/keycloak/realm-export/makrx-realm.json
docker compose build keycloak
docker compose up keycloak
```

When Keycloak starts with `--import-realm`, it loads the `makrx-realm.json` file and recreates the realm.

