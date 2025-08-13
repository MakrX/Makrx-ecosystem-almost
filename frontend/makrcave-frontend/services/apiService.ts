// Comprehensive API Service for MakrCave Frontend
// Connects to FastAPI backend with proper JWT authentication

import loggingService from './loggingService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Equipment Interfaces
export interface Equipment {
  id: string;
  name: string;
  type: 'printer_3d' | 'laser_cutter' | 'cnc_machine' | 'workstation' | 'tool';
  status: 'available' | 'in_use' | 'under_maintenance' | 'offline';
  location?: string;
  last_maintenance?: string;
  makerspace_id: string;
  description?: string;
  specifications?: Record<string, any>;
  required_certifications?: string[];
  hourly_rate?: number;
  total_hours?: number;
  success_rate?: number;
  monthly_hours?: number;
  maintenance_interval?: number;
  next_maintenance?: string;
  access_method?: 'nfc' | 'manual' | 'badge';
  operator_required?: boolean;
}

// Reservation Interfaces
export interface Reservation {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  user_id: string;
  user_name?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  purpose?: string;
  notes?: string;
  linked_project_id?: string;
  linked_job_id?: string;
  attached_files?: string[];
  created_at: string;
  updated_at: string;
  checked_in_at?: string;
  checked_out_at?: string;
  approval_notes?: string;
  approved_by?: string;
  is_billed?: boolean;
  billed_amount?: number;
  duration_charged_minutes?: number;
  linked_payment_id?: string;
}

// Project Interfaces
export interface Project {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_name?: string;
  visibility: 'public' | 'private' | 'team-only';
  status: 'draft' | 'in-progress' | 'complete' | 'on-hold' | 'cancelled';
  start_date?: string;
  end_date?: string;
  tags: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  collaborator_count: number;
  bom_items_count: number;
  files_count: number;
  milestones_count: number;
  completed_milestones_count: number;
  github_repo_url?: string;
  github_branch?: string;
  enable_github_integration?: boolean;
  makerspace_id?: string;
  initial_milestones?: ProjectMilestone[];
  initial_collaborators?: ProjectCollaborator[];
}

export interface ProjectMilestone {
  id?: string;
  title: string;
  description?: string;
  target_date?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  completed?: boolean;
}

export interface ProjectCollaborator {
  user_id: string;
  email?: string;
  role: 'viewer' | 'editor' | 'owner';
  added_at?: string;
}

// Inventory Interfaces
export interface InventoryItem {
  id: string;
  name: string;
  category: 'filament' | 'resin' | 'tools' | 'electronics' | 'materials' | 'consumables' | 'machines' | 'sensors' | 'components';
  subcategory?: string;
  quantity: number;
  unit: string;
  min_threshold: number;
  location: string;
  status: 'active' | 'in_use' | 'damaged' | 'reserved' | 'discontinued';
  supplier_type: 'makrx' | 'external';
  product_code?: string;
  linked_makerspace_id: string;
  image_url?: string;
  notes?: string;
  owner_user_id?: string;
  restricted_access_level?: 'basic' | 'certified' | 'admin_only';
  price?: number;
  supplier?: string;
  last_restocked?: string;
  sku?: string;
  description?: string;
  is_scanned?: boolean;
  created_at: string;
  updated_at: string;
}

// User Interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: 'super_admin' | 'admin' | 'makerspace_admin' | 'service_provider' | 'maker';
  assigned_makerspaces?: string[];
  membership_tier?: string;
  subscription_status?: 'active' | 'inactive' | 'expired';
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

// Makerspace Interfaces
export interface Makerspace {
  id: string;
  name: string;
  description?: string;
  location?: string;
  manager_id?: string;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  settings?: MakerspaceSettings;
}

export interface MakerspaceSettings {
  id: string;
  makerspace_id: string;
  pricing_config?: Record<string, any>;
  branding_config?: Record<string, any>;
  notification_settings?: Record<string, any>;
  operating_hours?: Record<string, any>;
  updated_at: string;
}

// Skill/Certification Interfaces
export interface Skill {
  id: string;
  name: string;
  description?: string;
  equipment_type?: string;
  required_for_equipment?: string[];
  certification_required: boolean;
  training_module_id?: string;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  skill_name?: string;
  certified: boolean;
  certification_date?: string;
  expires_at?: string;
  certified_by?: string;
  notes?: string;
}

// Maintenance Interfaces
export interface MaintenanceReport {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  reported_by: string;
  reporter_name?: string;
  issue_type: 'mechanical' | 'electrical' | 'software' | 'consumables' | 'safety' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'reported' | 'in_progress' | 'resolved' | 'deferred';
  reported_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  estimated_downtime?: number;
  actual_downtime?: number;
}

// Helper function for API calls with proper JWT
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const startTime = Date.now();
  const method = options.method || 'GET';

  loggingService.debug('api', 'ApiService.apiCall', `Starting ${method} ${endpoint}`, {
    endpoint,
    method,
    hasBody: !!options.body
  });

  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');

    loggingService.debug('api', 'ApiService.apiCall', 'Making API call with authentication', {
      endpoint,
      method,
      hasToken: !!token,
      apiBaseUrl: API_BASE_URL
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    const responseTime = Date.now() - startTime;
    loggingService.logAPICall(endpoint, method, response.status, responseTime);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;

      loggingService.error('api', 'ApiService.apiCall', 'API call failed', {
        endpoint,
        method,
        statusCode: response.status,
        errorMessage,
        responseTime,
        errorDetails: errorData
      });

      throw new Error(errorMessage);
    }

    const data = await response.json();

    loggingService.info('api', 'ApiService.apiCall', 'API call successful', {
      endpoint,
      method,
      responseTime,
      hasData: !!data,
      dataSize: JSON.stringify(data).length
    });

    return { data };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    loggingService.error('api', 'ApiService.apiCall', 'API call error', {
      endpoint,
      method,
      error: (error as Error).message,
      responseTime
    }, (error as Error).stack);

    console.error('API call failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

// 1. Users & Memberships API
export const usersApi = {
  // Get all users in makerspace
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    return apiCall<User[]>('/users/');
  },

  // Get current user details
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiCall<User>('/users/me');
  },

  // Assign user to makerspace
  assignUser: async (userId: string, makerspaceId: string): Promise<ApiResponse<User>> => {
    return apiCall<User>('/users/assign', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, makerspace_id: makerspaceId }),
    });
  },

  // Update user role or membership
  updateUser: async (userId: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiCall<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Remove user from system
  deleteUser: async (userId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// 2. Inventory Management API
export const inventoryApi = {
  // Get all inventory items
  getItems: async (): Promise<ApiResponse<InventoryItem[]>> => {
    return apiCall<InventoryItem[]>('/inventory/');
  },

  // Get single inventory item
  getItem: async (itemId: string): Promise<ApiResponse<InventoryItem>> => {
    return apiCall<InventoryItem>(`/inventory/${itemId}`);
  },

  // Add new inventory item
  createItem: async (data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<InventoryItem>> => {
    return apiCall<InventoryItem>('/inventory/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update inventory item
  updateItem: async (itemId: string, data: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> => {
    return apiCall<InventoryItem>(`/inventory/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete inventory item
  deleteItem: async (itemId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/inventory/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Reorder from MakrX Store
  reorderItem: async (itemId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/inventory/reorder/${itemId}`, {
      method: 'POST',
    });
  },
};

// 3. Equipment Management API
export const equipmentApi = {
  // Get all equipment
  getEquipment: async (): Promise<ApiResponse<Equipment[]>> => {
    return apiCall<Equipment[]>('/equipment/');
  },

  // Get equipment details
  getEquipmentById: async (equipmentId: string): Promise<ApiResponse<Equipment>> => {
    return apiCall<Equipment>(`/equipment/${equipmentId}`);
  },

  // Add new equipment
  createEquipment: async (data: Omit<Equipment, 'id'>): Promise<ApiResponse<Equipment>> => {
    return apiCall<Equipment>('/equipment/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update equipment
  updateEquipment: async (equipmentId: string, data: Partial<Equipment>): Promise<ApiResponse<Equipment>> => {
    return apiCall<Equipment>(`/equipment/${equipmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete equipment
  deleteEquipment: async (equipmentId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/equipment/${equipmentId}`, {
      method: 'DELETE',
    });
  },
};

// 4. Equipment Reservation API
export const reservationsApi = {
  // Get all reservations (admin)
  getAllReservations: async (): Promise<ApiResponse<Reservation[]>> => {
    return apiCall<Reservation[]>('/reservations/');
  },

  // Get user's reservations
  getMyReservations: async (): Promise<ApiResponse<Reservation[]>> => {
    return apiCall<Reservation[]>('/reservations/my');
  },

  // Create new reservation
  createReservation: async (data: {
    equipment_id: string;
    start_time: string;
    end_time: string;
    purpose?: string;
    notes?: string;
    linked_project_id?: string;
  }): Promise<ApiResponse<Reservation>> => {
    return apiCall<Reservation>('/reservations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update reservation
  updateReservation: async (reservationId: string, data: Partial<Reservation>): Promise<ApiResponse<Reservation>> => {
    return apiCall<Reservation>(`/reservations/${reservationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Check in to reservation
  checkIn: async (reservationId: string): Promise<ApiResponse<Reservation>> => {
    return apiCall<Reservation>(`/reservations/${reservationId}/check-in`, {
      method: 'POST',
    });
  },

  // Check out from reservation
  checkOut: async (reservationId: string, data?: {
    notes?: string;
    consumables_used?: Array<{ name: string; quantity: number; unit: string }>;
  }): Promise<ApiResponse<Reservation>> => {
    return apiCall<Reservation>(`/reservations/${reservationId}/check-out`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  // Cancel reservation
  cancelReservation: async (reservationId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  },
};

// 5. Project Management API
export const projectsApi = {
  // Get all accessible projects
  getProjects: async (params?: {
    skip?: number;
    limit?: number;
    sort_field?: string;
    sort_direction?: string;
    search?: string;
    status_filter?: string;
    visibility_filter?: string;
  }): Promise<ApiResponse<Project[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    return apiCall<Project[]>(`/projects/?${queryParams}`);
  },

  // Create new project
  createProject: async (data: {
    project_id: string;
    name: string;
    description?: string;
    project_type: string;
    visibility: string;
    start_date?: string;
    end_date?: string;
    tags: string[];
    makerspace_id?: string;
    initial_milestones?: ProjectMilestone[];
    initial_collaborators?: ProjectCollaborator[];
    github_repo_url?: string;
    github_branch?: string;
    enable_github_integration?: boolean;
  }): Promise<ApiResponse<Project>> => {
    return apiCall<Project>('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get project details
  getProject: async (projectId: string): Promise<ApiResponse<Project>> => {
    return apiCall<Project>(`/projects/${projectId}`);
  },

  // Update project
  updateProject: async (projectId: string, data: Partial<Project>): Promise<ApiResponse<Project>> => {
    return apiCall<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete project
  deleteProject: async (projectId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  // Add project member
  addMember: async (projectId: string, userId: string, role: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/projects/${projectId}/add-user`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role }),
    });
  },

  // Remove project member
  removeMember: async (projectId: string, userId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/projects/${projectId}/remove-user`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },
};

// 6. Makerspace Settings API
export const makerspaceApi = {
  // Get makerspace settings
  getSettings: async (): Promise<ApiResponse<MakerspaceSettings>> => {
    return apiCall<MakerspaceSettings>('/makerspace/settings');
  },

  // Update makerspace settings
  updateSettings: async (data: Partial<MakerspaceSettings>): Promise<ApiResponse<MakerspaceSettings>> => {
    return apiCall<MakerspaceSettings>('/makerspace/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get subscription options
  getSubscriptionOptions: async (): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>('/makerspace/subscription-options');
  },

  // Set user subscription
  setUserSubscription: async (userId: string, subscriptionId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>('/makerspace/set-subscription', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, subscription_id: subscriptionId }),
    });
  },

  // Super Admin: Get all makerspaces
  getAllMakerspaces: async (): Promise<ApiResponse<Makerspace[]>> => {
    return apiCall<Makerspace[]>('/makerspaces/');
  },

  // Super Admin: Create makerspace
  createMakerspace: async (data: Omit<Makerspace, 'id' | 'created_at'>): Promise<ApiResponse<Makerspace>> => {
    return apiCall<Makerspace>('/makerspaces/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Super Admin: Get makerspace details
  getMakerspace: async (makerspaceId: string): Promise<ApiResponse<Makerspace>> => {
    return apiCall<Makerspace>(`/makerspaces/${makerspaceId}`);
  },

  // Super Admin: Update makerspace
  updateMakerspace: async (makerspaceId: string, data: Partial<Makerspace>): Promise<ApiResponse<Makerspace>> => {
    return apiCall<Makerspace>(`/makerspaces/${makerspaceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Super Admin: Delete makerspace
  deleteMakerspace: async (makerspaceId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/makerspaces/${makerspaceId}`, {
      method: 'DELETE',
    });
  },
};

// 7. Skills & Certifications API
export const skillsApi = {
  // Get all skills
  getSkills: async (): Promise<ApiResponse<Skill[]>> => {
    return apiCall<Skill[]>('/skills/');
  },

  // Request equipment access
  requestAccess: async (equipmentId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/skills/request/${equipmentId}`, {
      method: 'POST',
    });
  },

  // Approve skill access (admin)
  approveAccess: async (userId: string, skillId: string): Promise<ApiResponse<UserSkill>> => {
    return apiCall<UserSkill>(`/skills/approve/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ skill_id: skillId }),
    });
  },

  // Get user certifications
  getUserSkills: async (userId: string): Promise<ApiResponse<UserSkill[]>> => {
    return apiCall<UserSkill[]>(`/skills/${userId}`);
  },
};

// 8. Maintenance & Audit API
export const maintenanceApi = {
  // Report machine issue
  reportIssue: async (data: {
    equipment_id: string;
    issue_type: string;
    severity: string;
    description: string;
  }): Promise<ApiResponse<MaintenanceReport>> => {
    return apiCall<MaintenanceReport>('/maintenance/report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all maintenance reports
  getReports: async (): Promise<ApiResponse<MaintenanceReport[]>> => {
    return apiCall<MaintenanceReport[]>('/maintenance/');
  },

  // Resolve maintenance issue
  resolveIssue: async (reportId: string, notes?: string): Promise<ApiResponse<MaintenanceReport>> => {
    return apiCall<MaintenanceReport>(`/maintenance/${reportId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution_notes: notes }),
    });
  },

  // Get audit logs (super admin)
  getAuditLogs: async (): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>('/audit/');
  },
};

// 9. Analytics API
export const analyticsApi = {
  // Get overview analytics
  getOverview: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>('/analytics/overview');
  },

  // Get inventory analytics
  getInventoryAnalytics: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>('/analytics/inventory');
  },

  // Get reservation analytics
  getReservationAnalytics: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>('/analytics/reservations');
  },

  // Get billing analytics
  getBillingAnalytics: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>('/analytics/billing');
  },

  // Get user analytics
  getUserAnalytics: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>('/analytics/users');
  },
};

// Export combined API
export const api = {
  users: usersApi,
  inventory: inventoryApi,
  equipment: equipmentApi,
  reservations: reservationsApi,
  projects: projectsApi,
  makerspace: makerspaceApi,
  skills: skillsApi,
  maintenance: maintenanceApi,
  analytics: analyticsApi,
};

export default api;
