"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Real-time connection setup
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Setup WebSocket for real-time notifications
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/notifications/${user.id}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("Connected to notification WebSocket");
        };

        ws.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            addNotification({
              type: notification.type || "info",
              title: notification.title,
              message: notification.message,
              actionUrl: notification.action_url,
              actionLabel: notification.action_label,
            });
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected, attempting to reconnect...");
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isAuthenticated, user]);

  // Polling for notifications fallback
  useEffect(() => {
    if (!isAuthenticated) return;

    const pollNotifications = async () => {
      try {
        const notifications = await api.getNotifications();
        setNotifications(
          notifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          })),
        );
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    // Initial load
    pollNotifications();

    // Poll every 30 seconds as fallback
    const interval = setInterval(pollNotifications, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Show browser notification if permission granted
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: newNotification.id,
      });
    }

    // Auto-remove success notifications after 5 seconds
    if (notification.type === "success") {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

    try {
      await api.markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await api.markAllNotificationsAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}

// Request notification permission
export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}
