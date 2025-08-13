import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatUserDisplayNameCompact } from '../lib/userUtils';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  BarChart3,
  Globe,
  Shield,
  Database,
  Activity,
  LogOut,
  Crown,
  ToggleLeft,
  DollarSign
} from 'lucide-react';

export default function SuperAdminSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navigation = [
    {
      name: 'System Overview',
      href: '/portal/dashboard',
      icon: LayoutDashboard,
      active: isActive('/portal/dashboard')
    },
    {
      name: 'Makerspaces',
      href: '/portal/makerspaces',
      icon: Building2,
      active: isActive('/portal/makerspaces')
    },
    {
      name: 'Global Users',
      href: '/portal/users',
      icon: Users,
      active: isActive('/portal/users')
    },
    {
      name: 'Analytics',
      href: '/portal/analytics',
      icon: BarChart3,
      active: isActive('/portal/analytics')
    },
    {
      name: 'Billing & Finance',
      href: '/portal/billing',
      icon: DollarSign,
      active: isActive('/portal/billing')
    },
    {
      name: 'Network Status',
      href: '/portal/network',
      icon: Globe,
      active: isActive('/portal/network')
    }
  ];

  const systemNavigation = [
    {
      name: 'System Settings',
      href: '/portal/system/settings',
      icon: Settings,
      active: isActive('/portal/system/settings')
    },
    {
      name: 'Security & Access',
      href: '/portal/system/security',
      icon: Shield,
      active: isActive('/portal/system/security')
    },
    {
      name: 'Database Management',
      href: '/portal/system/database',
      icon: Database,
      active: isActive('/portal/system/database')
    },
    {
      name: 'System Logs',
      href: '/portal/system/logs',
      icon: Activity,
      active: isActive('/portal/system/logs')
    },
    {
      name: 'Feature Flags',
      href: '/portal/admin/feature-flags',
      icon: ToggleLeft,
      active: isActive('/portal/admin/feature-flags')
    }
  ];

  return (
    <div className="makrcave-sidebar bg-gradient-to-b from-red-900/20 to-red-800/10 border-r border-red-200">
      {/* Logo & Title */}
      <div className="p-4 sm:p-6 border-b border-red-200 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
            <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-base sm:text-lg text-red-700 truncate">Super Admin</h2>
            <p className="text-xs text-red-600 truncate">System Control</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 sm:p-4 border-b border-red-200 flex-shrink-0">
        <Link
          to="/portal/profile"
          className="flex items-center gap-2 sm:gap-3 hover:bg-red-100 rounded-lg p-2 -m-2 transition-colors group"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
            <span className="text-xs sm:text-sm font-semibold text-red-700">
              {user?.firstName?.[0] || 'S'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium truncate text-red-700 group-hover:text-red-800">
              {formatUserDisplayNameCompact(user)}
            </p>
            <p className="text-xs text-red-600 truncate group-hover:text-red-700">
              System Administrator
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-red-100 text-red-800'
                    : 'text-gray-700 hover:text-red-700 hover:bg-red-50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* System Administration */}
        <div className="mt-6 sm:mt-8">
          <h3 className="px-2 sm:px-3 mb-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
            System Administration
          </h3>
          <div className="space-y-1">
            {systemNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-red-100 text-red-800'
                      : 'text-gray-700 hover:text-red-700 hover:bg-red-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 sm:p-4 border-t border-red-200 flex-shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
