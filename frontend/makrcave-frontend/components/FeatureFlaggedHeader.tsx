/**
 * Feature Flag Enhanced Navigation Header
 * Demonstrates navigation links controlled by feature flags
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMakerspaceContext } from '../contexts/MakerspaceContext';
import { NavLinkGuard, FlagGuard } from '../../../packages/feature-flags/src/components/FlagGuard';
import { useBooleanFlag, useSpaceFlag } from '../../../packages/feature-flags/src/hooks/useFeatureFlags';
import {
  Menu,
  X,
  Home,
  Wrench,
  Calendar,
  Package,
  FolderOpen,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  AlertTriangle,
  Briefcase,
  Bell,
  Search
} from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  flagKey?: string;
  adminOnly?: boolean;
  providerOnly?: boolean;
}

export default function FeatureFlaggedHeader() {
  const { user, logout } = useAuth();
  const { currentMakerspace } = useMakerspaceContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global navigation flags
  const orgLinksStore = useBooleanFlag('org.links.store');
  const orgLinksMakrCave = useBooleanFlag('org.links.makrcave');
  const profileEditEnabled = useBooleanFlag('org.profile.edit');
  const statusPageEnabled = useBooleanFlag('org.status.enabled');
  const forumEnabled = useBooleanFlag('org.forum.enabled');

  // Cave-specific flags (with space context)
  const equipmentEnabled = useSpaceFlag('cave.equipment.enabled', currentMakerspace?.id);
  const reservationsEnabled = useSpaceFlag('cave.reservations.enabled', currentMakerspace?.id);
  const inventoryEnabled = useSpaceFlag('cave.inventory.enabled', currentMakerspace?.id);
  const projectsEnabled = useSpaceFlag('cave.projects.enabled', currentMakerspace?.id);
  const skillsEnabled = useBooleanFlag('cave.skills.enabled');
  const providersEnabled = useSpaceFlag('cave.providers.enabled', currentMakerspace?.id);
  const jobsEnabled = useSpaceFlag('cave.jobs.enabled', currentMakerspace?.id);
  const analyticsEnabled = useSpaceFlag('cave.analytics.enabled', currentMakerspace?.id);
  const maintenanceEnabled = useSpaceFlag('cave.maintenance.enabled', currentMakerspace?.id);
  const notificationsEnabled = useBooleanFlag('cave.notifications.enabled');

  // Navigation items with feature flags
  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home
    },
    {
      label: 'Equipment',
      href: '/equipment',
      icon: Wrench,
      flagKey: 'cave.equipment.enabled'
    },
    {
      label: 'Reservations',
      href: '/reservations',
      icon: Calendar,
      flagKey: 'cave.reservations.enabled'
    },
    {
      label: 'Inventory',
      href: '/inventory',
      icon: Package,
      flagKey: 'cave.inventory.enabled'
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: FolderOpen,
      flagKey: 'cave.projects.enabled'
    },
    {
      label: 'Members',
      href: '/members',
      icon: Users
    },
    {
      label: 'Skills & Badges',
      href: '/skills',
      icon: UserCheck,
      flagKey: 'cave.skills.enabled'
    },
    {
      label: 'Providers',
      href: '/providers',
      icon: Briefcase,
      flagKey: 'cave.providers.enabled',
      adminOnly: true
    },
    {
      label: 'Jobs',
      href: '/jobs',
      icon: Briefcase,
      flagKey: 'cave.jobs.enabled',
      providerOnly: true
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      flagKey: 'cave.analytics.enabled',
      adminOnly: true
    },
    {
      label: 'Maintenance',
      href: '/maintenance',
      icon: AlertTriangle,
      flagKey: 'cave.maintenance.enabled',
      adminOnly: true
    }
  ];

  const isAdmin = user?.role === 'super_admin' || user?.role === 'makerspace_admin' || user?.role === 'admin';
  const isProvider = user?.role === 'service_provider';

  const filteredNavItems = navigationItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.providerOnly && !isProvider) return false;
    return true;
  });

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="text-2xl font-bold text-makrx-teal">MakrCave</div>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-8 ml-8">
              {filteredNavItems.map((item) => (
                <NavLinkGuard
                  key={item.href}
                  flagKey={item.flagKey || 'always_enabled'}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </NavLinkGuard>
              ))}
            </nav>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Cross-portal navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLinkGuard
                flagKey="org.links.store"
                href="https://store.makrx.org"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Store
              </NavLinkGuard>
              
              <span className="text-gray-300">|</span>
              
              <NavLinkGuard
                flagKey="org.status.enabled"
                href="/status"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Status
              </NavLinkGuard>
              
              <NavLinkGuard
                flagKey="org.forum.enabled"
                href="/forum"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Forum
              </NavLinkGuard>
            </div>

            {/* Notifications */}
            <FlagGuard flagKey="cave.notifications.enabled">
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <Bell className="w-5 h-5" />
              </button>
            </FlagGuard>

            {/* Profile dropdown */}
            <div className="relative">
              <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-makrx-teal">
                <div className="w-8 h-8 bg-makrx-teal rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.firstName?.[0] || 'U'}
                </div>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-makrx-teal"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            {filteredNavItems.map((item) => (
              <NavLinkGuard
                key={item.href}
                flagKey={item.flagKey || 'always_enabled'}
                href={item.href}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLinkGuard>
            ))}
            
            {/* Mobile cross-portal links */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Other Portals
              </p>
              <NavLinkGuard
                flagKey="org.links.store"
                href="https://store.makrx.org"
                className="mt-1 flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                MakrX Store
              </NavLinkGuard>
            </div>

            {/* Mobile profile section */}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-5">
                <div className="w-10 h-10 bg-makrx-teal rounded-full flex items-center justify-center text-white font-medium">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <FlagGuard flagKey="org.profile.edit">
                  <a
                    href="/profile"
                    className="flex items-center px-5 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                  >
                    Edit Profile
                  </a>
                </FlagGuard>
                <a
                  href="/settings"
                  className="flex items-center px-5 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                >
                  Settings
                </a>
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center px-5 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature flag debug panel (only for internal users) */}
      <FeatureFlagDebugPanel />
    </header>
  );
}

// Debug panel for internal users to see active flags
function FeatureFlagDebugPanel() {
  const [showDebug, setShowDebug] = useState(false);
  const isInternal = useBooleanFlag('global.debug.enabled'); // Would need to add this flag
  
  if (!isInternal || typeof window === 'undefined' || !window.location.hostname.includes('localhost')) {
    return null;
  }

  const flags = [
    { key: 'cave.equipment.enabled', label: 'Equipment' },
    { key: 'cave.reservations.enabled', label: 'Reservations' },
    { key: 'cave.inventory.enabled', label: 'Inventory' },
    { key: 'cave.projects.enabled', label: 'Projects' },
    { key: 'cave.analytics.enabled', label: 'Analytics' },
    { key: 'cave.maintenance.enabled', label: 'Maintenance' },
    { key: 'cave.notifications.enabled', label: 'Notifications' }
  ];

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center">
            <div className="text-xs font-medium text-yellow-800">
              🚧 Development Mode - Feature Flags
            </div>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="ml-4 text-xs text-yellow-600 hover:text-yellow-800"
            >
              {showDebug ? 'Hide' : 'Show'} Flags
            </button>
          </div>
        </div>
        
        {showDebug && (
          <div className="pb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {flags.map(flag => (
                <FlagStatusIndicator key={flag.key} flagKey={flag.key} label={flag.label} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FlagStatusIndicator({ flagKey, label }: { flagKey: string; label: string }) {
  const isEnabled = useBooleanFlag(flagKey);
  
  return (
    <div className="flex items-center space-x-1 text-xs">
      <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-yellow-800">{label}</span>
    </div>
  );
}
