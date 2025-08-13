/**
 * Feature Flag Provider Component
 * 
 * Provides the feature flag context to React applications
 */

import React, { ReactNode, useState, useMemo } from 'react';
import { FeatureFlagEngine, FlagContext } from '../core/FeatureFlagEngine';
import { FeatureFlagContext, type FeatureFlagContextValue } from '../hooks/useFeatureFlags';
import ALL_FLAGS from '../flags';

interface FeatureFlagProviderProps {
  children: ReactNode;
  initialContext: FlagContext;
  customFlags?: any[];
}

export function FeatureFlagProvider({ 
  children, 
  initialContext, 
  customFlags = [] 
}: FeatureFlagProviderProps) {
  const engine = useMemo(() => {
    const allFlags = [...ALL_FLAGS, ...customFlags];
    return new FeatureFlagEngine(allFlags);
  }, [customFlags]);

  const [context, setContext] = useState<FlagContext>(initialContext);

  const updateContext = (updates: Partial<FlagContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  };

  const value: FeatureFlagContextValue = {
    engine,
    context,
    updateContext
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export default FeatureFlagProvider;
