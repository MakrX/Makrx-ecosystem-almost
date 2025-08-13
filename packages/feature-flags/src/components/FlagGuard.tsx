/**
 * Feature Flag UI Components
 * 
 * Components that implement the UI rules from the specification:
 * - Hide links/buttons when off
 * - Show "coming soon" only for internal roles
 * - Handle different flag states appropriately
 */

import React, { ReactNode } from 'react';
import { useBooleanFlag, useModuleFlag, useKillSwitch, useIsInternalUser } from '../hooks/useFeatureFlags';

// ==========================================
// Basic Flag Guard Component
// ==========================================

interface FlagGuardProps {
  flagKey: string;
  children: ReactNode;
  fallback?: ReactNode;
  showComingSoon?: boolean;
}

export function FlagGuard({ flagKey, children, fallback = null, showComingSoon = false }: FlagGuardProps) {
  const isEnabled = useBooleanFlag(flagKey);
  const isInternal = useIsInternalUser();
  
  if (isEnabled) {
    return <>{children}</>;
  }
  
  if (showComingSoon && isInternal) {
    return <ComingSoonBadge />;
  }
  
  return <>{fallback}</>;
}

// ==========================================
// Navigation Link Guard
// ==========================================

interface NavLinkGuardProps {
  flagKey: string;
  children: ReactNode;
  href?: string;
  className?: string;
}

export function NavLinkGuard({ flagKey, children, href, className }: NavLinkGuardProps) {
  const isEnabled = useBooleanFlag(flagKey);
  
  if (!isEnabled) {
    return null;
  }
  
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  
  return <>{children}</>;
}

// ==========================================
// Module Guard (for entire sections)
// ==========================================

interface ModuleGuardProps {
  flagKey: string;
  children: ReactNode;
  moduleName: string;
  className?: string;
}

export function ModuleGuard({ flagKey, children, moduleName, className }: ModuleGuardProps) {
  const { enabled, showComingSoon } = useModuleFlag(flagKey);
  
  if (enabled) {
    return <div className={className}>{children}</div>;
  }
  
  if (showComingSoon) {
    return (
      <div className={className}>
        <ComingSoonModule moduleName={moduleName} />
      </div>
    );
  }
  
  return null;
}

// ==========================================
// Kill Switch Guard
// ==========================================

interface KillSwitchGuardProps {
  flagKey: string;
  children: ReactNode;
  maintenanceMessage?: string;
}

export function KillSwitchGuard({ 
  flagKey, 
  children, 
  maintenanceMessage = "This feature is temporarily unavailable for maintenance" 
}: KillSwitchGuardProps) {
  const { enabled, maintenance } = useKillSwitch(flagKey);
  
  if (enabled && !maintenance) {
    return <>{children}</>;
  }
  
  return <MaintenanceNotice message={maintenanceMessage} />;
}

// ==========================================
// Admin Feature Guard
// ==========================================

interface AdminGuardProps {
  flagKey: string;
  children: ReactNode;
  requiredRoles?: string[];
}

export function AdminGuard({ flagKey, children, requiredRoles = ['admin', 'superadmin'] }: AdminGuardProps) {
  const isEnabled = useBooleanFlag(flagKey);
  // In a real app, you'd also check user roles here
  
  if (!isEnabled) {
    return null;
  }
  
  return <>{children}</>;
}

// ==========================================
// Button Guard (for action buttons)
// ==========================================

interface ButtonGuardProps {
  flagKey: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  disabledMessage?: string;
}

export function ButtonGuard({ 
  flagKey, 
  children, 
  disabled = false, 
  onClick, 
  className,
  disabledMessage = "Feature not available" 
}: ButtonGuardProps) {
  const isEnabled = useBooleanFlag(flagKey);
  
  if (!isEnabled) {
    return null;
  }
  
  return (
    <button 
      disabled={disabled} 
      onClick={onClick} 
      className={className}
      title={disabled ? disabledMessage : undefined}
    >
      {children}
    </button>
  );
}

// ==========================================
// Route Guard (for page-level protection)
// ==========================================

interface RouteGuardProps {
  flagKey: string;
  children: ReactNode;
  redirectTo?: string;
  notFoundComponent?: ReactNode;
}

export function RouteGuard({ 
  flagKey, 
  children, 
  redirectTo, 
  notFoundComponent = <NotFoundPage /> 
}: RouteGuardProps) {
  const isEnabled = useBooleanFlag(flagKey);
  
  if (!isEnabled) {
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo;
      return null;
    }
    return <>{notFoundComponent}</>;
  }
  
  return <>{children}</>;
}

// ==========================================
// Experiment Component
// ==========================================

interface ExperimentProps {
  flagKey: string;
  variants: Record<string, ReactNode>;
  defaultVariant?: string;
}

export function Experiment({ flagKey, variants, defaultVariant = 'control' }: ExperimentProps) {
  const { variant, isInExperiment, trackExposure } = useExperiment(flagKey);
  
  React.useEffect(() => {
    if (isInExperiment) {
      trackExposure();
    }
  }, [isInExperiment, trackExposure]);
  
  const activeVariant = isInExperiment ? variant : defaultVariant;
  const content = variants[activeVariant] || variants[defaultVariant];
  
  return <>{content}</>;
}

// ==========================================
// Helper Components
// ==========================================

function ComingSoonBadge() {
  return (
    <div className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md">
      Coming Soon
    </div>
  );
}

function ComingSoonModule({ moduleName }: { moduleName: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
      <div className="text-lg font-medium text-gray-600 mb-2">
        {moduleName}
      </div>
      <div className="text-sm text-gray-500 mb-4">
        This feature is coming soon
      </div>
      <ComingSoonBadge />
    </div>
  );
}

function MaintenanceNotice({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="text-lg font-medium text-yellow-800 mb-2">
        🚧 Maintenance Mode
      </div>
      <div className="text-sm text-yellow-700">
        {message}
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
    </div>
  );
}

// ==========================================
// Higher Order Component
// ==========================================

export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  flagKey: string,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    const isEnabled = useBooleanFlag(flagKey);
    
    if (!isEnabled) {
      return <>{fallback}</>;
    }
    
    return <Component {...props} />;
  };
}

// ==========================================
// Hook for experiment tracking
// ==========================================

import { useExperiment } from '../hooks/useFeatureFlags';

export function useExperimentTracking(flagKey: string) {
  const { variant, isInExperiment, trackExposure } = useExperiment(flagKey);
  
  React.useEffect(() => {
    if (isInExperiment) {
      trackExposure();
    }
  }, [isInExperiment, trackExposure]);
  
  return { variant, isInExperiment };
}

// All components are already exported above with their function declarations
