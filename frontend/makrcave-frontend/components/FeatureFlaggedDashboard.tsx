/**
 * Feature Flag Enhanced MakrCave Dashboard
 * Demonstrates the feature flag system in action
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMakerspaceContext } from '../contexts/MakerspaceContext';
import NotificationWidget from './NotificationWidget';
import AnalyticsWidget from './AnalyticsWidget';
import ServiceProviderDashboard from './ServiceProviderDashboard';
import {
  Crown, Shield, Wrench, Settings, UserCheck,
  BarChart3, Users, Building2, Package,
  FolderOpen, Calendar, AlertTriangle, Activity,
  Zap, TrendingUp, DollarSign
} from 'lucide-react';

// Import feature flag components
import {
  FlagGuard,
  ModuleGuard,
  NavLinkGuard,
  KillSwitchGuard,
  ButtonGuard,
  AdminGuard
} from '../../../packages/feature-flags/src/components/FlagGuard';

import {
  useBooleanFlag,
  useModuleFlag,
  useSpaceFlag,
  useIsInternalUser,
  useConfigFlag
} from '../../../packages/feature-flags/src/hooks/useFeatureFlags';

// Enhanced Super Admin Dashboard with Feature Flags
function EnhancedSuperAdminDashboard() {
  const { user } = useAuth();
  const { currentMakerspace } = useMakerspaceContext();
  
  // Feature flags
  const analyticsEnabled = useBooleanFlag('cave.analytics.enabled');
  const providerEarningsEnabled = useBooleanFlag('cave.analytics.provider_earnings');
  const maintenanceEnabled = useBooleanFlag('cave.maintenance.enabled');
  const notificationsEnabled = useBooleanFlag('cave.notifications.enabled');
  
  // Config flags
  const defaultHourlyRate = useConfigFlag('cave.reservations.hourly_rate', 100);
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <Crown className="w-12 h-12" />
          <div>
            <h1 className="text-2xl font-bold">Super Admin Console</h1>
            <p className="text-purple-100">Welcome back, {user?.firstName}! You have full system access.</p>
          </div>
        </div>
      </div>

      {/* System metrics - always shown for super admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Makerspaces</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <Building2 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Users</p>
              <p className="text-2xl font-bold">1,248</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <Wrench className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">89</p>
            </div>
            <FolderOpen className="w-8 h-8 text-makrx-teal" />
          </div>
        </div>
      </div>

      {/* Analytics section - feature flagged */}
      <ModuleGuard
        flagKey="cave.analytics.enabled"
        moduleName="Advanced Analytics"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="makrcave-card">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">System Analytics</h3>
          </div>
          <AnalyticsWidget />
        </div>

        {/* Provider earnings - sub-feature flag */}
        <FlagGuard
          flagKey="cave.analytics.provider_earnings"
          showComingSoon={true}
        >
          <div className="makrcave-card">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Provider Earnings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Payouts (30d)</span>
                <span className="text-lg font-semibold">₹45,230</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Providers</span>
                <span className="text-lg font-semibold">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Rate</span>
                <span className="text-lg font-semibold">₹{defaultHourlyRate}/hr</span>
              </div>
            </div>
          </div>
        </FlagGuard>
      </ModuleGuard>

      {/* Maintenance module - feature flagged */}
      <ModuleGuard
        flagKey="cave.maintenance.enabled"
        moduleName="Maintenance Management"
      >
        <div className="makrcave-card">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold">Maintenance Overview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600">Scheduled</p>
              <p className="text-2xl font-bold text-orange-700">3</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Overdue</p>
              <p className="text-2xl font-bold text-red-700">1</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-700">15</p>
            </div>
          </div>
        </div>
      </ModuleGuard>

      {/* Notifications - feature flagged */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="makrcave-card">
          <h3 className="text-lg font-semibold mb-4">System Overview</h3>
          <p className="text-muted-foreground mb-4">
            As a Super Admin, you have complete control over the MakrX ecosystem including creating/deleting makerspaces,
            managing all users, viewing system logs, and configuring feature flags.
          </p>
          
          {/* Feature flag status indicators */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Active Features</h4>
            <div className="space-y-1 text-xs">
              <FeatureBadge enabled={analyticsEnabled} label="Analytics" />
              <FeatureBadge enabled={providerEarningsEnabled} label="Provider Earnings" />
              <FeatureBadge enabled={maintenanceEnabled} label="Maintenance" />
              <FeatureBadge enabled={notificationsEnabled} label="Notifications" />
            </div>
          </div>
        </div>

        <FlagGuard
          flagKey="cave.notifications.enabled"
          fallback={
            <div className="makrcave-card">
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              <p className="text-muted-foreground">Notifications are currently disabled.</p>
            </div>
          }
        >
          <NotificationWidget
            category="system"
            title="System Notifications"
            maxItems={3}
          />
        </FlagGuard>
      </div>
    </div>
  );
}

// Enhanced Makerspace Admin Dashboard
function EnhancedMakerspaceAdminDashboard() {
  const { user } = useAuth();
  const { currentMakerspace } = useMakerspaceContext();
  
  // Space-specific flags
  const equipmentEnabled = useSpaceFlag('cave.equipment.enabled', currentMakerspace?.id);
  const reservationsEnabled = useSpaceFlag('cave.reservations.enabled', currentMakerspace?.id);
  const inventoryEnabled = useSpaceFlag('cave.inventory.enabled', currentMakerspace?.id);
  const projectsEnabled = useSpaceFlag('cave.projects.enabled', currentMakerspace?.id);
  const paidReservations = useSpaceFlag('cave.reservations.paid_usage', currentMakerspace?.id);
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <Shield className="w-12 h-12" />
          <div>
            <h1 className="text-2xl font-bold">Makerspace Admin</h1>
            <p className="text-blue-100">Managing {currentMakerspace?.name || 'your makerspace'}</p>
          </div>
        </div>
      </div>

      {/* Module grid with feature flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Equipment module */}
        <ModuleGuard
          flagKey="cave.equipment.enabled"
          moduleName="Equipment"
          className="makrcave-card cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <Wrench className="w-8 h-8 text-blue-600" />
          </div>
        </ModuleGuard>

        {/* Reservations module */}
        <ModuleGuard
          flagKey="cave.reservations.enabled"
          moduleName="Reservations"
          className="makrcave-card cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {paidReservations.enabled ? 'Revenue Today' : 'Bookings Today'}
              </p>
              <p className="text-2xl font-bold">
                {paidReservations.enabled ? '₹2,340' : '12'}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </ModuleGuard>

        {/* Inventory module */}
        <ModuleGuard
          flagKey="cave.inventory.enabled"
          moduleName="Inventory"
          className="makrcave-card cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Items in Stock</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
          </div>
        </ModuleGuard>

        {/* Projects module */}
        <ModuleGuard
          flagKey="cave.projects.enabled"
          moduleName="Projects"
          className="makrcave-card cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <FolderOpen className="w-8 h-8 text-makrx-teal" />
          </div>
        </ModuleGuard>
      </div>

      {/* Quick actions with feature flags */}
      <div className="makrcave-card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ButtonGuard
            flagKey="cave.equipment.enabled"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <Wrench className="w-6 h-6 mb-2 text-blue-600" />
            <span className="text-sm">Add Equipment</span>
          </ButtonGuard>

          <ButtonGuard
            flagKey="cave.reservations.enabled"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <Calendar className="w-6 h-6 mb-2 text-green-600" />
            <span className="text-sm">Book Slot</span>
          </ButtonGuard>

          <ButtonGuard
            flagKey="cave.inventory.enabled"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <Package className="w-6 h-6 mb-2 text-purple-600" />
            <span className="text-sm">Add Stock</span>
          </ButtonGuard>

          <ButtonGuard
            flagKey="cave.projects.enabled"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <FolderOpen className="w-6 h-6 mb-2 text-makrx-teal" />
            <span className="text-sm">New Project</span>
          </ButtonGuard>
        </div>
      </div>
    </div>
  );
}

// Feature badge component
function FeatureBadge({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
    </div>
  );
}

// Enhanced Role Dashboard with Feature Flags
export default function FeatureFlaggedRoleDashboard() {
  const { user } = useAuth();
  
  // Kill switches for critical features
  const systemEnabled = useBooleanFlag('cave.jobs.publish_enabled');
  
  if (!systemEnabled) {
    return (
      <KillSwitchGuard
        flagKey="cave.jobs.publish_enabled"
        maintenanceMessage="The system is currently under maintenance. Service will be restored shortly."
      >
        <div />
      </KillSwitchGuard>
    );
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case 'super_admin':
      return <EnhancedSuperAdminDashboard />;
    case 'makerspace_admin':
    case 'admin':
      return <EnhancedMakerspaceAdminDashboard />;
    case 'service_provider':
      return <ServiceProviderDashboard />;
    default:
      return <EnhancedMakerspaceAdminDashboard />;
  }
}
