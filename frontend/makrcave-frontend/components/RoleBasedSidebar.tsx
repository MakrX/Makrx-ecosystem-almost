import { useAuth } from '../contexts/AuthContext';
import SuperAdminSidebar from './SuperAdminSidebar';
import ManagerSidebar from './ManagerSidebar';
import MakerSidebar from './MakerSidebar';
import { formatUserDisplayNameCompact } from '../lib/userUtils';

// Admin Sidebar Component
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  UserCog
} from 'lucide-react';

function AdminSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const navigation = [
    {
      name: 'Global Dashboard',
      href: '/portal/dashboard',
      icon: LayoutDashboard,
      active: isActive('/portal/dashboard')
    },
    {
      name: 'User Management',
      href: '/portal/admin/users',
      icon: Users,
      active: isActive('/portal/admin/users')
    },
    {
      name: 'Role Management',
      href: '/portal/admin/roles',
      icon: UserCog,
      active: isActive('/portal/admin/roles')
    },
    {
      name: 'Analytics',
      href: '/portal/analytics',
      icon: BarChart3,
      active: isActive('/portal/analytics')
    }
  ];

  return (
    <div className="makrcave-sidebar bg-gradient-to-b from-blue-900/20 to-blue-800/10 border-r border-blue-200">
      {/* Logo & Title */}
      <div className="p-4 sm:p-6 border-b border-blue-200 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-base sm:text-lg text-blue-700 truncate">Admin</h2>
            <p className="text-xs text-blue-600 truncate">Organization Manager</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 sm:p-4 border-b border-blue-200 flex-shrink-0">
        <Link
          to="/portal/profile"
          className="flex items-center gap-2 sm:gap-3 hover:bg-blue-100 rounded-lg p-2 -m-2 transition-colors group"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
            <span className="text-xs sm:text-sm font-semibold text-blue-700">
              {user?.firstName?.[0] || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium truncate text-blue-700 group-hover:text-blue-800">
              {formatUserDisplayNameCompact(user)}
            </p>
            <p className="text-xs text-blue-600 truncate group-hover:text-blue-700">
              Organization Administrator
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
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Restricted Access Notice */}
        <div className="mt-6 sm:mt-8 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-xs sm:text-sm font-medium text-yellow-800 mb-1">Limited Access</h4>
          <p className="text-xs text-yellow-700">
            Cannot modify makerspace inventory or machines. View-only access to most resources.
          </p>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 sm:p-4 border-t border-blue-200 flex-shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// Service Provider Sidebar Component - Now Functional!
function ServiceProviderSidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="makrcave-sidebar bg-gradient-to-b from-purple-900/20 to-purple-800/10 border-r border-purple-200">
      {/* Logo & Title */}
      <div className="p-4 sm:p-6 border-b border-purple-200 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-base sm:text-lg text-purple-700 truncate">Service Provider</h2>
            <p className="text-xs text-purple-600 truncate">Job Management Portal</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 sm:p-4 border-b border-purple-200 flex-shrink-0">
        <Link
          to="/portal/profile"
          className="flex items-center gap-2 sm:gap-3 hover:bg-purple-100 rounded-lg p-2 -m-2 transition-colors group"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
            <span className="text-xs sm:text-sm font-semibold text-purple-700">
              {user?.firstName?.[0] || 'S'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium truncate text-purple-700 group-hover:text-purple-800">
              {formatUserDisplayNameCompact(user)}
            </p>
            <p className="text-xs text-purple-600 truncate group-hover:text-purple-700">
              Service Provider
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <nav className="space-y-1">
          <Link
            to="/portal/dashboard"
            className="makrcave-nav-item text-purple-700 hover:text-purple-800 hover:bg-purple-100"
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/portal/jobs"
            className="makrcave-nav-item text-purple-700 hover:text-purple-800 hover:bg-purple-100"
          >
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Job Management</span>
          </Link>

          <Link
            to="/portal/inventory"
            className="makrcave-nav-item text-purple-700 hover:text-purple-800 hover:bg-purple-100"
          >
            <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Inventory</span>
          </Link>

          <Link
            to="/portal/equipment"
            className="makrcave-nav-item text-purple-700 hover:text-purple-800 hover:bg-purple-100"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Equipment</span>
          </Link>

          <Link
            to="/portal/analytics"
            className="makrcave-nav-item text-purple-700 hover:text-purple-800 hover:bg-purple-100"
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Analytics</span>
          </Link>

          <Link
            to="/portal/settings"
            className="makrcave-nav-item text-purple-700 hover:text-purple-800 hover:bg-purple-100"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Logout */}
      <div className="p-3 sm:p-4 border-t border-purple-200 flex-shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// Main Role-Based Sidebar Component
export default function RoleBasedSidebar() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminSidebar />;
    case 'admin':
      return <AdminSidebar />;
    case 'makerspace_admin':
      return <ManagerSidebar />;
    case 'service_provider':
      return <ServiceProviderSidebar />;
    case 'maker':
      return <MakerSidebar />;
    default:
      return <MakerSidebar />;
  }
}
