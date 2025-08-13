// ========================================
// PROTECTED ROUTE COMPONENT
// ========================================
// Role-based route protection for sensitive system pages

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../config/rolePermissions';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import loggingService from '../services/loggingService';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: {
    area: 'admin' | 'analytics' | 'billing' | 'users' | 'equipment' | 'projects' | 'inventory';
    action: string;
  };
  requiredRole?: 'super_admin' | 'admin' | 'makerspace_admin' | 'service_provider' | 'maker';
  allowedRoles?: ('super_admin' | 'admin' | 'makerspace_admin' | 'service_provider' | 'maker')[];
  adminFeature?: 'systemLogs' | 'featureFlags' | 'healthMonitoring' | 'userRoleManagement' | 'globalDashboard';
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  allowedRoles,
  adminFeature,
  fallbackPath = '/portal/dashboard',
  showAccessDenied = true
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    loggingService.warn('auth', 'ProtectedRoute', 'Unauthenticated user attempted to access protected route', {
      requestedPath: window.location.pathname,
      hasUser: !!user,
      isAuthenticated
    });
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  let hasAccess = true;
  let reason = '';

  if (requiredRole && user.role !== requiredRole) {
    hasAccess = false;
    reason = `Required role: ${requiredRole}, current role: ${user.role}`;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    hasAccess = false;
    reason = `Allowed roles: ${allowedRoles.join(', ')}, current role: ${user.role}`;
  }

  if (requiredPermission) {
    const permission = hasPermission(
      user.role,
      requiredPermission.area,
      requiredPermission.action
    );
    if (!permission) {
      hasAccess = false;
      reason = `Missing permission: ${requiredPermission.area}.${requiredPermission.action}`;
    }
  }

  if (adminFeature) {
    const adminPermissions = hasPermission(user.role, 'admin', adminFeature);
    if (!adminPermissions) {
      hasAccess = false;
      reason = `Missing admin feature access: ${adminFeature}`;
    }
  }

  // Log access attempts
  if (hasAccess) {
    loggingService.info('auth', 'ProtectedRoute', 'Access granted to protected route', {
      userId: user.id,
      userRole: user.role,
      path: window.location.pathname,
      requiredRole,
      allowedRoles,
      adminFeature,
      requiredPermission
    });
  } else {
    loggingService.warn('auth', 'ProtectedRoute', 'Access denied to protected route', {
      userId: user.id,
      userRole: user.role,
      path: window.location.pathname,
      reason,
      requiredRole,
      allowedRoles,
      adminFeature,
      requiredPermission
    });

    loggingService.logUserAction('unauthorized_access_attempt', {
      userId: user.id,
      userRole: user.role,
      path: window.location.pathname,
      reason
    });
  }

  // If access denied and no custom handling requested, redirect
  if (!hasAccess && !showAccessDenied) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Show access denied page
  if (!hasAccess && showAccessDenied) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl font-semibold text-red-600 dark:text-red-400">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Insufficient Permissions</span>
            </div>
            
            <p className="text-muted-foreground">
              You don't have the required permissions to access this page.
            </p>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Your role: <span className="font-medium">{user.role}</span></div>
              {requiredRole && (
                <div>Required role: <span className="font-medium">{requiredRole}</span></div>
              )}
              {allowedRoles && (
                <div>Allowed roles: <span className="font-medium">{allowedRoles.join(', ')}</span></div>
              )}
              {adminFeature && (
                <div>Required feature: <span className="font-medium">{adminFeature}</span></div>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={() => window.history.back()}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Go Back
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access granted, render children
  return <>{children}</>;
}

// Helper component for admin-only features
export function AdminOnly({ 
  children, 
  feature, 
  fallback = null 
}: { 
  children: ReactNode; 
  feature?: 'systemLogs' | 'featureFlags' | 'healthMonitoring' | 'userRoleManagement';
  fallback?: ReactNode;
}) {
  const { user } = useAuth();
  
  if (!user) return <>{fallback}</>;

  if (feature) {
    const hasAccess = hasPermission(user.role, 'admin', feature);
    if (!hasAccess) return <>{fallback}</>;
  } else {
    // Check if user is admin-level
    if (!['super_admin', 'admin'].includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Helper component for super admin only features
export function SuperAdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  const { user } = useAuth();
  
  if (!user || user.role !== 'super_admin') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
