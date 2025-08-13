"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/SharedThemeProvider";

export function ThemeToggle() {
  const { theme, effectiveTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5" />;
      case "dark":
        return <Moon className="h-5 w-5" />;
      case "system":
        return <Monitor className="h-5 w-5" />;
      default:
        return <Sun className="h-5 w-5" />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case "light":
        return "Switch to dark mode";
      case "dark":
        return "Switch to system preference";
      case "system":
        return "Switch to light mode";
      default:
        return "Toggle theme";
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-all duration-200
        hover:bg-accent text-foreground hover:text-blue-600 dark:hover:text-blue-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
      `}
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      <div className="flex items-center justify-center">{getIcon()}</div>
    </button>
  );
}

// Compact version for mobile and dropdowns
export function ThemeToggleCompact() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light mode";
      case "dark":
        return "Dark mode";
      case "system":
        return "System";
      default:
        return "Theme";
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </button>
  );
}
