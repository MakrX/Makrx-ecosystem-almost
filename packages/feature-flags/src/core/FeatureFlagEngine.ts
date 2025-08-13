/**
 * Core Feature Flag System for MakrX Ecosystem
 * 
 * Supports the complete specification:
 * - Namespace.area.feature[.variant] naming
 * - Multiple scopes (global, role, audience, space, user)
 * - Multiple types (boolean, percentage, multivariate, config)
 * - Fail-safe defaults
 */

export type FlagNamespace = 'global' | 'org' | 'cave' | 'store';
export type FlagScope = 'global' | 'role' | 'audience' | 'space' | 'user';
export type FlagType = 'boolean' | 'percentage' | 'multivariate' | 'config';
export type RolloutState = 'off' | 'internal' | 'beta' | 'on' | 'remove';

export interface FlagContext {
  userId?: string;
  sessionId?: string;
  roles?: string[];
  makerspaceId?: string;
  organizationId?: string;
  country?: string;
  pincode?: string;
  environment: 'development' | 'staging' | 'production';
  userAgent?: string;
  completedJobs?: number;
}

export interface FlagDefinition {
  key: string;
  namespace: FlagNamespace;
  area: string;
  feature: string;
  variant?: string;
  type: FlagType;
  scope: FlagScope;
  defaultValue: any;
  rolloutState: RolloutState;
  description: string;
  owner: string;
  
  // Targeting rules
  enabledForRoles?: string[];
  enabledForUsers?: string[];
  enabledForSpaces?: string[];
  enabledForCountries?: string[];
  enabledForPincodes?: string[];
  percentageRollout?: number;
  
  // Multivariate settings
  variants?: Record<string, any>;
  variantWeights?: Record<string, number>;
  
  // Config value
  configValue?: any;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface FlagEvaluationResult {
  enabled: boolean;
  value: any;
  variant?: string;
  reason: string;
  flagKey: string;
}

export class FeatureFlagEngine {
  private flags: Map<string, FlagDefinition> = new Map();
  private cache: Map<string, FlagEvaluationResult> = new Map();
  private cacheTTL = 60000; // 1 minute

  constructor(flags: FlagDefinition[] = []) {
    this.loadFlags(flags);
  }

  /**
   * Load flag definitions into the engine
   */
  loadFlags(flags: FlagDefinition[]): void {
    this.flags.clear();
    this.cache.clear();
    
    flags.forEach(flag => {
      this.flags.set(flag.key, flag);
    });
  }

  /**
   * Evaluate a feature flag for given context
   */
  evaluate(flagKey: string, context: FlagContext, defaultValue?: any): FlagEvaluationResult {
    // Check cache first
    const cacheKey = this.getCacheKey(flagKey, context);
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    const result = this.evaluateFlag(flagKey, context, defaultValue);
    
    // Cache result
    this.cache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Bulk evaluate multiple flags
   */
  evaluateMultiple(flagKeys: string[], context: FlagContext): Record<string, FlagEvaluationResult> {
    const results: Record<string, FlagEvaluationResult> = {};
    
    flagKeys.forEach(key => {
      results[key] = this.evaluate(key, context);
    });
    
    return results;
  }

  /**
   * Get all flags for a namespace
   */
  getFlagsForNamespace(namespace: FlagNamespace, context: FlagContext): Record<string, FlagEvaluationResult> {
    const namespaceFlags = Array.from(this.flags.values())
      .filter(flag => flag.namespace === namespace)
      .map(flag => flag.key);
    
    return this.evaluateMultiple(namespaceFlags, context);
  }

  private evaluateFlag(flagKey: string, context: FlagContext, defaultValue?: any): FlagEvaluationResult {
    const flag = this.flags.get(flagKey);
    
    if (!flag) {
      return {
        enabled: false,
        value: defaultValue ?? false,
        reason: 'flag_not_found',
        flagKey
      };
    }

    // Check if flag is expired
    if (flag.expiresAt && new Date() > new Date(flag.expiresAt)) {
      return {
        enabled: false,
        value: flag.defaultValue,
        reason: 'flag_expired',
        flagKey
      };
    }

    // Check rollout state
    if (flag.rolloutState === 'off') {
      return {
        enabled: false,
        value: flag.defaultValue,
        reason: 'rollout_off',
        flagKey
      };
    }

    // Internal rollout - only for admins
    if (flag.rolloutState === 'internal') {
      const isInternal = context.roles?.some(role => 
        ['superadmin', 'store_admin', 'makerspace_admin'].includes(role)
      );
      
      if (!isInternal) {
        return {
          enabled: false,
          value: flag.defaultValue,
          reason: 'internal_only',
          flagKey
        };
      }
    }

    // Evaluate targeting rules
    const targetingResult = this.evaluateTargeting(flag, context);
    if (!targetingResult.matches) {
      return {
        enabled: false,
        value: flag.defaultValue,
        reason: targetingResult.reason,
        flagKey
      };
    }

    // Evaluate flag type
    switch (flag.type) {
      case 'boolean':
        return {
          enabled: true,
          value: true,
          reason: 'targeting_matched',
          flagKey
        };

      case 'percentage':
        const percentageEnabled = this.evaluatePercentage(flag, context);
        return {
          enabled: percentageEnabled,
          value: percentageEnabled,
          reason: percentageEnabled ? 'percentage_included' : 'percentage_excluded',
          flagKey
        };

      case 'multivariate':
        const variantResult = this.evaluateMultivariate(flag, context);
        return {
          enabled: true,
          value: variantResult.value,
          variant: variantResult.variant,
          reason: 'multivariate_assigned',
          flagKey
        };

      case 'config':
        return {
          enabled: true,
          value: flag.configValue ?? flag.defaultValue,
          reason: 'config_value',
          flagKey
        };

      default:
        return {
          enabled: false,
          value: flag.defaultValue,
          reason: 'unknown_type',
          flagKey
        };
    }
  }

  private evaluateTargeting(flag: FlagDefinition, context: FlagContext): { matches: boolean; reason: string } {
    // Global scope - everyone
    if (flag.scope === 'global') {
      return { matches: true, reason: 'global_scope' };
    }

    // Role-based targeting
    if (flag.scope === 'role' && flag.enabledForRoles?.length) {
      const hasRole = context.roles?.some(role => flag.enabledForRoles!.includes(role));
      return { 
        matches: hasRole ?? false, 
        reason: hasRole ? 'role_matched' : 'role_not_matched' 
      };
    }

    // User-specific targeting
    if (flag.scope === 'user' && flag.enabledForUsers?.length) {
      const isEnabledUser = context.userId && flag.enabledForUsers.includes(context.userId);
      return {
        matches: isEnabledUser ?? false,
        reason: isEnabledUser ? 'user_included' : 'user_not_included'
      };
    }

    // Space-specific targeting
    if (flag.scope === 'space' && flag.enabledForSpaces?.length) {
      const isEnabledSpace = context.makerspaceId && flag.enabledForSpaces.includes(context.makerspaceId);
      return {
        matches: isEnabledSpace ?? false,
        reason: isEnabledSpace ? 'space_included' : 'space_not_included'
      };
    }

    // Audience targeting (geo, cohorts)
    if (flag.scope === 'audience') {
      // Country targeting
      if (flag.enabledForCountries?.length) {
        const isEnabledCountry = context.country && flag.enabledForCountries.includes(context.country);
        if (!isEnabledCountry) {
          return { matches: false, reason: 'country_not_included' };
        }
      }

      // Pincode targeting
      if (flag.enabledForPincodes?.length) {
        const isEnabledPincode = context.pincode && flag.enabledForPincodes.includes(context.pincode);
        if (!isEnabledPincode) {
          return { matches: false, reason: 'pincode_not_included' };
        }
      }

      // Provider cohort targeting (completed jobs >= 10)
      if (flag.key.includes('provider') && context.completedJobs !== undefined) {
        const isQualifiedProvider = context.completedJobs >= 10;
        if (!isQualifiedProvider) {
          return { matches: false, reason: 'provider_not_qualified' };
        }
      }

      return { matches: true, reason: 'audience_matched' };
    }

    return { matches: false, reason: 'scope_not_matched' };
  }

  private evaluatePercentage(flag: FlagDefinition, context: FlagContext): boolean {
    if (!flag.percentageRollout) {
      return false;
    }

    // Use deterministic hash based on user ID or session ID
    const identifier = context.userId || context.sessionId || 'anonymous';
    const hash = this.hashString(`${flag.key}:${identifier}`);
    const percentage = hash % 100;
    
    return percentage < flag.percentageRollout;
  }

  private evaluateMultivariate(flag: FlagDefinition, context: FlagContext): { value: any; variant: string } {
    if (!flag.variants || !flag.variantWeights) {
      return { value: flag.defaultValue, variant: 'default' };
    }

    const identifier = context.userId || context.sessionId || 'anonymous';
    const hash = this.hashString(`${flag.key}:multivariate:${identifier}`);
    const normalizedHash = hash / 2147483647; // Normalize to 0-1

    let cumulativeWeight = 0;
    for (const [variant, weight] of Object.entries(flag.variantWeights)) {
      cumulativeWeight += weight;
      if (normalizedHash <= cumulativeWeight) {
        return {
          value: flag.variants[variant] ?? flag.defaultValue,
          variant
        };
      }
    }

    // Fallback to first variant
    const firstVariant = Object.keys(flag.variants)[0];
    return {
      value: flag.variants[firstVariant],
      variant: firstVariant
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private getCacheKey(flagKey: string, context: FlagContext): string {
    const contextKeys = [
      context.userId,
      context.sessionId,
      context.roles?.join(','),
      context.makerspaceId,
      context.country,
      context.pincode
    ].filter(Boolean).join(':');
    
    return `${flagKey}:${contextKeys}`;
  }

  private isCacheValid(result: FlagEvaluationResult): boolean {
    // Simple time-based cache validation
    // In production, you might want more sophisticated cache invalidation
    return true; // For now, always use cache if present
  }

  /**
   * Admin methods for flag management
   */
  addFlag(flag: FlagDefinition): void {
    this.flags.set(flag.key, flag);
    this.cache.clear(); // Clear cache when flags change
  }

  removeFlag(flagKey: string): void {
    this.flags.delete(flagKey);
    this.cache.clear();
  }

  updateFlag(flagKey: string, updates: Partial<FlagDefinition>): void {
    const flag = this.flags.get(flagKey);
    if (flag) {
      this.flags.set(flagKey, { ...flag, ...updates, updatedAt: new Date().toISOString() });
      this.cache.clear();
    }
  }

  getAllFlags(): FlagDefinition[] {
    return Array.from(this.flags.values());
  }

  getFlag(flagKey: string): FlagDefinition | undefined {
    return this.flags.get(flagKey);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Default flag configurations for the MakrX ecosystem
export const DEFAULT_FLAGS: FlagDefinition[] = [
  // Global cross-cutting flags
  {
    key: 'global.announcements.banner',
    namespace: 'global',
    area: 'announcements',
    feature: 'banner',
    type: 'config',
    scope: 'global',
    defaultValue: null,
    rolloutState: 'on',
    description: 'Sitewide banner text/level',
    owner: 'platform',
    enabledForRoles: ['superadmin'],
    configValue: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'global.search.unified',
    namespace: 'global',
    area: 'search',
    feature: 'unified',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Cross-site search result blending',
    owner: 'platform',
    enabledForRoles: ['superadmin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'global.chatbot.enabled',
    namespace: 'global',
    area: 'chatbot',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Help widget in all portals',
    owner: 'platform',
    enabledForRoles: ['superadmin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'global.auth.invite_only',
    namespace: 'global',
    area: 'auth',
    feature: 'invite_only',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Blocks self-signup',
    owner: 'platform',
    enabledForRoles: ['superadmin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default FeatureFlagEngine;
