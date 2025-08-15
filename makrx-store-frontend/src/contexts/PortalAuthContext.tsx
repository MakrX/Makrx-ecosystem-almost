"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { auth } from "@/lib/auth";

interface PortalAuthContextValue {
  handlePortalAuth: () => void;
  isPortalAuthenticated: boolean;
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
        console.log("Portal authentication token detected");

        // Store token for API requests
        localStorage.setItem("portal_auth_token", authToken);
        localStorage.setItem("portal_auth_timestamp", Date.now().toString());

        // Set authentication state
        setIsPortalAuthenticated(true);

        // Clean up URL parameters
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);

        // Trigger login via Keycloak
        login();
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
        console.log("Received cross-portal signout message in Store");

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

  const value: PortalAuthContextValue = {
    handlePortalAuth: () => {
      // This function can be called manually if needed
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get("auth_token");
      if (authToken) {
        localStorage.setItem("portal_auth_token", authToken);
        setIsPortalAuthenticated(true);
        login();
      }
    },
    isPortalAuthenticated,
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

// Utility function to get portal auth token for API requests
export function getPortalAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("portal_auth_token");
  }
  return null;
}

// Enhanced API client for portal-aware requests
export async function portalAwareApiRequest(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const portalToken = getPortalAuthToken();

  const headers = new Headers(options.headers);

  // Add portal auth token if available
  if (portalToken) {
    headers.set("X-Portal-Auth-Token", portalToken);
  }

  // Add standard auth token if available
  const authToken = await auth.getToken();
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
