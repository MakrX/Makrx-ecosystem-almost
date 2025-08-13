# MakrX Theme System

A robust, accessible theme system implementing best practices for light/dark mode with system preference detection.

## 🎯 Core Goals (✅ All Implemented)

✅ **Default to user's OS preference** (system theme)  
✅ **Allow manual override** to light or dark  
✅ **Persist choice across sessions** (localStorage)  
✅ **Respect prefers-reduced-motion** when animating transitions  
✅ **No Flash of Incorrect Theme (FOIT)** during initial load  

## 🏗️ Architecture

### Detection & Defaults
- Uses CSS media query: `@media (prefers-color-scheme: dark)`
- On first visit detects:
  - If user has saved preference → use that
  - Else → match `window.matchMedia("(prefers-color-scheme: dark)")`

### State Management
- **Client-side with anti-FOIT protection**
- Store preference in `localStorage` with key `makrx-theme`
- Apply theme via React context + Tailwind's `darkMode: 'class'`
- **Anti-FOIT script** injected in HTML head to prevent flash

### Theme Application Priority
1. **Manual selection** (light/dark) - Always takes priority
2. **System preference** - Only when theme is set to "system"
3. **Fallback** - Light theme if no preference detected

## ⚙️ Implementation

### 1. Tailwind Configuration
```typescript
// tailwind.config.ts
module.exports = {
  darkMode: 'class', // Enable JS-controlled dark mode
  // ... rest of config
};
```

### 2. Theme Provider
```tsx
import { ThemeProvider } from './lib/theme';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### 3. Using the Theme Hook
```tsx
import { useTheme } from './lib/theme';

function Component() {
  const { theme, resolvedTheme, setTheme, systemTheme } = useTheme();
  
  // theme: 'system' | 'light' | 'dark' (user preference)
  // resolvedTheme: 'light' | 'dark' (actual applied theme)
  // systemTheme: 'light' | 'dark' (OS preference)
  
  return (
    <div>
      Current theme: {theme} (resolved: {resolvedTheme})
    </div>
  );
}
```

### 4. Theme Toggle Component
```tsx
import { ThemeToggle } from './lib/theme';

// Compact button (icon only)
<ThemeToggle variant="compact" />

// Dropdown with options
<ThemeToggle variant="dropdown" showLabel />

// Default button
<ThemeToggle showLabel />
```

## 🎨 Theme Switcher States

### Three-State Toggle
1. **System** (default) - Follows OS preference
2. **Light** - Force light mode
3. **Dark** - Force dark mode

### Visual Indicators
- **System**: Monitor icon
- **Light**: Sun icon  
- **Dark**: Moon icon

## 🚀 Transition Animations

### Smooth Theme Transitions
```css
html {
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-transition {
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  html {
    transition: none !important;
  }
  
  .theme-transition {
    transition: none !important;
  }
}
```

## 🎨 Theming Strategy

### Light Theme
- **Backgrounds**: White (#ffffff), light grays
- **Text**: Dark grays (#111827), black
- **Borders**: Light grays (#e5e7eb)

### Dark Theme  
- **Backgrounds**: Very dark (#0a0a0a), dark slate colors
- **Text**: Light grays (#e2e8f0), white
- **Borders**: Dark slate (#1e293b)

### Brand Consistency
- **Primary**: MakrX Blue - same in both themes
- **Accent**: MakrX Yellow - brightness adjusted for contrast
- **Success/Error/Warning**: Consistent hues, brightness adjusted

### Color Usage Examples
```css
/* Light theme */
.bg-primary { @apply bg-white dark:bg-slate-950; }
.text-primary { @apply text-gray-900 dark:text-gray-100; }
.border-primary { @apply border-gray-200 dark:border-slate-800; }

/* Active states */
.text-active { @apply text-makrx-blue dark:text-makrx-yellow; }
```

## 🛡️ Anti-FOIT Protection

### Problem
Without protection, users see a brief flash of the wrong theme during page load.

### Solution
Inline script in HTML head that:
1. Reads localStorage preference immediately
2. Falls back to system preference  
3. Sets `class="dark"` on `<html>` before CSS loads
4. Sets `data-theme` and `colorScheme` attributes

```html
<script>
  (function() {
    try {
      var theme = localStorage.getItem('makrx-theme') || 'system';
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
      
      document.documentElement.classList.add(resolvedTheme);
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      document.documentElement.style.colorScheme = resolvedTheme;
    } catch (e) {
      console.warn('Theme initialization failed:', e);
    }
  })();
</script>
```

## 📱 Mobile Browser Support

### Meta Theme Color
Automatically updates `theme-color` meta tag for mobile browser UI:
- **Light theme**: `#1e40af` (MakrX Blue)
- **Dark theme**: `#0a0a0a` (Very dark background)

```html
<meta name="theme-color" content="#1e40af" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
```

## ♿ Accessibility Features

### ARIA Labels
- Descriptive button labels indicating current state and next action
- Screen reader friendly theme descriptions

### Focus Management  
- Proper focus rings with MakrX Yellow (`focus-visible:ring-makrx-yellow`)
- Keyboard navigation support

### Color Contrast
- WCAG 2.1 AA compliant contrast ratios
- Enhanced visibility in dark mode with brighter text colors

### Reduced Motion
- Respects `prefers-reduced-motion: reduce`
- Disables all transitions when user prefers reduced motion

## 🔧 Troubleshooting

### Theme Not Persisting
- Check localStorage permissions
- Verify `storageKey` parameter in ThemeProvider

### Flash of Wrong Theme
- Ensure anti-FOIT script is in HTML head
- Check script execution order

### Transitions Not Working
- Verify CSS is loaded
- Check for `prefers-reduced-motion` override

### System Theme Not Detected
- Check `window.matchMedia` support
- Verify browser compatibility

## 🚀 Performance Notes

- **Zero runtime overhead** for theme detection (uses CSS media queries)
- **Minimal JavaScript** - only for user interactions
- **CSS-only transitions** - no JavaScript animation loops
- **localStorage caching** - prevents repeated system queries

## 🔮 Future Enhancements

- [ ] High contrast mode support
- [ ] Custom color scheme picker
- [ ] Automatic theme scheduling (like f.lux)
- [ ] Integration with system accent colors
- [ ] Theme-aware image variations
