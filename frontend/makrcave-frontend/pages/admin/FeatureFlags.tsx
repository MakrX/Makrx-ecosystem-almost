import { useState } from 'react';
import { Settings, ToggleLeft, ToggleRight, Shield, Info, Eye, EyeOff } from 'lucide-react';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import { useAuth } from '../../contexts/AuthContext';
import { withFeatureFlag } from '../../components/FeatureGate';
import { UserRole } from '@makrx/types';

function FeatureFlagsPage() {
  const { getAllFlags, updateFlag } = useFeatureFlags();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [showDisabled, setShowDisabled] = useState(true);

  const allFlags = getAllFlags();
  
  // Filter flags based on search and role
  const filteredFlags = allFlags.filter(flag => {
    const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || flag.allowedRoles.includes(selectedRole);
    
    const matchesStatus = showDisabled || flag.enabled;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleFlag = (flagId: string) => {
    const flag = allFlags.find(f => f.id === flagId);
    if (flag) {
      updateFlag(flagId, { enabled: !flag.enabled });
    }
  };

  const updateFlagRoles = (flagId: string, newRoles: UserRole[]) => {
    updateFlag(flagId, { allowedRoles: newRoles });
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'makerspace_admin': return 'bg-makrx-blue text-white';
      case 'service_provider': return 'bg-yellow-100 text-yellow-800';
      case 'maker': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeatureCategory = (flagId: string) => {
    return flagId.split('.')[0];
  };

  const categoryColors: Record<string, string> = {
    dashboard: 'bg-blue-50 border-blue-200',
    equipment: 'bg-green-50 border-green-200',
    projects: 'bg-purple-50 border-purple-200',
    inventory: 'bg-yellow-50 border-yellow-200',
    reservations: 'bg-orange-50 border-orange-200',
    admin: 'bg-red-50 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Feature Flags Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage feature access and availability across the platform
        </p>
      </div>

      {/* Controls */}
      <div className="makrcave-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="text-sm font-medium block mb-2">Search Features</label>
            <input
              type="text"
              placeholder="Search by name, description, or ID..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="text-sm font-medium block mb-2">Filter by Role</label>
            <select
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
            >
              <option value="all">All Roles</option>
              <option value="super_admin">🔐 Super Admin</option>
              <option value="admin">🛠 Admin</option>
              <option value="makerspace_admin">🧑‍🏭 Makerspace Admin</option>
              <option value="service_provider">🤝 Service Provider</option>
              <option value="maker">👩‍🔬 Maker</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium block mb-2">Show Status</label>
            <button
              onClick={() => setShowDisabled(!showDisabled)}
              className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              {showDisabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showDisabled ? 'Show All' : 'Hide Disabled'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="makrcave-card text-center">
          <h3 className="text-2xl font-bold text-makrx-blue">{allFlags.length}</h3>
          <p className="text-sm text-muted-foreground">Total Features</p>
        </div>
        <div className="makrcave-card text-center">
          <h3 className="text-2xl font-bold text-green-600">{allFlags.filter(f => f.enabled).length}</h3>
          <p className="text-sm text-muted-foreground">Enabled</p>
        </div>
        <div className="makrcave-card text-center">
          <h3 className="text-2xl font-bold text-red-600">{allFlags.filter(f => !f.enabled).length}</h3>
          <p className="text-sm text-muted-foreground">Disabled</p>
        </div>
        <div className="makrcave-card text-center">
          <h3 className="text-2xl font-bold text-yellow-600">{filteredFlags.length}</h3>
          <p className="text-sm text-muted-foreground">Filtered Results</p>
        </div>
      </div>

      {/* Feature Flags List */}
      <div className="space-y-4">
        {filteredFlags.map((flag) => (
          <div key={flag.id} className={`makrcave-card ${categoryColors[getFeatureCategory(flag.id)] || 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{flag.name}</h3>
                  <span className="text-xs font-mono px-2 py-1 bg-gray-100 rounded">
                    {flag.id}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    flag.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{flag.description}</p>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Roles:</span>
                    <div className="flex gap-1">
                      {flag.allowedRoles.map((role) => (
                        <span key={role} className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                          {role.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {flag.environment && flag.environment !== 'all' && (
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Environment: {flag.environment}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFlag(flag.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                    flag.enabled 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {flag.enabled ? (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      Disabled
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Updated: {new Date(flag.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFlags.length === 0 && (
        <div className="makrcave-card text-center py-12">
          <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Features Found</h3>
          <p className="text-muted-foreground">
            No features match your current filters. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}

// Only allow super admins to access feature flags management
export default withFeatureFlag(FeatureFlagsPage, 'admin.feature_flags');
