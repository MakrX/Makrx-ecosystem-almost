# @makrx/ui - Shared UI Components & System

This package contains the shared UI component system used across all MakrX frontend applications. It provides consistent design patterns, theming, and reusable components.

## 📁 Directory Structure

```
packages/ui/
├── components/          # Reusable React components
│   ├── MakrXButton.tsx # Branded button component
│   ├── MakrXCard.tsx   # Branded card component
│   └── ThemeToggle.tsx # Theme switching component
├── contexts/           # React contexts for global state
│   └── ThemeContext.tsx # Theme management context
├── utils/             # UI utility functions
│   └── cn.ts          # Class name utility
├── index.ts           # Package exports
└── package.json       # Package configuration
```

## 🎨 Components

### `ThemeToggle.tsx`
**Purpose**: Universal theme switching component with multiple display variants

**Props & Parameters**:
```typescript
interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}
```

**Variants**:
- `default`: Dropdown with text labels
- `compact`: Smaller dropdown
- `icon-only`: Just the theme icon

**Configuration Impact**:
- `variant`: Changes display style and size
- `className`: Additional styling customization

**Usage Across Apps**:
- Gateway Frontend: Header navigation
- MakrCave Frontend: Header and dashboard
- Store Frontend: Header and settings

**Example**:
```typescript
import { ThemeToggle } from '@makrx/ui';

// Default dropdown style
<ThemeToggle />

// Icon-only for compact spaces
<ThemeToggle variant="icon-only" />

// Custom styling
<ThemeToggle className="ml-4" variant="compact" />
```

### `MakrXButton.tsx`
**Purpose**: Branded button component with consistent styling across the ecosystem

**Props & Parameters**:
```typescript
interface MakrXButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

**Configuration Impact**:
- `variant`: Changes color scheme and styling
- `size`: Affects padding, font size, and height
- `loading`: Shows loading spinner and disables interaction

**Usage**: Call-to-action buttons, form submissions, navigation

**Example**:
```typescript
import { MakrXButton } from '@makrx/ui';

<MakrXButton variant="primary" size="lg" onClick={handleSubmit}>
  Get Started
</MakrXButton>
```

### `MakrXCard.tsx`
**Purpose**: Branded card container with consistent styling

**Props & Parameters**:
```typescript
interface MakrXCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  hoverable?: boolean;
}
```

**Configuration Impact**:
- `title`/`subtitle`: Structured content headers
- `hoverable`: Adds hover effects for interactive cards
- `footer`: Additional content area

**Usage**: Product cards, feature highlights, content containers

**Example**:
```typescript
import { MakrXCard } from '@makrx/ui';

<MakrXCard 
  title="3D Printing Services" 
  subtitle="Professional quality prints"
  hoverable
>
  <p>Content here...</p>
</MakrXCard>
```

## 🎨 Contexts

### `ThemeContext.tsx`
**Purpose**: Global theme management for the entire MakrX ecosystem

**Context Values**:
```typescript
interface ThemeContextType {
  theme: Theme;                    // 'light' | 'dark' | 'system'
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark'; // Resolved theme
}
```

**Key Features**:
- **System Theme Detection**: Automatically detects OS theme preference
- **Local Storage Persistence**: Remembers user's theme choice
- **SSR Compatible**: Handles server-side rendering gracefully
- **Real-time Updates**: Updates all components instantly

**Configuration Impact**:
- Theme changes affect all applications simultaneously
- Stored preference persists across sessions
- System theme changes are detected automatically

**Usage Across Apps**:
```typescript
import { ThemeProvider, useTheme } from '@makrx/ui';

// App root level
function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

// Component level
function Component() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  return <div className={effectiveTheme === 'dark' ? 'dark-styles' : 'light-styles'} />;
}
```

**Storage Key**: `makrx-theme` (stored in localStorage)

## 🛠 Utils

### `cn.ts`
**Purpose**: Class name utility function for conditional and merged styling

**Function Signature**:
```typescript
function cn(...inputs: ClassValue[]): string
```

**Features**:
- Merges multiple class names
- Handles conditional classes
- Resolves Tailwind CSS conflicts
- Type-safe with TypeScript

**Usage Examples**:
```typescript
import { cn } from '@makrx/ui';

// Basic merging
cn('base-class', 'additional-class')

// Conditional classes
cn('base-class', {
  'active-class': isActive,
  'disabled-class': isDisabled
})

// Complex conditional logic
cn(
  'btn',
  variant === 'primary' && 'btn-primary',
  variant === 'secondary' && 'btn-secondary',
  size === 'lg' && 'btn-lg',
  className
)
```

**Impact**: Ensures consistent class name handling across all components

## 📦 Package Configuration

### `package.json`
```json
{
  "name": "@makrx/ui",
  "version": "1.0.0",
  "main": "index.ts",
  "types": "index.ts",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0",
    "lucide-react": "^0.263.1"
  }
}
```

### `index.ts` - Package Exports
```typescript
// Components
export { ThemeToggle } from './components/ThemeToggle';
export { MakrXButton } from './components/MakrXButton';
export { MakrXCard } from './components/MakrXCard';

// Contexts
export { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Utils
export { cn } from './utils/cn';
```

## 🎯 Design System Integration

### Theme Tokens
The UI system integrates with Tailwind CSS for consistent design tokens:

**Colors**:
- `primary`: Blue brand color (#3B82F6)
- `secondary`: Gray tones
- `accent`: Purple highlights

**Typography**:
- Font family: Inter
- Scale: text-xs to text-6xl
- Weights: 400, 500, 600, 700

**Spacing**:
- Consistent padding/margin scale
- Component-specific spacing tokens

### Dark Mode Support
All components support automatic dark mode through:
- CSS class-based theme switching
- Tailwind CSS dark: variants
- Automatic color scheme detection

## 🔄 Development & Maintenance

### Adding New Components
1. Create component in `components/` directory
2. Follow existing naming conventions (`MakrX` prefix)
3. Include TypeScript interfaces
4. Support theming through CSS classes
5. Export from `index.ts`

### Component Guidelines
- Use Tailwind CSS for styling
- Support both light and dark themes
- Include proper TypeScript types
- Follow accessibility best practices
- Maintain consistent API patterns

### Testing
```bash
# Run component tests
npm test

# Run in watch mode
npm test -- --watch
```

### Building
```bash
# Build package
npm run build

# Type check
npm run type-check
```

This UI package ensures visual consistency, accessibility, and maintainability across the entire MakrX ecosystem.
