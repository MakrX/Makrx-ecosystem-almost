/**
 * Authentication utilities using the official Keycloak JS adapter
 * Implements PKCE, silent refresh and user role helpers
 */

import Keycloak, { KeycloakInstance, KeycloakLoginOptions } from "keycloak-js";
import { logoutFromSSO, redirectToSSO } from "../../makrx-sso-utils.js";

// Configuration
const KEYCLOAK_URL =
  import.meta.env.VITE_KEYCLOAK_URL || "https://auth.makrx.org";
const REALM = import.meta.env.VITE_KEYCLOAK_REALM || "makrx";
const CLIENT_ID =
  import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "makrx-cave";

// Types
export interface User {
  sub: string;
  email: string;
  name: string;
  preferred_username: string;
  email_verified: boolean;
  roles: string[];
  scopes: string[];
}

// Keycloak instance
const keycloak: KeycloakInstance = new Keycloak({
  url: KEYCLOAK_URL,
  realm: REALM,
  clientId: CLIENT_ID,
});

// Auth state management
let authListeners: Array<(user: User | null) => void> = [];
let initPromise: Promise<boolean> | null = null;

const isClient = typeof window !== "undefined";

// Initialize Keycloak and enable silent SSO
export const init = async (): Promise<boolean> => {
  if (!isClient) return false;
  if (!initPromise) {
    initPromise = keycloak
      .init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
      })
      .then((authenticated) => {
        if (authenticated) {
          if (keycloak.token) {
            localStorage.setItem('auth_token', keycloak.token);
          }
          notifyAuthListeners(getCurrentUser());
        }
        return authenticated;
      });

    // Automatic token refresh
    keycloak.onTokenExpired = async () => {
      try {
        await keycloak.updateToken(60);
        if (keycloak.token) {
          localStorage.setItem('auth_token', keycloak.token);
        }
        notifyAuthListeners(getCurrentUser());
      } catch {
        sessionStorage.setItem("makrx_redirect_url", window.location.href);
        window.alert("Session expired. Please log in again.");
        redirectToSSO();
      }
    };
  }
  return initPromise;
};

// Token management
export const getToken = async (): Promise<string | null> => {
  await init();
  if (!keycloak.authenticated) return null;
  try {
    await keycloak.updateToken(60);
    if (keycloak.token) {
      localStorage.setItem('auth_token', keycloak.token);
    }
    return keycloak.token ?? null;
  } catch {
    sessionStorage.setItem("makrx_redirect_url", window.location.href);
    window.alert("Session expired. Please log in again.");
    redirectToSSO();
    return null;
  }
};

// User helpers
export const getCurrentUser = (): User | null => {
  const parsed = keycloak.tokenParsed as Record<string, any> | undefined;
  if (!parsed) return null;
  return {
    sub: parsed.sub,
    email: parsed.email,
    name: parsed.name,
    preferred_username: parsed.preferred_username,
    email_verified: parsed.email_verified || false,
    roles: parsed.realm_access?.roles || [],
    scopes: (parsed.scope || "").split(" "),
  };
};

export const isAuthenticated = (): boolean => !!keycloak.authenticated;

export const hasRole = (role: string): boolean =>
  keycloak.hasRealmRole ? keycloak.hasRealmRole(role) : false;

export const hasAnyRole = (roles: string[]): boolean =>
  roles.some((r) => hasRole(r));

export const hasScope = (scope: string): boolean => {
  const user = getCurrentUser();
  return user?.scopes.includes(scope) || false;
};

// Authentication flow
export const login = (options?: KeycloakLoginOptions): void => {
  if (!isClient) return;

  // Store original URL for redirect after login
  sessionStorage.setItem("makrx_redirect_url", window.location.href);
  keycloak.login({
    redirectUri: window.location.origin + "/auth/callback",
    ...options,
  });
};

export const register = (options?: KeycloakLoginOptions): void => {
  if (!isClient) return;
  sessionStorage.setItem("makrx_redirect_url", window.location.href);
  keycloak.register({
    redirectUri: window.location.origin + "/auth/callback",
    ...options,
  });
};

export const logout = async (): Promise<void> => {
  if (!isClient) return;
  notifyAuthListeners(null);
  localStorage.removeItem('auth_token');
  logoutFromSSO();
};

// Handle auth callback after redirect from Keycloak
export const handleAuthCallback = async (): Promise<boolean> => {
  try {
    const authenticated = await init();
    return authenticated;
  } catch {
    return false;
  }
};

// Auth listeners
export const addAuthListener = (
  listener: (user: User | null) => void,
): void => {
  authListeners.push(listener);
};

export const removeAuthListener = (
  listener: (user: User | null) => void,
): void => {
  authListeners = authListeners.filter((l) => l !== listener);
};

const notifyAuthListeners = (user: User | null): void => {
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (error) {
      console.error("Auth listener error:", error);
    }
  });
};

// Periodic silent refresh as fallback
if (isClient) {
  init();
  setInterval(async () => {
    if (keycloak.authenticated) {
      try {
        const refreshed = await keycloak.updateToken(60);
        if (refreshed) {
          if (keycloak.token) {
            localStorage.setItem('auth_token', keycloak.token);
          }
          notifyAuthListeners(getCurrentUser());
        }
      } catch {
        keycloak.clearToken();
        notifyAuthListeners(null);
      }
    }
  }, 60 * 1000);
}

// Export auth utilities
export const auth = {
  init,
  login,
  logout,
  register,
  getToken,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  hasScope,
  addAuthListener,
  removeAuthListener,
  handleAuthCallback,
};

export default auth;

