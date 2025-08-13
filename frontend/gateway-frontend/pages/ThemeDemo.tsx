import React, { useState } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Star,
  Heart,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Zap,
  Palette,
  Settings,
  User,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { ThemeToggle, useTheme, Card, Button, Text } from "../lib/theme-clean";
import {
  PrimaryIcon,
  AccentIcon,
  MutedIcon,
  InteractiveIcon,
} from "../components/ThemeAwareIcon";

export default function ThemeDemo() {
  const { theme, resolvedTheme } = useTheme();
  const [selectedTab, setSelectedTab] = useState("components");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const tabs = [
    { id: "components", label: "Components" },
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "forms", label: "Forms" },
    { id: "icons", label: "Icons" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-8 h-8 text-makrx-blue" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Theme Demo
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Explore MakrX's comprehensive dark and light mode implementation
          </p>

          {/* Theme Status */}
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Theme:{" "}
              <span className="font-bold text-makrx-blue">{theme}</span>
            </span>
            <span className="text-gray-400 dark:text-gray-500">|</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Resolved:{" "}
              <span className="font-bold text-makrx-blue">{resolvedTheme}</span>
            </span>
            <ThemeToggle variant="compact" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === tab.id
                    ? "bg-makrx-blue text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {selectedTab === "components" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Cards
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card variant="default" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Default Card
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Standard card with border and background that adapts to
                    theme.
                  </p>
                </Card>

                <Card variant="elevated" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Elevated Card
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Card with shadow elevation for emphasis.
                  </p>
                </Card>

                <Card variant="outline" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Outline Card
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Highlighted border card with hover effects.
                  </p>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Buttons
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="destructive">Destructive Button</Button>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Button Sizes
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Status Indicators
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-300 font-medium">
                    Success
                  </span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-yellow-800 dark:text-yellow-300 font-medium">
                    Warning
                  </span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-800 dark:text-red-300 font-medium">
                    Error
                  </span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-800 dark:text-blue-300 font-medium">
                    Info
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}

        {selectedTab === "colors" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Brand Colors
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    MakrX Blue
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-makrx-blue-50 border border-gray-200 dark:border-gray-700 rounded-lg"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        50
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-makrx-blue-600 rounded-lg"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Primary (600)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-makrx-blue-900 rounded-lg"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        900
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    MakrX Yellow
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-makrx-yellow-50 border border-gray-200 dark:border-gray-700 rounded-lg"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        50
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-makrx-yellow rounded-lg"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Primary (400)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-makrx-yellow-900 rounded-lg"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        900
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Gray Scale
              </h2>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                  (shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className={`w-16 h-16 bg-gray-${shade} rounded-lg mb-2 border border-gray-200 dark:border-gray-700`}
                      ></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {shade}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </section>
          </div>
        )}

        {selectedTab === "typography" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Text Components
              </h2>
              <div className="space-y-4">
                <Text variant="heading" as="h1">
                  Heading Text - Large and Bold
                </Text>
                <Text variant="subheading" as="h2">
                  Subheading Text - Medium Weight
                </Text>
                <Text variant="body">
                  Body Text - Regular weight and comfortable line height for
                  reading. This is the most common text style used throughout
                  the application.
                </Text>
                <Text variant="caption">
                  Caption Text - Smaller text for secondary information
                </Text>
                <Text variant="muted">
                  Muted Text - Even more subtle for least important text
                </Text>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Headings
              </h2>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Heading 1 - Main page titles
                </h1>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Heading 2 - Section titles
                </h2>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Heading 3 - Subsection titles
                </h3>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Heading 4 - Component titles
                </h4>
                <h5 className="text-lg font-medium text-gray-900 dark:text-white">
                  Heading 5 - Small titles
                </h5>
                <h6 className="text-base font-medium text-gray-900 dark:text-white">
                  Heading 6 - Tiny titles
                </h6>
              </div>
            </section>
          </div>
        )}

        {selectedTab === "forms" && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Form Elements
            </h2>
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-makrx-blue focus:ring-2 focus:ring-makrx-blue/20 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-makrx-blue focus:ring-2 focus:ring-makrx-blue/20 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-makrx-blue focus:ring-2 focus:ring-makrx-blue/20 transition-colors resize-none"
                  placeholder="Enter your message"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" variant="primary">
                  Submit Form
                </Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {selectedTab === "icons" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Theme-Aware Icons
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Primary Icons
                  </h3>
                  <div className="flex justify-center gap-4 mb-3">
                    <PrimaryIcon icon={User} size="lg" />
                    <PrimaryIcon icon={Mail} size="lg" />
                    <PrimaryIcon icon={Settings} size="lg" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Brand color icons
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Accent Icons
                  </h3>
                  <div className="flex justify-center gap-4 mb-3">
                    <AccentIcon icon={Star} size="lg" />
                    <AccentIcon icon={Zap} size="lg" />
                    <AccentIcon icon={Heart} size="lg" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Accent color icons
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Muted Icons
                  </h3>
                  <div className="flex justify-center gap-4 mb-3">
                    <MutedIcon icon={Phone} size="lg" />
                    <MutedIcon icon={Globe} size="lg" />
                    <MutedIcon icon={Info} size="lg" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Subtle secondary icons
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Interactive Icons
                  </h3>
                  <div className="flex justify-center gap-4 mb-3">
                    <InteractiveIcon icon={Sun} size="lg" />
                    <InteractiveIcon icon={Moon} size="lg" />
                    <InteractiveIcon icon={Monitor} size="lg" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hover-responsive icons
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Theme Toggle Controls */}
        <Card className="p-6 mt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Theme Controls
          </h2>
          <div className="flex flex-wrap gap-4">
            <ThemeToggle variant="default" showLabel />
            <ThemeToggle variant="compact" />
            <ThemeToggle variant="dropdown" showLabel />
          </div>
        </Card>
      </div>
    </div>
  );
}
