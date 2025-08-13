"use client";

import { useTheme } from "@/contexts/SharedThemeProvider";
import { Sun, Moon, Monitor, Palette } from "lucide-react";

export function DarkModeDemo() {
  const { theme, effectiveTheme, setTheme } = useTheme();

  return (
    <div className="p-6 max-w-md mx-auto bg-card border border-border rounded-lg shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Theme Settings
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Current theme: <span className="font-medium">{theme}</span>
        {theme === "system" && <span> (using {effectiveTheme} mode)</span>}
      </p>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setTheme("light")}
          className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
            theme === "light"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background hover:bg-accent hover:text-accent-foreground border-border"
          }`}
        >
          <Sun className="h-5 w-5 mb-1" />
          <span className="text-xs">Light</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
            theme === "dark"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background hover:bg-accent hover:text-accent-foreground border-border"
          }`}
        >
          <Moon className="h-5 w-5 mb-1" />
          <span className="text-xs">Dark</span>
        </button>

        <button
          onClick={() => setTheme("system")}
          className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
            theme === "system"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background hover:bg-accent hover:text-accent-foreground border-border"
          }`}
        >
          <Monitor className="h-5 w-5 mb-1" />
          <span className="text-xs">System</span>
        </button>
      </div>

      <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Try switching between light, dark, and system themes to see the
          real-time changes!
        </p>
      </div>
    </div>
  );
}
