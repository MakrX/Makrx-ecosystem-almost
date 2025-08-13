import { ReactNode, ComponentType } from 'react';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Lock } from 'lucide-react';

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  fallback?: ReactNode;
  showReasonWhenBlocked?: boolean;
}

/**
 * Feature Gate Component - Conditionally renders children based on feature access
 */
export function FeatureGate({ 
  featureKey, 
  children, 
  fallback = null, 
  showReasonWhenBlocked = false 
}: FeatureGateProps) {
  const { hasFeatureAccess } = useFeatureFlags();
  const { user } = useAuth();
  
  const accessResult = hasFeatureAccess(featureKey);
  
  if (accessResult.hasAccess) {
    return <>{children}</>;
  }

  if (showReasonWhenBlocked && accessResult.flag) {
    return (
      <div className="makrcave-card border-dashed border-2 border-muted bg-muted/20">
        <div className="flex items-center gap-3 text-muted-foreground">
          {accessResult.reason === 'insufficient_role' ? (
            <Lock className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <div>
            <p className="font-medium">{accessResult.flag.name} - Not Available</p>
            <p className="text-sm">
              {accessResult.reason === 'disabled' && 'This feature is currently disabled'}
              {accessResult.reason === 'insufficient_role' && 
                `Requires one of: ${accessResult.flag.allowedRoles.join(', ')}. Current role: ${user?.role}`}
              {accessResult.reason === 'environment_mismatch' && 
                `Feature only available in: ${accessResult.flag.environment}`}
              {accessResult.reason === 'not_found' && 'Feature configuration not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
}

/**
 * Higher-Order Component for feature-gated pages/components
 */
export function withFeatureFlag<P extends object>(
  WrappedComponent: ComponentType<P>,
  featureKey: string,
  fallbackComponent?: ComponentType<P>
) {
  return function FeatureGatedComponent(props: P) {
    const { hasFeatureAccess } = useFeatureFlags();
    const accessResult = hasFeatureAccess(featureKey);

    if (accessResult.hasAccess) {
      return <WrappedComponent {...props} />;
    }

    if (fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent {...props} />;
    }

    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Feature Not Available</h2>
            <p className="text-muted-foreground">
              {accessResult.flag?.name || 'This feature'} is not available for your current role or is disabled.
            </p>
            {accessResult.flag && (
              <p className="text-sm text-muted-foreground mt-2">
                {accessResult.flag.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };
}

/**
 * Hook for conditional feature rendering in components
 */
export function useFeatureAccess(featureKey: string) {
  const { hasFeatureAccess, isFeatureEnabled } = useFeatureFlags();
  
  const accessResult = hasFeatureAccess(featureKey);
  
  return {
    hasAccess: accessResult.hasAccess,
    isEnabled: isFeatureEnabled(featureKey),
    flag: accessResult.flag,
    reason: accessResult.reason,
  };
}

/**
 * Feature Flag Badge Component - Shows feature status for debugging/admin
 */
interface FeatureFlagBadgeProps {
  featureKey: string;
  showForAllUsers?: boolean;
}

export function FeatureFlagBadge({ featureKey, showForAllUsers = false }: FeatureFlagBadgeProps) {
  const { hasFeatureAccess } = useFeatureFlags();
  const { user } = useAuth();
  
  // Only show to admins unless explicitly shown for all users
  if (!showForAllUsers && user?.role !== 'super_admin') {
    return null;
  }
  
  const accessResult = hasFeatureAccess(featureKey);
  
  const getBadgeStyle = () => {
    if (accessResult.hasAccess) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    switch (accessResult.reason) {
      case 'disabled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'insufficient_role':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'environment_mismatch':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };
  
  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
      ${getBadgeStyle()}
    `}>
      {accessResult.hasAccess ? '✓' : '✗'} {featureKey}
    </span>
  );
}

/**
 * Feature Development Component - Shows features under development
 */
export function FeatureInDevelopment({ featureName }: { featureName: string }) {
  return (
    <div className="makrcave-card border-dashed border-2 border-yellow-200 bg-yellow-50">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-semibold text-yellow-800">{featureName}</h3>
          <p className="text-sm text-yellow-600">This feature is currently under development</p>
        </div>
      </div>
    </div>
  );
}
