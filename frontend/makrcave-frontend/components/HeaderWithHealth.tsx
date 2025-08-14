// ========================================
// HEADER WITH HEALTH STATUS
// ========================================
// Enhanced header component that includes health monitoring
// Shows system health status in the navigation bar

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatUserDisplayNameCompact } from '../lib/userUtils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Bell, 
  LogOut, 
  Settings, 
  User, 
  Building2,
  Activity,
  ChevronDown
} from 'lucide-react';
import HealthStatusIndicator from './HealthStatusIndicator';
import { useHealth, useHealthStatus } from '../contexts/HealthContext';
import { ThemeToggle } from '../../../packages/ui/components/ThemeToggle';

interface HeaderWithHealthProps {
  showHealthStatus?: boolean;
  title?: string;
}

export default function HeaderWithHealth({ 
  showHealthStatus = true, 
  title = "MakrCave" 
}: HeaderWithHealthProps) {
  const { user, logout } = useAuth();
  const { runHealthChecks } = useHealth();
  const healthStatus = useHealthStatus();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setIsProfileOpen(false);
    navigate('/portal/profile');
  };

  const handleSettingsClick = () => {
    setIsProfileOpen(false);
    navigate('/portal/settings');
  };

  const handleHealthClick = () => {
    navigate('/portal/system-health');
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const getUserDisplayName = () => {
    return formatUserDisplayNameCompact(user);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500';
      case 'admin': return 'bg-blue-500';
      case 'makerspace_admin': return 'bg-green-500';
      case 'service_provider': return 'bg-orange-500';
      case 'user': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatRoleDisplay = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // ========================================
  // RENDER METHODS
  // ========================================

  const renderLogo = () => (
    <Link to="/portal/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
      <div className="w-8 h-8 bg-makrx-teal rounded-lg flex items-center justify-center">
        <Building2 className="w-5 h-5 text-white" />
      </div>
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
    </Link>
  );

  const renderHealthStatus = () => {
    if (!showHealthStatus) return null;

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">System:</span>
        <HealthStatusIndicator 
          showLabel={false} 
          variant="compact" 
          position="header"
        />
      </div>
    );
  };

  const renderUserMenu = () => (
    <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-9">
          <div className="w-8 h-8 bg-makrx-blue rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">{getUserDisplayName()}</span>
            <Badge
              className={`text-xs text-white ${getRoleBadgeColor(user?.role || 'user')}`}
              variant="secondary"
            >
              {formatRoleDisplay(user?.role || 'user')}
            </Badge>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <div className="font-medium">{getUserDisplayName()}</div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
          <Badge
            className={`text-xs text-white mt-1 ${getRoleBadgeColor(user?.role || 'user')}`}
            variant="secondary"
          >
            {formatRoleDisplay(user?.role || 'user')}
          </Badge>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettingsClick}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        {showHealthStatus && (
          <DropdownMenuItem onClick={handleHealthClick}>
            <Activity className="w-4 h-4 mr-2" />
            System Health
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderNotifications = () => (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="w-4 h-4" />
      {/* Optional notification badge */}
      {healthStatus.overall === 'unhealthy' && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </Button>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center gap-4">
            {renderLogo()}
          </div>

          {/* Center - Health Status (on larger screens) */}
          <div className="hidden lg:flex items-center">
            {renderHealthStatus()}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Health Status (on smaller screens) */}
            <div className="lg:hidden">
              {renderHealthStatus()}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle variant="icon-only" />

            {/* Notifications */}
            {renderNotifications()}

            {/* User Menu */}
            {renderUserMenu()}
          </div>
        </div>
      </div>

      {/* Mobile Health Status Banner (if unhealthy) */}
      {showHealthStatus && healthStatus.overall === 'unhealthy' && (
        <div className="lg:hidden bg-red-500 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Activity className="w-4 h-4" />
            <span>System issues detected</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleHealthClick}
              className="text-white hover:bg-red-600 h-6 px-2 ml-2"
            >
              View Details
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
