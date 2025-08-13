# @makrx/feature-flags - Dynamic Feature Management

This package provides a comprehensive feature flag system for the MakrX ecosystem, enabling controlled feature rollouts, A/B testing, and environment-specific functionality.

## 📁 Directory Structure

```
packages/feature-flags/
├── src/
│   ├── components/           # React components for feature flags
│   │   ├── FeatureFlagProvider.tsx  # Context provider
│   │   └── FlagGuard.tsx           # Conditional rendering wrapper
│   ├── core/                # Core feature flag logic
│   │   └── FeatureFlagEngine.ts    # Flag evaluation engine
│   ├── flags/               # Feature flag definitions
│   │   └── index.ts         # Flag registry and configuration
│   ├── hooks/               # React hooks
│   │   └── useFeatureFlags.ts      # Hook for accessing flags
│   └── index.ts             # Package exports
├── package.json             # Package configuration
└── README.md               # This documentation
```

## 🚩 Core Components

### `FeatureFlagProvider.tsx`
**Purpose**: React context provider that makes feature flags available throughout the application

**Configuration**:
```typescript
interface FeatureFlagProviderProps {
  children: React.ReactNode;
  userId?: string;           // For user-specific targeting
  environment?: string;      // Environment-based flags
  customContext?: Record<string, any>; // Additional context
}
```

**Key Parameters**:
- `userId`: Enables user-specific feature targeting
- `environment`: Allows different flags per environment (dev/staging/prod)
- `customContext`: Additional data for complex flag logic

**Impact**: Changes affect feature availability across the entire application

**Usage**:
```tsx
import { FeatureFlagProvider } from '@makrx/feature-flags';

function App() {
  return (
    <FeatureFlagProvider userId="user123" environment="production">
      <YourApp />
    </FeatureFlagProvider>
  );
}
```

### `FlagGuard.tsx`
**Purpose**: Conditional rendering component that shows/hides content based on feature flags

**Props**:
```typescript
interface FlagGuardProps {
  flag: string;              // Flag name to check
  fallback?: React.ReactNode; // Content to show when flag is disabled
  children: React.ReactNode;  // Content to show when flag is enabled
  requireAll?: boolean;       // For multiple flags
  flags?: string[];          // Multiple flags to check
}
```

**Usage Examples**:
```tsx
import { FlagGuard } from '@makrx/feature-flags';

// Simple flag check
<FlagGuard flag="NEW_CHECKOUT_FLOW">
  <NewCheckoutComponent />
</FlagGuard>

// With fallback content
<FlagGuard 
  flag="BETA_FEATURES" 
  fallback={<div>Feature coming soon!</div>}
>
  <BetaFeatureComponent />
</FlagGuard>

// Multiple flags (all required)
<FlagGuard 
  flags={["USER_DASHBOARD", "ANALYTICS_MODULE"]} 
  requireAll={true}
>
  <AdvancedDashboard />
</FlagGuard>
```

### `FeatureFlagEngine.ts`
**Purpose**: Core engine that evaluates feature flag conditions and rules

**Key Methods**:
```typescript
class FeatureFlagEngine {
  // Check if a single flag is enabled
  isEnabled(flagName: string, context?: EvaluationContext): boolean;
  
  // Get flag value (for non-boolean flags)
  getValue<T>(flagName: string, defaultValue: T, context?: EvaluationContext): T;
  
  // Batch check multiple flags
  getFlags(flagNames: string[], context?: EvaluationContext): Record<string, boolean>;
  
  // Register new flag definitions
  registerFlag(flag: FeatureFlag): void;
  
  // Update flag configuration
  updateFlag(flagName: string, updates: Partial<FeatureFlag>): void;
}
```

**Configuration Types**:
```typescript
interface FeatureFlag {
  name: string;
  enabled: boolean;
  conditions?: FlagCondition[];
  variants?: FlagVariant[];
  rolloutPercentage?: number;
  environments?: string[];
  userTargeting?: UserTargeting;
}

interface FlagCondition {
  type: 'user_id' | 'environment' | 'percentage' | 'custom';
  operator: 'equals' | 'in' | 'greater_than' | 'less_than';
  value: any;
}
```

**Usage**:
```typescript
import { FeatureFlagEngine } from '@makrx/feature-flags';

const engine = new FeatureFlagEngine();

// Register a flag
engine.registerFlag({
  name: 'NEW_UI',
  enabled: true,
  environments: ['development', 'staging'],
  rolloutPercentage: 25
});

// Check flag
const showNewUI = engine.isEnabled('NEW_UI', { 
  userId: 'user123',
  environment: 'production'
});
```

### `useFeatureFlags.ts`
**Purpose**: React hook providing easy access to feature flags in components

**Hook Interface**:
```typescript
interface UseFeatureFlagsReturn {
  isEnabled: (flagName: string) => boolean;
  getValue: <T>(flagName: string, defaultValue: T) => T;
  flags: Record<string, boolean>;
  loading: boolean;
  error?: Error;
}
```

**Usage Examples**:
```tsx
import { useFeatureFlags } from '@makrx/feature-flags';

function MyComponent() {
  const { isEnabled, getValue, flags, loading } = useFeatureFlags();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {isEnabled('NEW_HEADER') && <NewHeader />}
      
      {getValue('BANNER_TEXT', 'Default banner')}
      
      {flags.SHOW_ANALYTICS && <AnalyticsWidget />}
    </div>
  );
}
```

## 🏁 Flag Definitions

### `flags/index.ts`
**Purpose**: Central registry of all feature flags used across the MakrX ecosystem

**Flag Categories**:

#### UI/UX Flags
```typescript
export const UI_FLAGS = {
  NEW_DASHBOARD: {
    name: 'NEW_DASHBOARD',
    enabled: false,
    environments: ['development'],
    description: 'Enable new dashboard design'
  },
  
  THEME_CUSTOMIZATION: {
    name: 'THEME_CUSTOMIZATION',
    enabled: true,
    description: 'Allow theme customization features'
  }
};
```

#### Feature Flags
```typescript
export const FEATURE_FLAGS = {
  REAL_TIME_NOTIFICATIONS: {
    name: 'REAL_TIME_NOTIFICATIONS',
    enabled: true,
    rolloutPercentage: 75,
    description: 'Enable WebSocket notifications'
  },
  
  ADVANCED_ANALYTICS: {
    name: 'ADVANCED_ANALYTICS',
    enabled: false,
    userTargeting: {
      includeUsers: ['premium-users'],
      excludeUsers: ['basic-users']
    }
  }
};
```

#### Integration Flags
```typescript
export const INTEGRATION_FLAGS = {
  PAYMENT_GATEWAY_V2: {
    name: 'PAYMENT_GATEWAY_V2',
    enabled: false,
    environments: ['staging', 'production'],
    conditions: [
      {
        type: 'custom',
        operator: 'equals',
        value: { paymentEnabled: true }
      }
    ]
  }
};
```

## 🎯 Usage Patterns

### Environment-Based Flags
```typescript
// Show beta features only in development
<FlagGuard flag="BETA_FEATURES">
  <BetaComponent />
</FlagGuard>

// Different behavior per environment
const apiUrl = getValue('API_ENDPOINT', 
  process.env.NODE_ENV === 'production' 
    ? 'https://api.makrx.com'
    : 'http://localhost:8000'
);
```

### User Targeting
```typescript
// Show feature to specific users
const showPremiumFeatures = isEnabled('PREMIUM_FEATURES');

// Percentage rollout
const showNewCheckout = isEnabled('NEW_CHECKOUT'); // 25% of users
```

### A/B Testing
```typescript
// Variant testing
const checkoutVariant = getValue('CHECKOUT_VARIANT', 'original');

switch (checkoutVariant) {
  case 'simplified':
    return <SimplifiedCheckout />;
  case 'enhanced':
    return <EnhancedCheckout />;
  default:
    return <OriginalCheckout />;
}
```

## 📊 Flag Management

### Adding New Flags
1. Define flag in `flags/index.ts`
2. Add TypeScript types if needed
3. Update flag documentation
4. Test in development environment
5. Configure rollout strategy

### Flag Configuration Parameters
```typescript
interface FeatureFlag {
  name: string;                    // Unique flag identifier
  enabled: boolean;                // Default enabled state
  description?: string;            // Flag description
  environments?: string[];         // Target environments
  rolloutPercentage?: number;      // Percentage of users (0-100)
  userTargeting?: {               // User-specific targeting
    includeUsers?: string[];
    excludeUsers?: string[];
    includeGroups?: string[];
    excludeGroups?: string[];
  };
  conditions?: FlagCondition[];    // Complex evaluation rules
  variants?: {                     // A/B testing variants
    name: string;
    weight: number;
    value: any;
  }[];
  expiresAt?: Date;               // Automatic flag expiration
}
```

### Best Practices

#### Naming Conventions
- Use SCREAMING_SNAKE_CASE
- Prefix with category: `UI_`, `FEATURE_`, `INTEGRATION_`
- Be descriptive: `NEW_CHECKOUT_FLOW` not `NEW_FEATURE`

#### Flag Lifecycle
1. **Development**: Test with 0% rollout
2. **Staging**: Gradually increase rollout
3. **Production**: Monitor metrics and feedback
4. **Cleanup**: Remove flags after full rollout

#### Performance Considerations
- Cache flag evaluations
- Minimize flag checks in render loops
- Use FlagGuard for conditional rendering
- Batch flag requests when possible

## 🔧 Configuration Examples

### Development Setup
```typescript
// In development, enable most flags
export const DEV_CONFIG = {
  defaultEnabled: true,
  environment: 'development',
  overrides: {
    'PRODUCTION_ONLY_FEATURE': false
  }
};
```

### Production Setup
```typescript
// In production, use careful rollouts
export const PROD_CONFIG = {
  defaultEnabled: false,
  environment: 'production',
  rolloutStrategy: 'gradual',
  monitoring: true
};
```

### Testing Configuration
```typescript
// For tests, all flags disabled by default
export const TEST_CONFIG = {
  defaultEnabled: false,
  environment: 'test',
  overrides: {} // Set specific flags as needed
};
```

This feature flag system enables safe, controlled feature releases across the entire MakrX ecosystem while supporting complex targeting and rollout strategies.
