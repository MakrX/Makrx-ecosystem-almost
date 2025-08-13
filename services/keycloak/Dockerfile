FROM quay.io/keycloak/keycloak:24.0.0

# Copy custom theme
COPY themes/makrx-login /opt/keycloak/themes/makrx-login

# Copy realm configuration
COPY realm-export/makrx-realm.json /opt/keycloak/data/import/makrx-realm.json

# Set up environment
ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=makrx-admin-2024
ENV KC_HOSTNAME_STRICT=false
ENV KC_HOSTNAME_STRICT_HTTPS=false
ENV KC_HTTP_ENABLED=true
ENV KC_PROXY=edge

# Import realm on startup
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--import-realm"]
