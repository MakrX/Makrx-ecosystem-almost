import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FeatureFlag, FeatureFlagConfig, FeatureContext, FeatureAccessResult, UserRole } from '@makrx/types';
import { useAuth } from './AuthContext';

interface FeatureFlagContextType {
  flags: FeatureFlagConfig;
  hasFeatureAccess: (featureKey: string) => FeatureAccessResult;
  isFeatureEnabled: (featureKey: string) => boolean;
  updateFlag: (featureKey: string, updates: Partial<FeatureFlag>) => void;
  getAllFlags: () => FeatureFlag[];
  getFlagsForRole: (role: UserRole) => FeatureFlag[];
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

// Default feature flag configuration aligned with role permissions
const defaultFlags: FeatureFlagConfig = {
  // Dashboard Features
  'dashboard.global_view': {
    id: 'dashboard.global_view',
    name: 'Global Dashboard View',
    description: 'Access to global dashboard with system-wide visibility',
    enabled: true,
    allowedRoles: ['super_admin', 'admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'dashboard.makerspace_view': {
    id: 'dashboard.makerspace_view',
    name: 'Makerspace Dashboard',
    description: 'Access to makerspace-specific dashboard and management',
    enabled: true,
    allowedRoles: ['super_admin', 'makerspace_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'dashboard.personal_view': {
    id: 'dashboard.personal_view',
    name: 'Personal Dashboard',
    description: 'Access to personal projects and reservations dashboard',
    enabled: true,
    allowedRoles: ['super_admin', 'admin', 'makerspace_admin', 'service_provider', 'maker'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Equipment Features
  'equipment.view_all': {
    id: 'equipment.view_all',
    name: 'View All Equipment',
    description: 'View equipment across all makerspaces',
    enabled: true,
    allowedRoles: ['super_admin', 'admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'equipment.view_assigned': {
    id: 'equipment.view_assigned',
    name: 'View Assigned Equipment',
    description: 'View equipment in assigned makerspaces only',
    enabled: true,
    allowedRoles: ['makerspace_admin', 'service_provider'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'equipment.view_certified': {
    id: 'equipment.view_certified',
    name: 'View Certified Equipment',
    description: 'View equipment user is certified to use',
    enabled: true,
    allowedRoles: ['maker'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'equipment.reservation_system': {
    id: 'equipment.reservation_system',
    name: 'Equipment Reservations',
    description: 'Reserve equipment slots (if trained/certified) - Maker users only',
    enabled: true,
    allowedRoles: ['maker'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'equipment.add_edit': {
    id: 'equipment.add_edit',
    name: 'Add/Edit Equipment',
    description: 'Add new equipment and edit existing machines',
    enabled: true,
    allowedRoles: ['super_admin', 'makerspace_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'equipment.maintenance_mode': {
    id: 'equipment.maintenance_mode',
    name: 'Equipment Maintenance',
    description: 'Equipment maintenance and status management',
    enabled: true,
    allowedRoles: ['super_admin', 'makerspace_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Inventory Features
  'inventory.view_all': {
    id: 'inventory.view_all',
    name: 'View All Inventory',
    description: 'View and edit inventory across all makerspaces',
    enabled: true,
    allowedRoles: ['super_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'inventory.view_assigned': {
    id: 'inventory.view_assigned',
    name: 'View Assigned Inventory',
    description: 'View inventory in assigned makerspaces',
    enabled: true,
    allowedRoles: ['admin', 'makerspace_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'inventory.view_availability': {
    id: 'inventory.view_availability',
    name: 'View Inventory Availability',
    description: 'View availability of inventory items only',
    enabled: true,
    allowedRoles: ['service_provider', 'maker'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'inventory.full_management': {
    id: 'inventory.full_management',
    name: 'Full Inventory Management',
    description: 'Add, deduct, and reorder inventory items',
    enabled: true,
    allowedRoles: ['super_admin', 'admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'inventory.qr_scanning': {
    id: 'inventory.qr_scanning',
    name: 'QR Code Scanning',
    description: 'Scan QR codes to identify and manage inventory',
    enabled: true,
    allowedRoles: ['super_admin', 'admin', 'makerspace_admin', 'service_provider', 'maker'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'inventory.qr_generation': {
    id: 'inventory.qr_generation',
    name: 'QR Code Generation',
    description: 'Generate QR codes for inventory items',
    enabled: true,
    allowedRoles: ['super_admin', 'admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'inventory.makerspace_management': {
    id: 'inventory.makerspace_management',
    name: 'Makerspace Inventory Management',
    description: 'Add and edit inventory within assigned makerspaces',
    enabled: true,
    allowedRoles: ['super_admin', 'admin', 'makerspace_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Project Features
  'projects.view_all': {
    id: 'projects.view_all',
    name: 'View All Projects',
    description: 'View all projects across the system',
    enabled: true,
    allowedRoles: ['super_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'projects.view_assigned': {
    id: 'projects.view_assigned',
    name: 'View Assigned Projects',
    description: 'View projects within assigned makerspaces',
    enabled: true,
    allowedRoles: ['admin', 'makerspace_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'projects.personal': {
    id: 'projects.personal',
    name: 'Personal Projects',
    description: 'Create and manage personal projects, add members',
    enabled: true,
    allowedRoles: ['super_admin', 'admin', 'maker'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'projects.collaboration': {
    id: 'projects.collaboration',
    name: 'Project Collaboration',
    description: 'Multi-user project collaboration features',
    enabled: true,
    allowedRoles: ['super_admin', 'admin', 'makerspace_admin', 'maker'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Reservation Features
  'reservations.view_all': {
    id: 'reservations.view_all',
    name: 'View All Reservations',
    description: 'View global calendar across all makerspaces',
    enabled: true,
    allowedRoles: ['super_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'reservations.view_assigned': {
    id: 'reservations.view_assigned',
    name: 'View Assigned Reservations',
    description: 'View and manage reservations in assigned makerspaces',
    enabled: true,
    allowedRoles: ['admin', 'makerspace_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'reservations.personal': {
    id: 'reservations.personal',
    name: 'Personal Reservations',
    description: 'Book and cancel personal equipment reservations',
    enabled: true,
    allowedRoles: ['super_admin', 'admin', 'makerspace_admin', 'maker'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'reservations.approval_workflow': {
    id: 'reservations.approval_workflow',
    name: 'Reservation Approval Workflow',
    description: 'Approve and manage reservation requests',
    enabled: true,
    allowedRoles: ['super_admin', 'makerspace_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // BOM (Bill of Materials) Features
  'bom.view_all': {
    id: 'bom.view_all',
    name: 'View All BOMs',
    description: 'View BOMs across all projects and makerspaces',
    enabled: true,
    allowedRoles: ['super_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'bom.link_products': {
    id: 'bom.link_products',
    name: 'Link BOM to Products',
    description: 'Link BOM items to store products and approve requests',
    enabled: true,
    allowedRoles: ['super_admin', 'makerspace_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'bom.add_materials': {
    id: 'bom.add_materials',
    name: 'Add Materials to BOM',
    description: 'Add materials to project BOMs (linked to store)',
    enabled: true,
    allowedRoles: ['super_admin', 'admin', 'maker'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // User Management Features
  'users.view_all': {
    id: 'users.view_all',
    name: 'View All Users',
    description: 'View all users across the ecosystem',
    enabled: true,
    allowedRoles: ['super_admin', 'admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'users.manage_assigned': {
    id: 'users.manage_assigned',
    name: 'Manage Assigned Users',
    description: 'Add/remove users within assigned makerspaces',
    enabled: true,
    allowedRoles: ['makerspace_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'users.role_management': {
    id: 'users.role_management',
    name: 'User Role Management',
    description: 'Manage user roles and permissions',
    enabled: true,
    allowedRoles: ['super_admin', 'admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Makerspace Management Features
  'makerspaces.create_delete': {
    id: 'makerspaces.create_delete',
    name: 'Create/Delete Makerspaces',
    description: 'Create and delete makerspaces',
    enabled: true,
    allowedRoles: ['super_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'makerspaces.edit_assigned': {
    id: 'makerspaces.edit_assigned',
    name: 'Edit Assigned Makerspaces',
    description: 'Edit settings for assigned makerspaces',
    enabled: true,
    allowedRoles: ['super_admin', 'makerspace_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Admin Features
  'admin.system_logs': {
    id: 'admin.system_logs',
    name: 'System Logs',
    description: 'View system logs and audit trails',
    enabled: true,
    allowedRoles: ['super_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'admin.feature_flags': {
    id: 'admin.feature_flags',
    name: 'Feature Flag Management',
    description: 'Manage feature flags and system configuration',
    enabled: true,
    allowedRoles: ['super_admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'admin.global_dashboard': {
    id: 'admin.global_dashboard',
    name: 'Global Dashboard Access',
    description: 'Access to global system dashboard',
    enabled: true,
    allowedRoles: ['super_admin', 'admin'],
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlagConfig>(defaultFlags);
  const environment = process.env.NODE_ENV || 'development';

  // Load flags from localStorage on mount (in real app, would be from API)
  useEffect(() => {
    const savedFlags = localStorage.getItem('makrcave_feature_flags');
    if (savedFlags) {
      try {
        const parsedFlags = JSON.parse(savedFlags);
        setFlags({ ...defaultFlags, ...parsedFlags });
      } catch (error) {
        console.warn('Failed to parse saved feature flags:', error);
      }
    }
  }, []);

  // Save flags to localStorage when they change
  const updateFlag = (featureKey: string, updates: Partial<FeatureFlag>) => {
    const updatedFlags = {
      ...flags,
      [featureKey]: {
        ...flags[featureKey],
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    };
    setFlags(updatedFlags);
    localStorage.setItem('makrcave_feature_flags', JSON.stringify(updatedFlags));
  };

  const hasFeatureAccess = (featureKey: string): FeatureAccessResult => {
    const flag = flags[featureKey];
    
    if (!flag) {
      return { hasAccess: false, reason: 'not_found' };
    }

    if (!flag.enabled) {
      return { hasAccess: false, flag, reason: 'disabled' };
    }

    // Check environment compatibility
    if (flag.environment && flag.environment !== 'all' && flag.environment !== environment) {
      return { hasAccess: false, flag, reason: 'environment_mismatch' };
    }

    // Check role access
    if (!user || !flag.allowedRoles.includes(user.role)) {
      return { hasAccess: false, flag, reason: 'insufficient_role' };
    }

    return { hasAccess: true, flag };
  };

  const isFeatureEnabled = (featureKey: string): boolean => {
    return hasFeatureAccess(featureKey).hasAccess;
  };

  const getAllFlags = (): FeatureFlag[] => {
    return Object.values(flags);
  };

  const getFlagsForRole = (role: UserRole): FeatureFlag[] => {
    return Object.values(flags).filter(flag => flag.allowedRoles.includes(role));
  };

  return (
    <FeatureFlagContext.Provider value={{
      flags,
      hasFeatureAccess,
      isFeatureEnabled,
      updateFlag,
      getAllFlags,
      getFlagsForRole,
    }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}
