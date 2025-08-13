export type MakerspaceStatus = 'active' | 'suspended' | 'pending';
export type ModuleKey = 'inventory' | 'projects' | 'reservations' | 'billing' | 'analytics' | 'maintenance' | 'skill_management';

export interface Makerspace {
  id: string;
  name: string;
  slug: string;
  location: string;
  address: string;
  subdomain?: string;
  createdAt: Date;
  updatedAt: Date;
  adminIds: string[];
  modules: ModuleKey[];
  maxUsers?: number;
  maxEquipment?: number;
  timezone: string;
  country: string;
  status: MakerspaceStatus;
  description?: string;
  contactEmail?: string;
  phone?: string;
  website?: string;
}

export interface MakerspaceAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  assignedAt: Date;
}

export interface MakerspaceStats {
  makerspaceId: string;
  totalUsers: number;
  activeUsers: number;
  totalEquipment: number;
  activeReservations: number;
  inventoryValue: number;
  monthlyUsageHours: number;
  monthlyRevenue: number;
  projectCount: number;
  completedProjects: number;
}

export interface MakerspaceModule {
  key: ModuleKey;
  name: string;
  description: string;
  enabled: boolean;
  requiredByDefault: boolean;
}

export interface CreateMakerspaceRequest {
  name: string;
  slug: string;
  location: string;
  address: string;
  subdomain?: string;
  adminIds: string[];
  modules: ModuleKey[];
  maxUsers?: number;
  maxEquipment?: number;
  timezone: string;
  country: string;
  description?: string;
  contactEmail?: string;
  phone?: string;
  website?: string;
}

export interface UpdateMakerspaceRequest extends Partial<CreateMakerspaceRequest> {
  id: string;
}

export interface MakerspaceListFilter {
  status?: MakerspaceStatus;
  country?: string;
  adminId?: string;
  hasModule?: ModuleKey;
  search?: string;
}

export interface AssignAdminRequest {
  makerspaceId: string;
  adminId: string;
  replace?: boolean; // If true, replace existing admins
}

export interface ToggleModuleRequest {
  makerspaceId: string;
  moduleKey: ModuleKey;
  enabled: boolean;
}

export interface MakerspaceAnalytics {
  makerspaceId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: {
    userGrowth: Array<{ date: string; count: number }>;
    equipmentUsage: Array<{ date: string; hours: number }>;
    projectActivity: Array<{ date: string; created: number; completed: number }>;
    revenue: Array<{ date: string; amount: number }>;
  };
  summary: MakerspaceStats;
}
