/**
 * @fileoverview MakrX Theme Management System
 *
 * This module provides a comprehensive theme management solution for the MakrX ecosystem.
 * It supports light/dark themes with automatic system theme detection and persistence.
 *
 * Features:
 * - Light, dark, and system theme modes
 * - Automatic system preference detection
 * - localStorage persistence across sessions
 * - Real-time theme switching
 * - SSR-compatible initialization
 * - CSS class and data-attribute support
 *
 * Storage: Theme preference is stored in localStorage as 'makrx-theme'
 * CSS Integration: Applies 'light'/'dark' classes to document root
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Available theme options
 * - 'light': Force light theme
 * - 'dark': Force dark theme
 * - 'system': Use OS/browser preference
 */
type Theme = 'light' | 'dark' | 'system';

/**
 * Theme context interface providing theme state and controls
 */
interface ThemeContextType {
  /** Current theme setting (user's choice) */
  theme: Theme;
  /** Function to change theme setting */
  setTheme: (theme: Theme) => void;
  /** Resolved theme (what's actually applied) */
  effectiveTheme: 'light' | 'dark';
}

/**
 * React context for theme management
 * Undefined by default to enforce provider usage
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component that manages theme state for the entire application
 *
 * This provider should wrap the entire app to ensure theme context is available
 * to all components. It handles:
 * - Theme persistence via localStorage
 * - System theme detection and monitoring
 * - CSS class application to document root
 * - SSR-safe initialization
 *
 * @param children - React components to wrap with theme context
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from localStorage or default to 'system'
  // SSR-safe: defaults to 'system' on server, reads from localStorage on client
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('makrx-theme') as Theme;
      return stored || 'system';
    }
    return 'system'; // Default for SSR
  });

  // Track the resolved theme (light or dark) that gets applied to UI
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Effect to determine and monitor the effective theme
  useEffect(() => {
    /**
     * Updates the effective theme based on current theme setting
     * - If theme is 'system': detects OS preference using media query
     * - If theme is 'light' or 'dark': uses that value directly
     */
    const updateEffectiveTheme = () => {
      if (theme === 'system') {
        // Use CSS media query to detect OS/browser theme preference
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setEffectiveTheme(systemTheme);
      } else {
        // Use explicit theme setting
        setEffectiveTheme(theme);
      }
    };

    // Initial theme calculation
    updateEffectiveTheme();

    // Set up listener for system theme changes (only when using 'system' mode)
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Listen for OS theme changes and update accordingly
      mediaQuery.addEventListener('change', updateEffectiveTheme);

      // Cleanup listener when component unmounts or theme changes
      return () => mediaQuery.removeEventListener('change', updateEffectiveTheme);
    }
  }, [theme]);

  // Effect to apply theme to DOM and persist user preference
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove any existing theme classes to avoid conflicts
    root.classList.remove('light', 'dark');

    // Add the current effective theme class for CSS styling
    // This enables Tailwind's dark: modifier and custom CSS selectors
    root.classList.add(effectiveTheme);

    // Also set data-theme attribute for additional CSS selector support
    // Allows selectors like [data-theme="dark"] for more specific styling
    root.setAttribute('data-theme', effectiveTheme);

    // Persist user's theme preference (not the effective theme)
    // This ensures we remember if user chose 'system', 'light', or 'dark'
    localStorage.setItem('makrx-theme', theme);
  }, [theme, effectiveTheme]);

  // Create context value object
  const value: ThemeContextType = {
    theme,           // User's theme choice ('light', 'dark', 'system')
    setTheme,        // Function to update theme choice
    effectiveTheme   // Resolved theme that's actually applied ('light' or 'dark')
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context in components
 *
 * Provides access to:
 * - theme: Current user theme setting
 * - setTheme: Function to change theme
 * - effectiveTheme: Resolved theme being applied
 *
 * @throws Error if used outside of ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, effectiveTheme } = useTheme();
 *
 *   return (
 *     <div className={effectiveTheme === 'dark' ? 'dark-bg' : 'light-bg'}>
 *       <button onClick={() => setTheme('dark')}>Dark Mode</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  // Enforce provider usage - prevents runtime errors from missing context
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
