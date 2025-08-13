"use client";

import React from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import {
  useNotifications,
  type Notification,
} from "@/contexts/NotificationContext";

export default function ToastNotifications() {
  const { notifications, removeNotification } = useNotifications();

  // Only show recent notifications (last 5 minutes) that haven't been read
  const recentNotifications = notifications
    .filter((notification) => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return notification.timestamp > fiveMinutesAgo && !notification.read;
    })
    .slice(0, 3); // Limit to 3 toasts

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  if (recentNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {recentNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            max-w-sm rounded-lg border shadow-lg p-4 transform transition-all duration-300 ease-in-out
            ${getBackgroundColor(notification.type)}
            animate-in slide-in-from-right-full
          `}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">{getIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-700 mt-1">
                {notification.message}
              </p>
              {notification.actionUrl && notification.actionLabel && (
                <a
                  href={notification.actionUrl}
                  className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {notification.actionLabel}
                </a>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
