"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface PortalAuthContextValue {
  handlePortalAuth: () => void;
  isPortalAuthenticated: boolean;
  getPortalAuthToken: () => string | null;
}

const PortalAuthContext = createContext<PortalAuthContextValue | undefined>(
  undefined,
);

export function PortalAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { login } = useAuth();
  const [isPortalAuthenticated, setIsPortalAuthenticated] = useState(false);

  useEffect(() => {
    // Check for portal authentication token in URL
    const handlePortalAuth = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get("auth_token");
      const isPortalAuth = urlParams.get("portal_auth") === "true";

      if (authToken && isPortalAuth) {
        console.log("Portal authentication token detected in MakrCave");

        // Store token for API requests
        localStorage.setItem("portal_auth_token", authToken);
        localStorage.setItem("portal_auth_timestamp", Date.now().toString());

        // Set authentication state
        setIsPortalAuthenticated(true);

        // Clean up URL parameters
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);

        // Trigger login with portal token
        login(authToken);
      } else {
        // Check for existing portal token
        const storedToken = localStorage.getItem("portal_auth_token");
        const timestamp = localStorage.getItem("portal_auth_timestamp");

        if (storedToken && timestamp) {
          const tokenAge = Date.now() - parseInt(timestamp);
          const tokenValidHours = 24; // 24 hours

          if (tokenAge < tokenValidHours * 60 * 60 * 1000) {
            setIsPortalAuthenticated(true);
          } else {
            // Token expired, clean up
            localStorage.removeItem("portal_auth_token");
            localStorage.removeItem("portal_auth_timestamp");
          }
        }
      }
    };

    handlePortalAuth();
  }, [login]);

  // Listen for cross-portal sign out messages
  useEffect(() => {
    const handleCrossPortalMessage = (event: MessageEvent) => {
      if (event.data?.type === "CROSS_PORTAL_SIGNOUT") {
        console.log("Received cross-portal signout message in MakrCave");

        // Clear portal authentication
        localStorage.removeItem("portal_auth_token");
        localStorage.removeItem("portal_auth_timestamp");
        setIsPortalAuthenticated(false);

        // Could also trigger a logout here if needed
        // logout();
      }
    };

    window.addEventListener("message", handleCrossPortalMessage);
    return () =>
      window.removeEventListener("message", handleCrossPortalMessage);
  }, []);

  const getPortalAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("portal_auth_token");
    }
    return null;
  };

  const value: PortalAuthContextValue = {
    handlePortalAuth: () => {
      // This function can be called manually if needed
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get("auth_token");
      if (authToken) {
        localStorage.setItem("portal_auth_token", authToken);
        setIsPortalAuthenticated(true);
        login(authToken);
      }
    },
    isPortalAuthenticated,
    getPortalAuthToken,
  };

  return (
    <PortalAuthContext.Provider value={value}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (context === undefined) {
    throw new Error("usePortalAuth must be used within a PortalAuthProvider");
  }
  return context;
}

// Enhanced API service for portal-aware requests
export class PortalAwareApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add portal auth token if available
    const portalToken = localStorage.getItem("portal_auth_token");
    if (portalToken) {
      headers["X-Portal-Auth-Token"] = portalToken;
    }

    // Add standard auth token if available
    const authToken = localStorage.getItem("auth_token");
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
  }

  async get(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  async post(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  async put(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  async delete(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  // Cross-service API calls
  async callStoreAPI(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const storeApiUrl =
      process.env.NEXT_PUBLIC_STORE_API_URL || "http://localhost:8003";

    const response = await fetch(`${storeApiUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Store API request failed: ${response.status}`);
    }

    return response.json();
  }

  async callAuthService(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const authServiceUrl =
      process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:8001";

    const response = await fetch(`${authServiceUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Auth service request failed: ${response.status}`);
    }

    return response.json();
  }
}

// Create portal-aware API service instance
export const portalApiService = new PortalAwareApiService(
  process.env.NEXT_PUBLIC_MAKRCAVE_API_URL || "http://localhost:8002",
);
