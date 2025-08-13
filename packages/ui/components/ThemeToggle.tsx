import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export function ThemeToggle({ variant = 'default', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  if (variant === 'icon-only') {
    const currentTheme = themes.find(t => t.value === theme) || themes[0];
    const Icon = currentTheme.icon;
    
    return (
      <button
        onClick={() => {
          const currentIndex = themes.findIndex(t => t.value === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].value);
        }}
        className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${className}`}
        aria-label={`Switch theme (current: ${currentTheme.label})`}
      >
        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        {themes.map(({ value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`p-1.5 rounded-md transition-colors ${
              theme === value
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            aria-label={`Switch to ${value} theme`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
    );
  }

  // Default variant - dropdown style
  return (
    <div className={`relative group ${className}`}>
      <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        {effectiveTheme === 'light' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        <span className="hidden sm:block">
          {themes.find(t => t.value === theme)?.label || 'Theme'}
        </span>
      </button>

      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors ${
                theme === value
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
