import { UserRole, RolePermissions } from '@makrx/types';

// Role Permission Configuration based on user requirements
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    users: {
      view: 'all',
      create: true,
      edit: 'all',
      delete: 'all',
      invite: 'all',
    },
    makerspaces: {
      view: 'all',
      create: true,
      edit: 'all',
      delete: 'all',
    },
    inventory: {
      view: 'all',
      edit: 'all',
      add: 'all',
      deduct: 'all',
      reorder: 'all',
    },
    projects: {
      view: 'all',
      create: true,
      edit: 'all',
      delete: 'all',
      addMembers: true,
    },
    equipment: {
      view: 'all',
      edit: 'all',
      add: 'all',
      reserve: true,
      maintenance: 'all',
    },
    reservations: {
      view: 'all',
      create: true,
      edit: 'all',
      approve: 'all',
      cancel: 'all',
    },
    bom: {
      view: 'all',
      link: 'all',
      approve: 'all',
    },
    analytics: {
      view: 'all',
      export: 'all',
      generate_reports: 'all',
    },
    billing: {
      view: 'all',
      manage_payments: 'all',
      collect_payments: 'all',
      generate_invoices: 'all',
      manage_credits: 'all',
      view_reports: 'all',
    },
    admin: {
      userRoleManagement: true,
      systemLogs: true,
      featureFlags: true,
      globalDashboard: true,
      makerspaceSettings: 'all',
      healthMonitoring: true,
    },
  },

  admin: {
    users: {
      view: 'all',
      create: true,
      edit: 'all',
      delete: 'none', // Can invite/remove but not delete
      invite: 'all',
    },
    makerspaces: {
      view: 'all',
      create: false,
      edit: 'none',
      delete: 'none',
    },
    inventory: {
      view: 'all',
      edit: 'none',
      add: 'none',
      deduct: 'none',
      reorder: 'none',
    },
    projects: {
      view: 'all',
      create: true,
      edit: 'own', // Only if contributor
      delete: 'own',
      addMembers: true,
    },
    equipment: {
      view: 'all',
      edit: 'none',
      add: 'none',
      reserve: true,
      maintenance: 'none',
    },
    reservations: {
      view: 'all',
      create: true,
      edit: 'own',
      approve: 'none',
      cancel: 'own',
    },
    bom: {
      view: 'all',
      link: 'none',
      approve: 'none',
    },
    analytics: {
      view: 'all',
      export: 'all',
      generate_reports: 'none',
    },
    billing: {
      view: 'all',
      manage_payments: 'none',
      collect_payments: 'none',
      generate_invoices: 'none',
      manage_credits: 'own',
      view_reports: 'all',
    },
    admin: {
      userRoleManagement: true,
      systemLogs: false,
      featureFlags: false,
      globalDashboard: true,
      makerspaceSettings: 'none',
      healthMonitoring: true,
    },
  },

  makerspace_admin: {
    users: {
      view: 'assigned_makerspace',
      create: true,
      edit: 'assigned_makerspace',
      delete: 'assigned_makerspace',
      invite: 'assigned_makerspace',
    },
    makerspaces: {
      view: 'assigned',
      create: false,
      edit: 'assigned',
      delete: 'none',
    },
    inventory: {
      view: 'assigned_makerspace',
      edit: 'assigned_makerspace',
      add: 'assigned_makerspace',
      deduct: 'assigned_makerspace',
      reorder: 'assigned_makerspace',
    },
    projects: {
      view: 'assigned_makerspace',
      create: true,
      edit: 'assigned_makerspace',
      delete: 'assigned_makerspace',
      addMembers: true,
    },
    equipment: {
      view: 'assigned_makerspace',
      edit: 'assigned_makerspace',
      add: 'assigned_makerspace',
      reserve: true,
      maintenance: 'assigned_makerspace',
    },
    reservations: {
      view: 'assigned_makerspace',
      create: true,
      edit: 'assigned_makerspace',
      approve: 'assigned_makerspace',
      cancel: 'assigned_makerspace',
    },
    bom: {
      view: 'assigned_makerspace',
      link: 'assigned_makerspace',
      approve: 'assigned_makerspace',
    },
    analytics: {
      view: 'assigned_makerspace',
      export: 'assigned_makerspace',
      generate_reports: 'assigned_makerspace',
    },
    billing: {
      view: 'assigned_makerspace',
      manage_payments: 'assigned_makerspace',
      collect_payments: 'assigned_makerspace',
      generate_invoices: 'assigned_makerspace',
      manage_credits: 'assigned_makerspace',
      view_reports: 'assigned_makerspace',
    },
    admin: {
      userRoleManagement: false,
      systemLogs: false,
      featureFlags: false,
      globalDashboard: false,
      makerspaceSettings: 'assigned',
      healthMonitoring: false,
    },
  },

  service_provider: {
    users: {
      view: 'none',
      create: false,
      edit: 'none',
      delete: 'none',
      invite: 'none',
    },
    makerspaces: {
      view: 'assigned',
      create: false,
      edit: 'none',
      delete: 'none',
    },
    inventory: {
      view: 'availability_only',
      edit: 'none',
      add: 'none',
      deduct: 'none',
      reorder: 'none',
    },
    projects: {
      view: 'own',
      create: false,
      edit: 'none',
      delete: 'none',
      addMembers: false,
    },
    equipment: {
      view: 'assigned_makerspace',
      edit: 'none',
      add: 'none',
      reserve: true,
      maintenance: 'none',
    },
    reservations: {
      view: 'own',
      create: true,
      edit: 'own',
      approve: 'none',
      cancel: 'own',
    },
    bom: {
      view: 'none',
      link: 'none',
      approve: 'none',
    },
    analytics: {
      view: 'none',
      export: 'none',
      generate_reports: 'none',
    },
    billing: {
      view: 'none',
      manage_payments: 'none',
      collect_payments: 'none',
      generate_invoices: 'none',
      manage_credits: 'none',
      view_reports: 'none',
    },
    admin: {
      userRoleManagement: false,
      systemLogs: false,
      featureFlags: false,
      globalDashboard: false,
      makerspaceSettings: 'none',
      healthMonitoring: false,
    },
  },

  maker: {
    users: {
      view: 'none',
      create: false,
      edit: 'none',
      delete: 'none',
      invite: 'none',
    },
    makerspaces: {
      view: 'assigned',
      create: false,
      edit: 'none',
      delete: 'none',
    },
    inventory: {
      view: 'availability_only',
      edit: 'none',
      add: 'none',
      deduct: 'none',
      reorder: 'none',
    },
    projects: {
      view: 'own',
      create: true,
      edit: 'own',
      delete: 'own',
      addMembers: true,
    },
    equipment: {
      view: 'certified_only',
      edit: 'none',
      add: 'none',
      reserve: true,
      maintenance: 'none',
    },
    reservations: {
      view: 'own',
      create: true,
      edit: 'own',
      approve: 'none',
      cancel: 'own',
    },
    bom: {
      view: 'own_projects',
      link: 'own_projects',
      approve: 'none',
    },
    analytics: {
      view: 'none',
      export: 'none',
      generate_reports: 'none',
    },
    billing: {
      view: 'own',
      manage_payments: 'own',
      collect_payments: 'none',
      generate_invoices: 'none',
      manage_credits: 'own',
      view_reports: 'own',
    },
    admin: {
      userRoleManagement: false,
      systemLogs: false,
      featureFlags: false,
      globalDashboard: false,
      makerspaceSettings: 'none',
      healthMonitoring: false,
    },
  },
};

// Helper function to get permissions for a role
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

// Helper function to check if a user has permission for a specific action
export function hasPermission(
  userRole: UserRole,
  area: keyof RolePermissions,
  action: string,
  context?: { 
    isOwnResource?: boolean; 
    isAssignedMakerspace?: boolean;
    isCertified?: boolean;
  }
): boolean {
  const permissions = getRolePermissions(userRole);
  const areaPermissions = permissions[area] as any;
  
  if (!areaPermissions || areaPermissions[action] === undefined) {
    return false;
  }
  
  const permission = areaPermissions[action];
  
  // Handle boolean permissions
  if (typeof permission === 'boolean') {
    return permission;
  }
  
  // Handle string-based permissions
  switch (permission) {
    case 'all':
      return true;
    case 'assigned':
    case 'assigned_makerspace':
      return context?.isAssignedMakerspace ?? false;
    case 'own':
    case 'own_projects':
      return context?.isOwnResource ?? false;
    case 'certified_only':
      return context?.isCertified ?? false;
    case 'availability_only':
      return action === 'view';
    case 'none':
    default:
      return false;
  }
}

// UI Access configuration based on roles
export const UI_ACCESS: Record<UserRole, {
  dashboard: 'global' | 'makerspace' | 'personal';
  adminPanels: string[];
  inventoryAccess: 'full' | 'view' | 'availability' | 'none';
  canViewAllMakerspaces: boolean;
  canManageUsers: boolean;
}> = {
  super_admin: {
    dashboard: 'global',
    adminPanels: ['users', 'makerspaces', 'inventory', 'analytics', 'maintenance', 'feature-flags', 'system-logs', 'health-monitoring'],
    inventoryAccess: 'full',
    canViewAllMakerspaces: true,
    canManageUsers: true,
  },
  admin: {
    dashboard: 'global',
    adminPanels: ['users', 'user-roles', 'analytics', 'makerspaces', 'health-monitoring'],
    inventoryAccess: 'view',
    canViewAllMakerspaces: true,
    canManageUsers: true,
  },
  makerspace_admin: {
    dashboard: 'makerspace',
    adminPanels: ['inventory', 'reservations', 'makerspace-settings', 'assigned-users', 'analytics', 'maintenance'],
    inventoryAccess: 'full',
    canViewAllMakerspaces: false,
    canManageUsers: false,
  },
  service_provider: {
    dashboard: 'personal',
    adminPanels: [],
    inventoryAccess: 'availability',
    canViewAllMakerspaces: false,
    canManageUsers: false,
  },
  maker: {
    dashboard: 'personal',
    adminPanels: [],
    inventoryAccess: 'availability',
    canViewAllMakerspaces: false,
    canManageUsers: false,
  },
};
