import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatUserDisplayNameCompact } from '../lib/userUtils';
import { useMakerspace } from '../contexts/MakerspaceContext';
import {
  LayoutDashboard,
  Package,
  Wrench,
  FolderOpen,
  Calendar,
  Users,
  Settings,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Building2,
  LogOut,
  GraduationCap,
  Bell,
  Sparkles,
  TrendingUp,
  BookOpen,
  Shield,
  MessageSquare,
  Zap
} from 'lucide-react';

export default function ManagerSidebar() {
  const { user, logout } = useAuth();
  const { currentMakerspace, allMakerspaces } = useMakerspace();
  const location = useLocation();

  // Find the makerspace this manager is assigned to
  const managedMakerspace = allMakerspaces.find(ms =>
    user?.assignedMakerspaces?.includes(ms.id)
  ) || currentMakerspace;

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/portal/dashboard',
      icon: LayoutDashboard,
      active: isActive('/portal/dashboard')
    },
    {
      name: 'Inventory',
      href: '/portal/inventory',
      icon: Package,
      active: isActive('/portal/inventory')
    },
    {
      name: 'Smart Inventory',
      href: '/portal/smart-inventory',
      icon: Package,
      active: isActive('/portal/smart-inventory')
    },
    {
      name: 'Equipment',
      href: '/portal/equipment',
      icon: Wrench,
      active: isActive('/portal/equipment')
    },
    {
      name: 'Projects',
      href: '/portal/projects',
      icon: FolderOpen,
      active: isActive('/portal/projects')
    },
    {
      name: 'Project Showcase',
      href: '/portal/showcase',
      icon: Sparkles,
      active: isActive('/portal/showcase')
    },
    {
      name: 'Reservations',
      href: '/portal/reservations',
      icon: Calendar,
      active: isActive('/portal/reservations')
    },
    {
      name: 'Maintenance',
      href: '/portal/maintenance',
      icon: Settings,
      active: isActive('/portal/maintenance')
    },
    {
      name: 'Advanced Maintenance',
      href: '/portal/advanced-maintenance',
      icon: Shield,
      active: isActive('/portal/advanced-maintenance')
    },
    {
      name: 'Analytics & Reports',
      href: '/portal/analytics',
      icon: BarChart3,
      active: isActive('/portal/analytics')
    },
    {
      name: 'Capacity Planning',
      href: '/portal/capacity-planning',
      icon: TrendingUp,
      active: isActive('/portal/capacity-planning')
    },
    {
      name: 'Learning Center',
      href: '/portal/learning',
      icon: BookOpen,
      active: isActive('/portal/learning')
    },
    {
      name: 'Community',
      href: '/portal/community',
      icon: MessageSquare,
      active: isActive('/portal/community')
    },
    {
      name: 'Integrations',
      href: '/portal/integrations',
      icon: Zap,
      active: isActive('/portal/integrations')
    },
    {
      name: 'Notifications Center',
      href: '/portal/notifications',
      icon: Bell,
      active: isActive('/portal/notifications')
    }
  ];

  const managementNavigation = [
    {
      name: 'Member Management',
      href: '/portal/members',
      icon: Users,
      active: isActive('/portal/members')
    },
    {
      name: 'Skill Management',
      href: '/portal/skills',
      icon: GraduationCap,
      active: isActive('/portal/skills')
    },
    {
      name: 'Billing & Payments',
      href: '/portal/billing',
      icon: DollarSign,
      active: isActive('/portal/billing')
    },

    {
      name: 'Makerspace Settings',
      href: '/portal/settings',
      icon: Settings,
      active: isActive('/portal/settings')
    }
  ];

  return (
    <div className="makrcave-sidebar bg-gradient-to-b from-blue-50 to-blue-100/50 border-r border-blue-200">
      {/* Logo & Title */}
      <div className="p-4 sm:p-6 border-b border-blue-200 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-makrx-blue to-blue-700 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-base sm:text-lg text-makrx-blue truncate">
              {managedMakerspace?.name || 'MakrCave'}
            </h2>
            <p className="text-xs text-blue-600 truncate">Manager Portal</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 sm:p-4 border-b border-blue-200 flex-shrink-0">
        <Link
          to="/portal/profile"
          className="flex items-center gap-2 sm:gap-3 hover:bg-blue-100 rounded-lg p-2 -m-2 transition-colors group"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-makrx-teal rounded-full flex items-center justify-center group-hover:bg-makrx-teal-dark transition-colors flex-shrink-0">
            <span className="text-xs sm:text-sm font-semibold text-white">
              {user?.firstName?.[0] || 'M'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium truncate text-makrx-blue group-hover:text-blue-800">
              {formatUserDisplayNameCompact(user)}
            </p>
            <p className="text-xs text-blue-600 truncate group-hover:text-blue-700">
              Makerspace Manager
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
                    ? 'bg-makrx-blue text-white'
                    : 'text-gray-700 hover:text-makrx-blue hover:bg-blue-50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Management Section */}
        <div className="mt-6 sm:mt-8">
          <h3 className="px-2 sm:px-3 mb-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Management
          </h3>
          <div className="space-y-1">
            {managementNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-makrx-brown text-white'
                      : 'text-gray-700 hover:text-makrx-brown hover:bg-amber-50'
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
      <div className="p-3 sm:p-4 border-t border-blue-200 flex-shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-makrx-blue hover:bg-blue-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
