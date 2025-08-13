# MakrX Packages - Shared Components & Utilities

This directory contains shared packages used across all MakrX frontend applications. These packages promote code reuse, consistency, and maintainability across the ecosystem.

## 📁 Package Structure

```
packages/
├── feature-flags/     # Feature flag system
├── types/            # Shared TypeScript types
├── ui/               # Shared UI components and contexts
└── utils/            # Shared utility functions
```

## 📦 Package Details

### `feature-flags/`
**Purpose**: Centralized feature flag management system

**Key Files**:
- `src/core/FeatureFlagEngine.ts`: Core feature flag logic
- `src/components/FeatureFlagProvider.tsx`: React context provider
- `src/hooks/useFeatureFlags.ts`: React hook for accessing flags
- `src/flags/index.ts`: Feature flag definitions

**Parameters & Configuration**:
- Flag definitions: Enable/disable features across applications
- User-based targeting: Show features to specific user groups
- Environment-based flags: Different flags for dev/staging/prod

**Impact**: Changes affect feature availability across all applications

**Usage**:
```typescript
import { useFeatureFlags } from '@makrx/feature-flags';
const { isEnabled } = useFeatureFlags();
if (isEnabled('NEW_CHECKOUT_FLOW')) { /* render new feature */ }
```

### `types/`
**Purpose**: Shared TypeScript type definitions

**Key Files**:
- `index.ts`: Exports all shared types
- `makerspace.ts`: Makerspace-related type definitions
- `package.json`: Package configuration

**Parameters & Configuration**:
- Type definitions for API responses
- Shared interface definitions
- Common enum values

**Impact**: Changes affect type safety across all applications

**Usage**:
```typescript
import { Makerspace, User, Product } from '@makrx/types';
```

### `ui/`
**Purpose**: Shared UI components, contexts, and utilities

**Key Files**:
- `components/`: Reusable React components
- `contexts/`: Shared React contexts (Theme, etc.)
- `utils/`: UI-related utility functions
- `index.ts`: Package exports

**Parameters & Configuration**:
- Theme configuration: Colors, fonts, spacing
- Component props: Customizable component behavior
- Context providers: Global state management

**Impact**: Changes affect UI consistency across all applications

**Usage**:
```typescript
import { ThemeProvider, ThemeToggle, MakrXButton } from '@makrx/ui';
```

### `utils/`
**Purpose**: Shared utility functions

**Key Files**:
- `index.ts`: Utility function exports
- Various utility modules

**Parameters & Configuration**:
- Helper functions for common operations
- Data formatting utilities
- Validation functions

**Impact**: Changes affect shared logic across applications

**Usage**:
```typescript
import { formatPrice, validateEmail, debounce } from '@makrx/utils';
```

## 🔧 Development Guidelines

### Adding New Packages
1. Create new directory under `packages/`
2. Add `package.json` with appropriate configuration
3. Export functionality through `index.ts`
4. Update workspace dependencies

### Versioning
- All packages should follow semantic versioning
- Breaking changes require major version bumps
- Coordinate updates across consuming applications

### Dependencies
- Keep external dependencies minimal
- Prefer peer dependencies for React/framework packages
- Document required peer dependencies

### Testing
- Each package should have its own test suite
- Use Jest for unit testing
- Test components with React Testing Library

## 📋 Package Configuration

### Shared `package.json` Structure
```json
{
  "name": "@makrx/package-name",
  "version": "1.0.0",
  "main": "index.ts",
  "types": "index.ts",
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

### Import Configuration
All packages are configured to be imported with the `@makrx/` namespace:
- `@makrx/ui`
- `@makrx/types`
- `@makrx/utils`
- `@makrx/feature-flags`

This provides clear namespacing and prevents conflicts with external packages.

## 🎯 Usage Across Applications

### Frontend Applications Using These Packages:
- **Gateway Frontend**: Uses UI components, types, utils
- **MakrCave Frontend**: Uses all packages extensively
- **Store Frontend**: Uses UI components, feature flags, types

### Import Examples:
```typescript
// Theme system
import { ThemeProvider } from '@makrx/ui';

// Feature flags
import { useFeatureFlags } from '@makrx/feature-flags';

// Shared types
import { Product, User } from '@makrx/types';

// Utilities
import { formatPrice } from '@makrx/utils';
```

## 🔄 Maintenance & Updates

### When to Update Packages:
- New shared functionality needed across apps
- Bug fixes in shared components
- Breaking changes in dependencies
- Performance improvements

### Update Process:
1. Make changes in package
2. Update version in `package.json`
3. Update consuming applications
4. Test across all applications
5. Deploy coordinated updates

This package structure ensures consistency, reusability, and maintainability across the entire MakrX ecosystem.
