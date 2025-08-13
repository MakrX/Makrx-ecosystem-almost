/**
 * MakrX Feature Flags System
 * 
 * Complete feature flag implementation with:
 * - Namespace.area.feature[.variant] naming
 * - Multiple scopes (global, role, audience, space, user)  
 * - Multiple types (boolean, percentage, multivariate, config)
 * - React hooks and components
 * - Backend API protection
 * - Admin interface
 * - Fail-safe defaults
 */

// Core engine
export { FeatureFlagEngine, type FlagContext, type FlagDefinition, type FlagEvaluationResult } from './core/FeatureFlagEngine';

// All flag definitions
export { default as ALL_FLAGS, ORG_FLAGS, CAVE_FLAGS, STORE_FLAGS, EXPERIMENT_FLAGS, CONFIG_FLAGS } from './flags';

// React hooks
export {
  useFlag,
  useBooleanFlag,
  useConfigFlag,
  useVariantFlag,
  usePercentageFlag,
  useFlags,
  useNamespaceFlags,
  useNavLinkFlag,
  useModuleFlag,
  useKillSwitch,
  useAdminFlag,
  useExperiment,
  useSpaceFlag,
  useGeoFlag,
  useIsInternalUser,
  useFlagContext,
  useFlagContextUpdater,
  useDebugFlags,
  createFlagEngine,
  evaluateFlag,
  FeatureFlagContext,
  type FeatureFlagContextValue
} from './hooks/useFeatureFlags';

// React components  
export { default as FeatureFlagProvider } from './components/FeatureFlagProvider';
export {
  FlagGuard,
  NavLinkGuard,
  ModuleGuard,
  KillSwitchGuard,
  AdminGuard,
  ButtonGuard,
  RouteGuard,
  Experiment,
  ComingSoonBadge,
  ComingSoonModule,
  MaintenanceNotice,
  NotFoundPage,
  withFeatureFlag
} from './components/FlagGuard';

// Re-export for convenience
export * from './core/FeatureFlagEngine';
export * from './hooks/useFeatureFlags';
export * from './components/FlagGuard';
