/**
 * React Hooks for Feature Flags
 * 
 * Provides easy-to-use hooks for React components to check feature flags
 * Implements the UI rules from the specification:
 * - Hide links/buttons when off
 * - Show "coming soon" only for internal roles
 * - Fail safe defaults
 */

import { useMemo, useContext, createContext } from 'react';
import { FeatureFlagEngine, FlagContext, FlagEvaluationResult } from '../core/FeatureFlagEngine';
import ALL_FLAGS from '../flags';

// Feature Flag Context
interface FeatureFlagContextValue {
  engine: FeatureFlagEngine;
  context: FlagContext;
  updateContext: (updates: Partial<FlagContext>) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

// Hook to get the feature flag context
function useFeatureFlagContext(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider');
  }
  return context;
}

// Main hook for checking feature flags
export function useFlag(flagKey: string, defaultValue?: any): FlagEvaluationResult {
  const { engine, context } = useFeatureFlagContext();

  return useMemo(() => {
    return engine.evaluate(flagKey, context, defaultValue);
  }, [engine, context, flagKey, defaultValue]);
}

// Hook for boolean flags (most common case)
export function useBooleanFlag(flagKey: string, defaultValue: boolean = false): boolean {
  const result = useFlag(flagKey, defaultValue);
  return result.enabled && Boolean(result.value);
}

// Hook for config flags (typed values)
export function useConfigFlag<T = any>(flagKey: string, defaultValue: T): T {
  const result = useFlag(flagKey, defaultValue);
  return result.enabled ? result.value : defaultValue;
}

// Hook for multivariate flags
export function useVariantFlag(flagKey: string, defaultVariant: string = 'default'): { variant: string; value: any } {
  const result = useFlag(flagKey, defaultVariant);
  
  return {
    variant: result.variant || defaultVariant,
    value: result.value
  };
}

// Hook for percentage flags
export function usePercentageFlag(flagKey: string): boolean {
  const result = useFlag(flagKey, false);
  return result.enabled;
}

// Hook for multiple flags (bulk evaluation)
export function useFlags(flagKeys: string[]): Record<string, FlagEvaluationResult> {
  const { engine, context } = useFeatureFlagContext();

  return useMemo(() => {
    return engine.evaluateMultiple(flagKeys, context);
  }, [engine, context, flagKeys]);
}

// Hook for namespace flags (e.g., all 'store' flags)
export function useNamespaceFlags(namespace: 'global' | 'org' | 'cave' | 'store'): Record<string, FlagEvaluationResult> {
  const { engine, context } = useFeatureFlagContext();

  return useMemo(() => {
    return engine.getFlagsForNamespace(namespace, context);
  }, [engine, context, namespace]);
}

// Navigation link visibility
export function useNavLinkFlag(flagKey: string): { show: boolean; reason: string } {
  const result = useFlag(flagKey, true);
  
  return {
    show: result.enabled && Boolean(result.value),
    reason: result.reason
  };
}

// Feature module visibility (for entire sections)
export function useModuleFlag(flagKey: string): { enabled: boolean; showComingSoon: boolean; reason: string } {
  const { context } = useFeatureFlagContext();
  const result = useFlag(flagKey, false);
  
  // Show "coming soon" only for internal roles when flag is off
  const isInternalRole = context.roles?.some(role => 
    ['superadmin', 'store_admin', 'makerspace_admin'].includes(role)
  );
  
  const showComingSoon = !result.enabled && isInternalRole && result.reason === 'rollout_off';
  
  return {
    enabled: result.enabled && Boolean(result.value),
    showComingSoon,
    reason: result.reason
  };
}

// Kill switch pattern (for ops safety)
export function useKillSwitch(flagKey: string): { enabled: boolean; maintenance: boolean } {
  const result = useFlag(flagKey, true); // Default to enabled for kill switches
  
  return {
    enabled: result.enabled && Boolean(result.value),
    maintenance: !result.enabled || !result.value
  };
}

// Admin feature access
export function useAdminFlag(flagKey: string): { hasAccess: boolean; reason: string } {
  const result = useFlag(flagKey, false);
  
  return {
    hasAccess: result.enabled && Boolean(result.value),
    reason: result.reason
  };
}

// Experiment variation
export function useExperiment(flagKey: string): { 
  variant: string; 
  isInExperiment: boolean; 
  trackExposure: () => void 
} {
  const result = useFlag(flagKey, 'control');
  
  const trackExposure = () => {
    // Emit analytics event for experiment exposure
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Experiment Exposed', {
        experimentKey: flagKey,
        variant: result.variant || 'control',
        flagKey: result.flagKey
      });
    }
  };
  
  return {
    variant: result.variant || 'control',
    isInExperiment: result.enabled,
    trackExposure
  };
}

// Space-specific flags (for MakrCave)
export function useSpaceFlag(flagKey: string, makerspaceId?: string): { enabled: boolean; reason: string } {
  const { context, updateContext } = useFeatureFlagContext();
  
  // Update context with makerspace ID if provided
  if (makerspaceId && makerspaceId !== context.makerspaceId) {
    updateContext({ makerspaceId });
  }
  
  const result = useFlag(flagKey, false);
  
  return {
    enabled: result.enabled && Boolean(result.value),
    reason: result.reason
  };
}

// Geographic flags (for regional features)
export function useGeoFlag(flagKey: string, country?: string, pincode?: string): { enabled: boolean; reason: string } {
  const { context, updateContext } = useFeatureFlagContext();
  
  // Update context with geo info if provided
  if ((country && country !== context.country) || (pincode && pincode !== context.pincode)) {
    updateContext({ country, pincode });
  }
  
  const result = useFlag(flagKey, false);
  
  return {
    enabled: result.enabled && Boolean(result.value),
    reason: result.reason
  };
}

// Utility hook to check if user is in internal roles
export function useIsInternalUser(): boolean {
  const { context } = useFeatureFlagContext();
  
  return context.roles?.some(role => 
    ['superadmin', 'store_admin', 'makerspace_admin'].includes(role)
  ) ?? false;
}

// Hook to get the current flag context (for debugging)
export function useFlagContext(): FlagContext {
  const { context } = useFeatureFlagContext();
  return context;
}

// Hook to update flag context
export function useFlagContextUpdater() {
  const { updateContext } = useFeatureFlagContext();
  return updateContext;
}

// Debug hook to see all flags for development
export function useDebugFlags(): Record<string, FlagEvaluationResult> {
  const { engine, context } = useFeatureFlagContext();
  
  return useMemo(() => {
    const allFlagKeys = engine.getAllFlags().map(flag => flag.key);
    return engine.evaluateMultiple(allFlagKeys, context);
  }, [engine, context]);
}

// Create a flag engine with initial context (for use without React)
export function createFlagEngine(initialContext: FlagContext, customFlags: any[] = []): FeatureFlagEngine {
  const allFlags = [...ALL_FLAGS, ...customFlags];
  return new FeatureFlagEngine(allFlags);
}

// Evaluate flag outside of React (for use in utilities, API calls, etc.)
export function evaluateFlag(
  engine: FeatureFlagEngine, 
  flagKey: string, 
  context: FlagContext, 
  defaultValue?: any
): FlagEvaluationResult {
  return engine.evaluate(flagKey, context, defaultValue);
}

export default useFlag;
export { FeatureFlagContext, type FeatureFlagContextValue };
