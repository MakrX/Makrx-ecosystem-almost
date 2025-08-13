/**
 * Authentication integration with Keycloak
 * JWT token management and user authentication
 */

import { jwtDecode } from "jwt-decode";

// Configuration
const KEYCLOAK_URL =
  process.env.NEXT_PUBLIC_KEYCLOAK_URL || "https://auth.makrx.org";
const REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "makrx";
const CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "makrx-store";

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

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

// Token storage keys
const ACCESS_TOKEN_KEY = "makrx_access_token";
const REFRESH_TOKEN_KEY = "makrx_refresh_token";
const TOKEN_EXPIRES_KEY = "makrx_token_expires";
const USER_INFO_KEY = "makrx_user_info";

// Auth state management
let currentUser: User | null = null;
let authListeners: Array<(user: User | null) => void> = [];

// Utility functions
const isClient = typeof window !== "undefined";

const getStoredItem = (key: string): string | null => {
  if (!isClient) return null;
  return localStorage.getItem(key);
};

const setStoredItem = (key: string, value: string): void => {
  if (!isClient) return;
  localStorage.setItem(key, value);
};

const removeStoredItem = (key: string): void => {
  if (!isClient) return;
  localStorage.removeItem(key);
};

// Token management
export const getToken = async (): Promise<string | null> => {
  const token = getStoredItem(ACCESS_TOKEN_KEY);
  const expiresAt = getStoredItem(TOKEN_EXPIRES_KEY);

  if (!token || !expiresAt) {
    return null;
  }

  // Check if token is expired
  const now = Date.now();
  const expires = parseInt(expiresAt, 10);

  if (now >= expires) {
    // Try to refresh token
    const refreshed = await refreshToken();
    if (refreshed) {
      return getStoredItem(ACCESS_TOKEN_KEY);
    }
    return null;
  }

  return token;
};

export const setTokens = (tokens: AuthTokens): void => {
  const expiresAt = Date.now() + tokens.expires_in * 1000;

  setStoredItem(ACCESS_TOKEN_KEY, tokens.access_token);
  setStoredItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  setStoredItem(TOKEN_EXPIRES_KEY, expiresAt.toString());

  // Decode and store user info
  try {
    const decoded = jwtDecode<any>(tokens.access_token);
    const user: User = {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      preferred_username: decoded.preferred_username,
      email_verified: decoded.email_verified || false,
      roles: decoded.realm_access?.roles || [],
      scopes: (decoded.scope || "").split(" "),
    };

    setStoredItem(USER_INFO_KEY, JSON.stringify(user));
    currentUser = user;
    notifyAuthListeners(user);
  } catch (error) {
    console.error("Failed to decode token:", error);
  }
};

export const clearTokens = (): void => {
  removeStoredItem(ACCESS_TOKEN_KEY);
  removeStoredItem(REFRESH_TOKEN_KEY);
  removeStoredItem(TOKEN_EXPIRES_KEY);
  removeStoredItem(USER_INFO_KEY);

  currentUser = null;
  notifyAuthListeners(null);
};

// Token refresh
export const refreshToken = async (): Promise<boolean> => {
  const refreshTokenValue = getStoredItem(REFRESH_TOKEN_KEY);

  if (!refreshTokenValue) {
    return false;
  }

  try {
    const response = await fetch(
      `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: CLIENT_ID,
          refresh_token: refreshTokenValue,
        }),
      },
    );

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const tokens: AuthTokens = await response.json();
    setTokens(tokens);
    return true;
  } catch (error) {
    // In development, silently handle auth errors
    if (process.env.NODE_ENV === "development") {
      console.warn("Auth service unavailable in development mode");
    } else {
      console.error("Token refresh failed:", error);
    }
    clearTokens();
    return false;
  }
};

// User management
export const getCurrentUser = (): User | null => {
  if (currentUser) {
    return currentUser;
  }

  // Try to load from storage
  const userInfo = getStoredItem(USER_INFO_KEY);
  if (userInfo) {
    try {
      currentUser = JSON.parse(userInfo);
      return currentUser;
    } catch (error) {
      console.error("Failed to parse stored user info:", error);
    }
  }

  return null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null && getToken() !== null;
};

export const hasRole = (role: string): boolean => {
  const user = getCurrentUser();
  return user?.roles.includes(role) || false;
};

export const hasAnyRole = (roles: string[]): boolean => {
  const user = getCurrentUser();
  return roles.some((role) => user?.roles.includes(role)) || false;
};

export const hasScope = (scope: string): boolean => {
  const user = getCurrentUser();
  return user?.scopes.includes(scope) || false;
};

// Authentication flow
export const login = (redirectUri?: string): void => {
  if (!isClient) return;

  // Store the current location for post-login redirect
  setStoredItem(
    "makrx_pre_login_url",
    window.location.pathname + window.location.search,
  );

  // Store original URL in session storage for SSO consistency
  sessionStorage.setItem('makrx_redirect_url', window.location.href);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri || window.location.origin + "/auth/callback",
    response_type: "code",
    scope: "openid email profile",
    state: generateState(),
  });

  // Redirect to auth.makrx.org (centralized SSO)
  window.location.href = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?${params}`;
};

export const logout = async (): Promise<void> => {
  const token = await getToken();

  // Clear local tokens
  clearTokens();

  // Redirect to Keycloak logout
  if (isClient && token) {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      post_logout_redirect_uri: window.location.origin,
    });

    window.location.href = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout?${params}`;
  }
};

// Handle auth callback
export const handleAuthCallback = async (
  code: string,
  state: string,
): Promise<boolean> => {
  if (!isClient) return false;

  try {
    // Verify state parameter (basic CSRF protection)
    const storedState = getStoredItem("makrx_auth_state");
    if (state !== storedState) {
      throw new Error("Invalid state parameter");
    }

    // Exchange code for tokens
    const response = await fetch(
      `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          code,
          redirect_uri: window.location.origin + "/auth/callback",
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Token exchange failed");
    }

    const tokens: AuthTokens = await response.json();
    setTokens(tokens);

    // Clean up state
    removeStoredItem("makrx_auth_state");

    return true;
  } catch (error) {
    // In development, silently handle auth errors
    if (process.env.NODE_ENV === "development") {
      console.warn("Auth service unavailable in development mode");
    } else {
      console.error("Auth callback failed:", error);
    }
    clearTokens();
    return false;
  }
};

// Utility functions
const generateState = (): string => {
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  setStoredItem("makrx_auth_state", state);
  return state;
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

// Initialize auth state on load
if (isClient) {
  // Check if we have valid tokens and user info
  const token = getStoredItem(ACCESS_TOKEN_KEY);
  const userInfo = getStoredItem(USER_INFO_KEY);

  if (token && userInfo) {
    try {
      currentUser = JSON.parse(userInfo);

      // Verify token is still valid
      getToken().then((validToken) => {
        if (!validToken) {
          clearTokens();
        }
      });
    } catch (error) {
      console.error("Failed to initialize auth state:", error);
      clearTokens();
    }
  }
}

// Auto-refresh token before expiry
if (isClient) {
  setInterval(async () => {
    const token = getStoredItem(ACCESS_TOKEN_KEY);
    const expiresAt = getStoredItem(TOKEN_EXPIRES_KEY);

    if (token && expiresAt) {
      const expires = parseInt(expiresAt, 10);
      const now = Date.now();
      const timeUntilExpiry = expires - now;

      // Refresh if token expires in less than 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        await refreshToken();
      }
    }
  }, 60 * 1000); // Check every minute
}

// Export auth utilities
export const auth = {
  login,
  logout,
  getToken,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  hasScope,
  addAuthListener,
  removeAuthListener,
};

export default auth;
