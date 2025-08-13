"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { withAuth } from "@/contexts/AuthContext";
import {
  useNotifications,
  requestNotificationPermission,
} from "@/contexts/NotificationContext";
import { api, type NotificationSettings } from "@/lib/api";
import {
  Bell,
  BellOff,
  Settings,
  Check,
  X,
  ArrowLeft,
  ShoppingCart,
  Package,
  AlertTriangle,
  Info,
} from "lucide-react";


function NotificationSettingsPage() {
  const { notifications, markAllAsRead, clearAll } = useNotifications();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: false,
    sms_notifications: false,
    marketing_emails: false,
    order_updates: true,
    product_updates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPushPermission();
  }, []);

  const loadSettings = async () => {
    try {
      // TODO: Implement getNotificationSettings API method
      // const userSettings = await api.getNotificationSettings();
      // setSettings(userSettings);
      setSettings(settings); // Use default settings for now
    } catch (error) {
      console.error("Failed to load notification settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkPushPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.updateNotificationSettings(settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const enablePushNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPushEnabled(granted);
    if (granted) {
      setSettings((prev) => ({ ...prev, push_notifications: true }));
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-green-600" />;
      case "error":
        return <X className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Account
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Notification Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage how you receive notifications from MakrX Store
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Notification Preferences
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Choose how you want to be notified
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      Receive notifications via email
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting(
                        "email_notifications",
                        !settings.email_notifications,
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.email_notifications
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.email_notifications
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Push Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      Receive browser notifications
                    </p>
                    {!pushEnabled && (
                      <button
                        onClick={enablePushNotifications}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                      >
                        Enable browser notifications
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      pushEnabled &&
                      updateSetting(
                        "push_notifications",
                        !settings.push_notifications,
                      )
                    }
                    disabled={!pushEnabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.push_notifications && pushEnabled
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    } ${!pushEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.push_notifications && pushEnabled
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Specific Notification Types */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Notification Types
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Order Updates
                          </span>
                          <p className="text-xs text-gray-600">
                            Status changes, shipping updates
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateSetting(
                            "order_updates",
                            !settings.order_updates,
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.order_updates ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.order_updates
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Processing Updates
                          </span>
                          <p className="text-xs text-gray-600">
                            3D printing progress, quote ready
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateSetting(
                            "processing_updates",
                            !settings.processing_updates,
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.processing_updates
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.processing_updates
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShoppingCart className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Marketing Emails
                          </span>
                          <p className="text-xs text-gray-600">
                            Promotions, new products
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateSetting(
                            "marketing_emails",
                            !settings.marketing_emails,
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.marketing_emails
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.marketing_emails
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Security Alerts
                          </span>
                          <p className="text-xs text-gray-600">
                            Login attempts, account changes
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateSetting(
                            "security_alerts",
                            !settings.security_alerts,
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.security_alerts
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.security_alerts
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="border-t border-gray-200 pt-6">
                  <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Notifications
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 ${!notification.read ? "bg-blue-50" : ""}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {notification.timestamp.toLocaleDateString()} at{" "}
                              {notification.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(NotificationSettingsPage);
