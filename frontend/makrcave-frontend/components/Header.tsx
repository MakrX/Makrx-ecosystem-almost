import { Search, Menu, ExternalLink, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatUserDisplayName } from '../lib/userUtils';
import { FeatureGate } from './FeatureGate';
import { ThemeToggle } from '../../../packages/ui/components/ThemeToggle';
import NotificationPanel from './NotificationPanel';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();

  return (
    <header className="makrcave-header">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu button */}
        <button className="lg:hidden p-2 hover:bg-accent rounded-lg">
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search inventory, equipment, projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-2 px-3 py-1 text-xs border border-border rounded">
          <UserIcon className="w-3 h-3" />
          <span className="font-medium">{formatUserDisplayName(user)}</span>
          <span className="text-muted-foreground">•</span>
          <span className="capitalize text-muted-foreground">
            {user?.role.replace('_', ' ')}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
          <FeatureGate
            featureKey="equipment.reservation_system"
            fallback={null}
          >
            <button className="makrcave-btn-secondary text-xs">
              Quick Reserve
            </button>
          </FeatureGate>

          <FeatureGate
            featureKey="admin.global_dashboard"
            fallback={null}
          >
            <a
              href="https://e986654b5a5843d7b3f8adf13b61022c-556d114307be4dee892ae999b.projects.builder.codes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded hover:bg-accent transition-colors"
            >
              MakrX Gateway
              <ExternalLink className="w-3 h-3" />
            </a>
          </FeatureGate>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle variant="compact" className="hidden sm:flex" />

        {/* Notifications */}
        <NotificationPanel />

        {/* Current Date/Time */}
        <div className="hidden md:block text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </div>
    </header>
  );
}
