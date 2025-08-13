// User & Auth Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  assignedMakerspaces?: string[]; // For makerspace_admin, service_provider, maker
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Role Permission Definitions
export interface RolePermissions {
  users: {
    view: 'all' | 'assigned_makerspace' | 'none';
    create: boolean;
    edit: 'all' | 'assigned_makerspace' | 'none';
    delete: 'all' | 'assigned_makerspace' | 'none';
    invite: 'all' | 'assigned_makerspace' | 'none';
  };
  makerspaces: {
    view: 'all' | 'assigned' | 'none';
    create: boolean;
    edit: 'all' | 'assigned' | 'none';
    delete: 'all' | 'assigned' | 'none';
  };
  inventory: {
    view: 'all' | 'assigned_makerspace' | 'availability_only' | 'none';
    edit: 'all' | 'assigned_makerspace' | 'none';
    add: 'all' | 'assigned_makerspace' | 'none';
    deduct: 'all' | 'assigned_makerspace' | 'none';
    reorder: 'all' | 'assigned_makerspace' | 'none';
  };
  projects: {
    view: 'all' | 'assigned_makerspace' | 'own' | 'none';
    create: boolean;
    edit: 'all' | 'assigned_makerspace' | 'own' | 'none';
    delete: 'all' | 'assigned_makerspace' | 'own' | 'none';
    addMembers: boolean;
  };
  equipment: {
    view: 'all' | 'assigned_makerspace' | 'certified_only' | 'none';
    edit: 'all' | 'assigned_makerspace' | 'none';
    add: 'all' | 'assigned_makerspace' | 'none';
    reserve: boolean;
    maintenance: 'all' | 'assigned_makerspace' | 'none';
  };
  reservations: {
    view: 'all' | 'assigned_makerspace' | 'own' | 'none';
    create: boolean;
    edit: 'all' | 'assigned_makerspace' | 'own' | 'none';
    approve: 'all' | 'assigned_makerspace' | 'none';
    cancel: 'all' | 'assigned_makerspace' | 'own' | 'none';
  };
  bom: {
    view: 'all' | 'assigned_makerspace' | 'own_projects' | 'none';
    link: 'all' | 'assigned_makerspace' | 'own_projects' | 'none';
    approve: 'all' | 'assigned_makerspace' | 'none';
  };
  analytics: {
    view: 'all' | 'assigned_makerspace' | 'none';
    export: 'all' | 'assigned_makerspace' | 'none';
    generate_reports: 'all' | 'assigned_makerspace' | 'none';
  };
  billing: {
    view: 'all' | 'assigned_makerspace' | 'own' | 'none';
    manage_payments: 'all' | 'assigned_makerspace' | 'own' | 'none';
    collect_payments: 'all' | 'assigned_makerspace' | 'none';
    generate_invoices: 'all' | 'assigned_makerspace' | 'none';
    manage_credits: 'all' | 'assigned_makerspace' | 'own' | 'none';
    view_reports: 'all' | 'assigned_makerspace' | 'own' | 'none';
  };
  admin: {
    userRoleManagement: boolean;
    systemLogs: boolean;
    featureFlags: boolean;
    globalDashboard: boolean;
    makerspaceSettings: 'all' | 'assigned' | 'none';
  };
}

export type UserRole = 'super_admin' | 'admin' | 'makerspace_admin' | 'service_provider' | 'maker';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Product Types (Store)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: ProductCategory;
  images: string[];
  isActive: boolean;
  createdAt: string;
}

export type ProductCategory = '3d_printing' | 'electronics' | 'tools' | 'materials' | 'custom';

// Makerspace Types (MakrCave)
export interface Makerspace {
  id: string;
  name: string;
  description: string;
  location: string;
  equipment: Equipment[];
  members: User[];
  isActive: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  makerspaceId: string;
}

export type EquipmentType = '3d_printer' | 'laser_cutter' | 'cnc_machine' | 'workstation' | 'tool';
export type EquipmentStatus = 'available' | 'in_use' | 'maintenance' | 'offline';

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  collaborators: string[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Feature Flag Types
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  allowedRoles: UserRole[];
  environment?: 'development' | 'staging' | 'production' | 'all';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagConfig {
  [featureKey: string]: FeatureFlag;
}

export interface FeatureContext {
  user: User | null;
  environment: string;
  flags: FeatureFlagConfig;
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  flag?: FeatureFlag;
  reason?: 'disabled' | 'insufficient_role' | 'not_found' | 'environment_mismatch';
}

// Demo API Types (from shared/api.ts)
export interface DemoResponse {
  message: string;
}
