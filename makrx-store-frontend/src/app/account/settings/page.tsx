"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Trash2,
  Download,
  Upload,
} from "lucide-react";

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [emailNotifications, setEmailNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    priceDrops: false,
    newsletter: true,
  });
  const [pushNotifications, setPushNotifications] = useState({
    orderShipped: true,
    orderDelivered: true,
    promotions: false,
    reminders: true,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "preferences", label: "Preferences", icon: Globe },
    { id: "data", label: "Data & Privacy", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Account
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and settings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              {activeTab === "profile" && (
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">
                    Profile Information
                  </h2>

                  <div className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-3">
                          Upload Photo
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          defaultValue="John"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          defaultValue="Doe"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          defaultValue="john.doe@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          defaultValue="+1 (555) 123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          defaultValue="1990-01-15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-3">
                        Save Changes
                      </button>
                      <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-8">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Email Notifications
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(emailNotifications).map(
                          ([key, enabled]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium capitalize">
                                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {key === "orderUpdates" &&
                                    "Receive updates about your orders"}
                                  {key === "promotions" &&
                                    "Get notified about special offers"}
                                  {key === "newProducts" &&
                                    "Learn about new products"}
                                  {key === "priceDrops" &&
                                    "Get alerts when prices drop"}
                                  {key === "newsletter" &&
                                    "Receive our weekly newsletter"}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setEmailNotifications((prev) => ({
                                    ...prev,
                                    [key]: !enabled,
                                  }))
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  enabled ? "bg-blue-600" : "bg-gray-200"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    enabled ? "translate-x-6" : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Push Notifications
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(pushNotifications).map(
                          ([key, enabled]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium capitalize">
                                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {key === "orderShipped" &&
                                    "When your order ships"}
                                  {key === "orderDelivered" &&
                                    "When your order is delivered"}
                                  {key === "promotions" &&
                                    "Special offers and deals"}
                                  {key === "reminders" &&
                                    "Cart and wishlist reminders"}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setPushNotifications((prev) => ({
                                    ...prev,
                                    [key]: !enabled,
                                  }))
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  enabled ? "bg-blue-600" : "bg-gray-200"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    enabled ? "translate-x-6" : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">
                    Security Settings
                  </h2>

                  <div className="space-y-8">
                    {/* Change Password */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-medium mb-4">
                        Two-Factor Authentication
                      </h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">
                            2FA is enabled
                          </span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          Your account is protected with two-factor
                          authentication
                        </p>
                      </div>
                      <div className="space-x-3">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                          Manage 2FA
                        </button>
                        <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                          Disable 2FA
                        </button>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-medium mb-4">
                        Active Sessions
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-600">
                              Chrome on macOS • New York, NY
                            </p>
                            <p className="text-sm text-gray-500">
                              Last active: Now
                            </p>
                          </div>
                          <span className="text-green-600 text-sm font-medium">
                            Active
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium">Mobile App</p>
                            <p className="text-sm text-gray-600">
                              iPhone • New York, NY
                            </p>
                            <p className="text-sm text-gray-500">
                              Last active: 2 hours ago
                            </p>
                          </div>
                          <button className="text-red-600 text-sm hover:text-red-700">
                            Revoke
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">
                    Billing Information
                  </h2>

                  <div className="space-y-8">
                    {/* Payment Methods */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Payment Methods
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <CreditCard className="w-8 h-8 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-sm text-gray-600">
                                Expires 12/25
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              Default
                            </span>
                            <button className="text-blue-600 hover:text-blue-700">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-700">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      <button className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Add Payment Method
                      </button>
                    </div>

                    {/* Billing Address */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-medium mb-4">
                        Billing Address
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            defaultValue="123 Main Street"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            defaultValue="New York"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            defaultValue="10001"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Update Address
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">Preferences</h2>

                  <div className="space-y-8">
                    {/* Language & Region */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Language & Region
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                            <option>GBP (£)</option>
                            <option>CAD (C$)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Display Preferences */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-medium mb-4">
                        Display Preferences
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-gray-600">
                              Use dark theme across the site
                            </p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Compact View</p>
                            <p className="text-sm text-gray-600">
                              Show more items per page
                            </p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "data" && (
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">
                    Data & Privacy
                  </h2>

                  <div className="space-y-8">
                    {/* Data Export */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Export Your Data
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Download a copy of your account data including orders,
                        preferences, and activity.
                      </p>
                      <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />
                        Request Data Export
                      </button>
                    </div>

                    {/* Privacy Settings */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-medium mb-4">
                        Privacy Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Analytics & Tracking</p>
                            <p className="text-sm text-gray-600">
                              Allow us to improve your experience
                            </p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              Marketing Communications
                            </p>
                            <p className="text-sm text-gray-600">
                              Receive personalized recommendations
                            </p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-medium mb-4 text-red-600">
                        Danger Zone
                      </h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">
                          Delete Account
                        </h4>
                        <p className="text-red-700 text-sm mb-4">
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </p>
                        <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
