import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock Users Database
const mockUsers = {
  'superadmin@makrcave.com': {
    id: 'user-super-admin',
    email: 'superadmin@makrcave.com',
    username: 'superadmin',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    assignedMakerspaces: ['ms-1', 'ms-2', 'ms-3']
  },
  'admin@makrcave.com': {
    id: 'user-admin',
    email: 'admin@makrcave.com',
    username: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    assignedMakerspaces: ['ms-1', 'ms-2']
  },
  'manager@makrcave.com': {
    id: 'user-manager',
    email: 'manager@makrcave.com',
    username: 'manager',
    firstName: 'Makerspace',
    lastName: 'Manager',
    role: 'makerspace_admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    assignedMakerspaces: ['ms-1']
  },
  'provider@makrcave.com': {
    id: 'user-provider',
    email: 'provider@makrcave.com',
    username: 'provider',
    firstName: 'Service',
    lastName: 'Provider',
    role: 'service_provider',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    assignedMakerspaces: []
  },
  'maker@makrcave.com': {
    id: 'user-maker',
    email: 'maker@makrcave.com',
    username: 'maker',
    firstName: 'Regular',
    lastName: 'Maker',
    role: 'maker',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    assignedMakerspaces: ['ms-1']
  }
};

// Mock passwords (for testing only)
const mockPasswords = {
  'superadmin@makrcave.com': 'SuperAdmin2024!',
  'admin@makrcave.com': 'Admin2024!',
  'manager@makrcave.com': 'Manager2024!',
  'provider@makrcave.com': 'Provider2024!',
  'maker@makrcave.com': 'Maker2024!'
};

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Mock API: Login attempt for:', username);

  // Check if user exists
  const user = mockUsers[username];
  if (!user) {
    return res.status(401).json({
      detail: 'Invalid credentials'
    });
  }

  // Check password
  if (mockPasswords[username] !== password) {
    return res.status(401).json({
      detail: 'Invalid credentials'
    });
  }

  // Generate mock tokens
  const accessToken = `mock-access-token-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${Date.now()}`;

  res.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'bearer',
    expires_in: 1800,
    user: user
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, username, password, firstName, lastName } = req.body;

  // Check if user already exists
  if (mockUsers[email]) {
    return res.status(400).json({
      detail: 'User already exists'
    });
  }

  // Create new user
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    username,
    firstName: firstName || '',
    lastName: lastName || '',
    role: 'maker', // Default role
    isActive: true,
    createdAt: new Date().toISOString(),
    assignedMakerspaces: []
  };

  // Store user and password
  mockUsers[email] = newUser;
  mockPasswords[email] = password;

  // Generate mock tokens
  const accessToken = `mock-access-token-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${Date.now()}`;

  res.status(201).json({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'bearer',
    expires_in: 1800,
    user: newUser
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token || !refresh_token.startsWith('mock-refresh-token')) {
    return res.status(401).json({
      detail: 'Invalid refresh token'
    });
  }

  // Generate new access token
  const accessToken = `mock-access-token-${Date.now()}`;

  res.json({
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: 1800
  });
});

app.post('/api/auth/password-reset/request', (req, res) => {
  const { email } = req.body;

  // Always return success for demo (in real app, only if user exists)
  res.json({
    message: 'Password reset instructions sent to your email'
  });
});

app.post('/api/auth/password-reset/confirm', (req, res) => {
  const { token, new_password } = req.body;

  // Mock password reset confirmation
  res.json({
    message: 'Password reset successfully'
  });
});

app.get('/api/users/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer mock-access-token')) {
    return res.status(401).json({
      detail: 'Invalid or missing token'
    });
  }

  // Return first user for simplicity (in real app, decode token to get user)
  const firstUser = Object.values(mockUsers)[0];
  res.json(firstUser);
});

// Mock Analytics Data
const mockAnalyticsOverview = {
  total_users: 42,
  active_users_today: 8,
  active_users_week: 25,
  total_projects: 15,
  active_projects: 8,
  total_equipment: 12,
  equipment_in_use: 3,
  total_inventory_items: 180,
  low_stock_items: 5,
  total_revenue: 8450.75,
  revenue_this_month: 1250.25
};

const mockDashboardData = {
  overview: mockAnalyticsOverview,
  sections: [
    {
      section_id: "usage",
      title: "Usage Analytics",
      charts: [
        {
          title: "Weekly Activity",
          data: [
            { label: "Logins", value: 45 },
            { label: "New Members", value: 3 },
            { label: "Projects", value: 8 }
          ],
          chart_type: "bar",
          x_axis_label: "Activity Type",
          y_axis_label: "Count"
        }
      ],
      summary_stats: { logins: 45, new_members: 3, project_creations: 8 },
      last_updated: new Date().toISOString()
    },
    {
      section_id: "inventory",
      title: "Inventory Insights",
      charts: [
        {
          title: "Top Consumed Items",
          data: [
            { label: "PLA Filament", value: 15 },
            { label: "Arduino Boards", value: 8 },
            { label: "Resistors", value: 25 },
            { label: "Wood Sheets", value: 5 },
            { label: "Screws", value: 12 }
          ],
          chart_type: "pie"
        }
      ],
      summary_stats: { efficiency_score: 85.2 },
      last_updated: new Date().toISOString()
    },
    {
      section_id: "revenue",
      title: "Revenue Analytics",
      charts: [
        {
          title: "Revenue by Source",
          data: [
            { label: "Memberships", value: 4500 },
            { label: "Equipment Usage", value: 2200 },
            { label: "Workshops", value: 800 },
            { label: "Materials", value: 950 }
          ],
          chart_type: "pie"
        }
      ],
      summary_stats: { total_revenue: 8450 },
      last_updated: new Date().toISOString()
    }
  ],
  generated_at: new Date().toISOString(),
  cache_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
};

// Analytics endpoints
app.get('/api/v1/analytics/overview', (req, res) => {
  res.json(mockAnalyticsOverview);
});

app.get('/api/v1/analytics/dashboard', (req, res) => {
  res.json(mockDashboardData);
});

app.get('/api/v1/analytics/usage', (req, res) => {
  res.json({
    logins: 45,
    new_members: 3,
    project_creations: 8,
    equipment_reservations: 12,
    inventory_issues: 22,
    total_session_time: 340,
    avg_session_duration: 85,
    peak_hours: [14, 15, 16, 19, 20],
    active_days: 6,
    user_retention_rate: 78.5
  });
});

app.get('/api/v1/analytics/inventory', (req, res) => {
  res.json({
    total_items_tracked: 180,
    total_consumption_value: 2450.75,
    efficiency_score: 85.2,
    waste_percentage: 8.3,
    top_consumed_items: [
      { item_id: "item_001", name: "PLA Filament - Black", total_consumed: 15.5, cost_consumed: 387.50 },
      { item_id: "item_002", name: "Arduino Uno R3", total_consumed: 8, cost_consumed: 180.00 },
      { item_id: "item_003", name: "Resistor Kit", total_consumed: 25, cost_consumed: 125.00 }
    ],
    low_stock_alerts: 5,
    reorder_suggestions: 8,
    cost_savings: 245.30,
    consumption_trend: "increasing"
  });
});

app.get('/api/v1/analytics/equipment', (req, res) => {
  res.json([
    {
      equipment_id: "eq_001",
      name: "3D Printer Pro",
      total_usage_hours: 156.5,
      utilization_rate: 78.2,
      uptime_percentage: 94.5,
      maintenance_events: 2,
      avg_session_duration: 125.5,
      revenue_generated: 780.00,
      user_count: 15,
      status: "operational",
      next_maintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      equipment_id: "eq_002", 
      name: "Laser Cutter X1",
      total_usage_hours: 89.2,
      utilization_rate: 65.8,
      uptime_percentage: 96.2,
      maintenance_events: 1,
      avg_session_duration: 45.5,
      revenue_generated: 1200.00,
      user_count: 12,
      status: "operational",
      next_maintenance: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
});

app.get('/api/v1/analytics/projects', (req, res) => {
  res.json({
    total_projects: 15,
    projects_by_status: {
      planning: 3,
      in_progress: 8,
      completed: 3,
      on_hold: 1
    },
    avg_completion_time: 28.5,
    total_bom_value: 12450.75,
    avg_project_cost: 830.05,
    success_rate: 87.5,
    collaboration_score: 72.8,
    equipment_utilization: 65.2,
    popular_categories: ["Electronics", "3D Printing", "Woodworking"],
    monthly_completions: 5
  });
});

app.get('/api/v1/analytics/revenue', (req, res) => {
  res.json({
    total_revenue: 8450.75,
    revenue_by_source: {
      memberships: 4500.00,
      equipment_usage: 2200.00,
      workshops: 800.00,
      materials: 950.75
    },
    monthly_growth: 12.5,
    avg_revenue_per_user: 201.20,
    recurring_revenue: 4500.00,
    one_time_revenue: 3950.75,
    payment_methods: {
      credit_card: 65,
      bank_transfer: 20,
      cash: 10,
      digital_wallet: 5
    },
    refunds_rate: 2.1,
    outstanding_invoices: 450.00
  });
});

// Maintenance endpoints
app.get('/api/v1/maintenance/logs', (req, res) => {
  const mockLogs = [
    {
      id: 'log-1',
      equipment_id: 'eq-1',
      equipment_name: '3D Printer Pro',
      makerspace_id: 'ms-1',
      type: 'preventive',
      status: 'scheduled',
      priority: 'medium',
      description: 'Monthly preventive maintenance - nozzle cleaning and calibration',
      created_by: 'Sarah Martinez',
      assigned_to: 'Tech Team',
      created_at: '2024-01-15T10:00:00Z',
      scheduled_date: '2024-01-20T14:00:00Z',
      estimated_duration: 120,
      cost: 50
    },
    {
      id: 'log-2',
      equipment_id: 'eq-2',
      equipment_name: 'Laser Cutter X1',
      makerspace_id: 'ms-1',
      type: 'breakdown',
      status: 'in_progress',
      priority: 'high',
      description: 'Laser alignment issue - cutting accuracy problems reported',
      created_by: 'Mike Johnson',
      assigned_to: 'Alex Tech',
      created_at: '2024-01-18T09:30:00Z',
      estimated_duration: 180,
      parts_used: ['Laser mirror', 'Alignment tool'],
      cost: 150
    },
    {
      id: 'log-3',
      equipment_id: 'eq-3',
      equipment_name: 'CNC Mill Pro',
      makerspace_id: 'ms-1',
      type: 'repair',
      status: 'resolved',
      priority: 'medium',
      description: 'Spindle bearing replacement',
      created_by: 'Sarah Martinez',
      assigned_to: 'Tech Team',
      created_at: '2024-01-10T08:00:00Z',
      resolved_at: '2024-01-12T16:30:00Z',
      actual_duration: 240,
      cost: 300,
      parts_used: ['Spindle bearing set', 'Lubricant']
    }
  ];
  res.json(mockLogs);
});

app.get('/api/v1/maintenance/schedules', (req, res) => {
  const mockSchedules = [
    {
      id: 'sched-1',
      equipment_id: 'eq-1',
      equipment_name: '3D Printer Pro',
      interval_type: 'days',
      interval_value: 30,
      last_maintenance_date: '2023-12-20',
      next_due_date: '2024-01-20',
      is_active: true,
      maintenance_type: 'Preventive Cleaning',
      responsible_team: 'Tech Team'
    },
    {
      id: 'sched-2',
      equipment_id: 'eq-2',
      equipment_name: 'Laser Cutter X1',
      interval_type: 'hours',
      interval_value: 100,
      last_maintenance_date: '2024-01-05',
      next_due_date: '2024-02-15',
      is_active: true,
      maintenance_type: 'Lens Cleaning & Calibration',
      responsible_team: 'Laser Specialists'
    }
  ];
  res.json(mockSchedules);
});

app.get('/api/v1/maintenance/equipment-status', (req, res) => {
  const mockStatuses = [
    {
      equipment_id: 'eq-1',
      name: '3D Printer Pro',
      status: 'maintenance_scheduled',
      last_maintenance: '2023-12-20',
      next_maintenance: '2024-01-20'
    },
    {
      equipment_id: 'eq-2',
      name: 'Laser Cutter X1',
      status: 'out_of_service',
      current_issue: 'Laser alignment issue',
      estimated_repair_time: '3 hours',
      last_maintenance: '2024-01-05',
      next_maintenance: '2024-02-15'
    },
    {
      equipment_id: 'eq-3',
      name: 'CNC Mill Pro',
      status: 'available',
      last_maintenance: '2024-01-12',
      next_maintenance: '2024-02-12'
    }
  ];
  res.json(mockStatuses);
});

app.post('/api/v1/maintenance/logs', (req, res) => {
  const newLog = {
    id: `log-${Date.now()}`,
    ...req.body,
    created_at: new Date().toISOString()
  };
  res.status(201).json(newLog);
});

app.post('/api/v1/maintenance/schedules', (req, res) => {
  const newSchedule = {
    id: `sched-${Date.now()}`,
    ...req.body,
    created_at: new Date().toISOString()
  };
  res.status(201).json(newSchedule);
});

// Billing endpoints
app.get('/api/v1/billing/transactions', (req, res) => {
  const mockTransactions = [
    {
      id: 'tx-001',
      type: 'subscription',
      description: 'Professional Plan - Monthly',
      amount: 99,
      status: 'completed',
      date: '2024-01-15',
      invoiceId: 'inv-001'
    },
    {
      id: 'tx-002',
      type: 'credits',
      description: 'Credit Purchase - 100 Credits',
      amount: 50,
      status: 'completed',
      date: '2024-01-12',
      invoiceId: 'inv-002'
    }
  ];
  res.json(mockTransactions);
});

app.get('/api/v1/billing/invoices', (req, res) => {
  const mockInvoices = [
    {
      id: 'inv-001',
      date: '2024-01-15',
      amount: 99,
      status: 'paid',
      description: 'Professional Plan - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'inv-002',
      date: '2024-01-12',
      amount: 50,
      status: 'paid',
      description: 'Credit Purchase',
      downloadUrl: '#'
    }
  ];
  res.json(mockInvoices);
});

app.get('/api/v1/billing/credit-wallet', (req, res) => {
  res.json({
    balance: 250,
    totalSpent: 1850,
    totalPurchased: 2100
  });
});

app.post('/api/v1/billing/credits/purchase', (req, res) => {
  const { amount, credits } = req.body;
  res.json({
    success: true,
    transactionId: `tx-${Date.now()}`,
    amount,
    credits,
    message: 'Credit purchase successful'
  });
});

// Inventory CRUD endpoints
app.get('/api/v1/inventory', (req, res) => {
  const mockInventory = [
    {
      id: 'inv-001',
      name: 'PLA Filament - Red',
      category: 'filament',
      quantity: 10,
      unit: 'kg',
      minThreshold: 2,
      location: 'Storage A1',
      status: 'active',
      supplierType: 'makrx',
      price: 25,
      history: []
    },
    {
      id: 'inv-002',
      name: 'ABS Filament - Black',
      category: 'filament',
      quantity: 5,
      unit: 'kg',
      minThreshold: 1,
      location: 'Storage A2',
      status: 'active',
      supplierType: 'external',
      price: 30,
      history: []
    }
  ];
  res.json(mockInventory);
});

app.post('/api/v1/inventory', (req, res) => {
  const newItem = {
    id: `inv-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    history: []
  };
  res.json(newItem);
});

app.put('/api/v1/inventory/:id', (req, res) => {
  const { id } = req.params;
  const updatedItem = {
    id,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json(updatedItem);
});

app.delete('/api/v1/inventory/:id', (req, res) => {
  const { id } = req.params;
  res.json({ success: true, message: `Item ${id} deleted successfully` });
});

// Equipment management endpoints
app.get('/api/v1/equipment', (req, res) => {
  const mockEquipment = [
    {
      id: 'eq-001',
      name: '3D Printer Pro',
      type: '3d_printer',
      status: 'available',
      location: 'Workshop A',
      lastMaintenance: '2024-01-01',
      nextMaintenance: '2024-02-01'
    },
    {
      id: 'eq-002',
      name: 'Laser Cutter X1',
      type: 'laser_cutter',
      status: 'in_use',
      location: 'Workshop B',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-02-05'
    }
  ];
  res.json(mockEquipment);
});

app.post('/api/v1/equipment', (req, res) => {
  const newEquipment = {
    id: `eq-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  res.json(newEquipment);
});

app.put('/api/v1/equipment/:id', (req, res) => {
  const { id } = req.params;
  const updatedEquipment = {
    id,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json(updatedEquipment);
});

// Mock Makerspaces Data
const mockMakerspaces = [
  {
    id: 'ms-1',
    name: 'Downtown MakrCave',
    slug: 'downtown',
    location: 'San Francisco, CA',
    address: '123 Mission St, San Francisco, CA 94105',
    subdomain: 'downtown.makrcave.com',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-01-10T15:30:00Z',
    adminIds: ['msa-1', 'msa-2'],
    modules: ['inventory', 'projects', 'reservations', 'billing', 'analytics'],
    maxUsers: 100,
    maxEquipment: 25,
    timezone: 'America/Los_Angeles',
    country: 'United States',
    status: 'active',
    description: 'A state-of-the-art makerspace in downtown San Francisco',
    contactEmail: 'info@downtown.makrcave.com',
    phone: '+1-415-555-0123'
  },
  {
    id: 'ms-2',
    name: 'Brooklyn FabLab',
    slug: 'brooklyn',
    location: 'Brooklyn, NY',
    address: '456 Atlantic Ave, Brooklyn, NY 11217',
    subdomain: 'brooklyn.makrcave.com',
    createdAt: '2023-03-20T14:00:00Z',
    updatedAt: '2024-01-05T09:15:00Z',
    adminIds: ['msa-3'],
    modules: ['inventory', 'projects', 'reservations', 'analytics'],
    maxUsers: 75,
    maxEquipment: 20,
    timezone: 'America/New_York',
    country: 'United States',
    status: 'active',
    description: 'Community-focused fabrication laboratory in Brooklyn',
    contactEmail: 'hello@brooklyn.makrcave.com',
    phone: '+1-718-555-0456'
  },
  {
    id: 'ms-3',
    name: 'Austin Maker Hub',
    slug: 'austin',
    location: 'Austin, TX',
    address: '789 Congress Ave, Austin, TX 78701',
    subdomain: 'austin.makrcave.com',
    createdAt: '2023-06-10T16:30:00Z',
    updatedAt: '2023-12-28T11:45:00Z',
    adminIds: ['msa-4'],
    modules: ['inventory', 'projects', 'skill_management'],
    maxUsers: 150,
    maxEquipment: 30,
    timezone: 'America/Chicago',
    country: 'United States',
    status: 'pending',
    description: 'Largest makerspace in central Texas',
    contactEmail: 'contact@austin.makrcave.com',
    phone: '+1-512-555-0789'
  }
];

const mockMakerspaceStats = {
  'ms-1': {
    makerspaceId: 'ms-1',
    totalUsers: 89,
    activeUsers: 34,
    totalEquipment: 18,
    activeReservations: 12,
    inventoryValue: 25680.50,
    monthlyUsageHours: 1250,
    monthlyRevenue: 8950.75,
    projectCount: 67,
    completedProjects: 42
  },
  'ms-2': {
    makerspaceId: 'ms-2',
    totalUsers: 56,
    activeUsers: 23,
    totalEquipment: 14,
    activeReservations: 8,
    inventoryValue: 18420.25,
    monthlyUsageHours: 890,
    monthlyRevenue: 5340.50,
    projectCount: 45,
    completedProjects: 31
  },
  'ms-3': {
    makerspaceId: 'ms-3',
    totalUsers: 124,
    activeUsers: 67,
    totalEquipment: 22,
    activeReservations: 18,
    inventoryValue: 34250.75,
    monthlyUsageHours: 1680,
    monthlyRevenue: 12450.25,
    projectCount: 89,
    completedProjects: 58
  }
};

const mockAdmins = [
  { id: 'msa-1', email: 'sarah.martinez@makrcave.local', firstName: 'Sarah', lastName: 'Martinez', assignedAt: '2023-01-15T10:00:00Z' },
  { id: 'msa-2', email: 'alex.carter@makrx.org', firstName: 'Alex', lastName: 'Carter', assignedAt: '2023-06-01T12:00:00Z' },
  { id: 'msa-3', email: 'mike.johnson@brooklyn.makrcave.com', firstName: 'Mike', lastName: 'Johnson', assignedAt: '2023-03-20T14:00:00Z' },
  { id: 'msa-4', email: 'lisa.wong@austin.makrcave.com', firstName: 'Lisa', lastName: 'Wong', assignedAt: '2023-06-10T16:30:00Z' }
];

// Makerspaces API endpoints
app.get('/api/v1/makerspaces', (req, res) => {
  const { status, country, search } = req.query;

  let filtered = [...mockMakerspaces];

  if (status) {
    filtered = filtered.filter(ms => ms.status === status);
  }

  if (country) {
    filtered = filtered.filter(ms => ms.country === country);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(ms =>
      ms.name.toLowerCase().includes(searchLower) ||
      ms.location.toLowerCase().includes(searchLower) ||
      ms.description?.toLowerCase().includes(searchLower)
    );
  }

  // Add admin details and stats to each makerspace
  const enriched = filtered.map(ms => ({
    ...ms,
    admins: ms.adminIds.map(adminId => mockAdmins.find(admin => admin.id === adminId)).filter(Boolean),
    stats: mockMakerspaceStats[ms.id] || null
  }));

  res.json(enriched);
});

app.get('/api/v1/makerspaces/:id', (req, res) => {
  const { id } = req.params;
  const makerspace = mockMakerspaces.find(ms => ms.id === id);

  if (!makerspace) {
    return res.status(404).json({ detail: 'Makerspace not found' });
  }

  const enriched = {
    ...makerspace,
    admins: makerspace.adminIds.map(adminId => mockAdmins.find(admin => admin.id === adminId)).filter(Boolean),
    stats: mockMakerspaceStats[id] || null
  };

  res.json(enriched);
});

app.post('/api/v1/makerspaces', (req, res) => {
  const newMakerspace = {
    id: `ms-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending'
  };

  mockMakerspaces.push(newMakerspace);
  res.status(201).json(newMakerspace);
});

app.put('/api/v1/makerspaces/:id', (req, res) => {
  const { id } = req.params;
  const index = mockMakerspaces.findIndex(ms => ms.id === id);

  if (index === -1) {
    return res.status(404).json({ detail: 'Makerspace not found' });
  }

  mockMakerspaces[index] = {
    ...mockMakerspaces[index],
    ...req.body,
    id,
    updatedAt: new Date().toISOString()
  };

  res.json(mockMakerspaces[index]);
});

app.delete('/api/v1/makerspaces/:id', (req, res) => {
  const { id } = req.params;
  const index = mockMakerspaces.findIndex(ms => ms.id === id);

  if (index === -1) {
    return res.status(404).json({ detail: 'Makerspace not found' });
  }

  mockMakerspaces.splice(index, 1);
  res.status(204).send();
});

app.patch('/api/v1/makerspaces/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = mockMakerspaces.findIndex(ms => ms.id === id);

  if (index === -1) {
    return res.status(404).json({ detail: 'Makerspace not found' });
  }

  mockMakerspaces[index].status = status;
  mockMakerspaces[index].updatedAt = new Date().toISOString();

  res.json(mockMakerspaces[index]);
});

app.post('/api/v1/makerspaces/:id/assign-admin', (req, res) => {
  const { id } = req.params;
  const { adminId, replace = false } = req.body;
  const index = mockMakerspaces.findIndex(ms => ms.id === id);

  if (index === -1) {
    return res.status(404).json({ detail: 'Makerspace not found' });
  }

  if (replace) {
    mockMakerspaces[index].adminIds = [adminId];
  } else {
    if (!mockMakerspaces[index].adminIds.includes(adminId)) {
      mockMakerspaces[index].adminIds.push(adminId);
    }
  }

  mockMakerspaces[index].updatedAt = new Date().toISOString();
  res.json(mockMakerspaces[index]);
});

app.patch('/api/v1/makerspaces/:id/toggle-module', (req, res) => {
  const { id } = req.params;
  const { moduleKey, enabled } = req.body;
  const index = mockMakerspaces.findIndex(ms => ms.id === id);

  if (index === -1) {
    return res.status(404).json({ detail: 'Makerspace not found' });
  }

  if (enabled && !mockMakerspaces[index].modules.includes(moduleKey)) {
    mockMakerspaces[index].modules.push(moduleKey);
  } else if (!enabled) {
    mockMakerspaces[index].modules = mockMakerspaces[index].modules.filter(m => m !== moduleKey);
  }

  mockMakerspaces[index].updatedAt = new Date().toISOString();
  res.json(mockMakerspaces[index]);
});

app.get('/api/v1/makerspaces/:id/analytics', (req, res) => {
  const { id } = req.params;
  const { period = 'weekly' } = req.query;

  const stats = mockMakerspaceStats[id];
  if (!stats) {
    return res.status(404).json({ detail: 'Makerspace analytics not found' });
  }

  // Generate mock analytics data
  const mockAnalytics = {
    makerspaceId: id,
    period,
    data: {
      userGrowth: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) + 5
      })),
      equipmentUsage: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hours: Math.floor(Math.random() * 50) + 20
      })),
      projectActivity: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created: Math.floor(Math.random() * 5),
        completed: Math.floor(Math.random() * 3)
      })),
      revenue: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 500) + 200
      }))
    },
    summary: stats
  };

  res.json(mockAnalytics);
});

app.get('/api/v1/admin/users', (req, res) => {
  // Return mock admin users for assignment
  res.json(mockAdmins);
});

// Equipment Stats API
app.get('/api/v1/equipment/stats', (req, res) => {
  const mockStats = {
    total_equipment: 12,
    available_equipment: 8,
    in_use_equipment: 2,
    maintenance_equipment: 1,
    offline_equipment: 1,
    total_reservations_today: 5,
    utilization_rate: 75.5,
    average_rating: 4.2,
    categories: {
      '3D Printer': 4,
      'Laser Cutter': 2,
      'CNC Machine': 3,
      'Electronics': 3
    },
    locations: {
      'Workshop A': 6,
      'Workshop B': 4,
      'Electronics Lab': 2
    }
  };
  res.json(mockStats);
});

// Equipment Reservations API
app.get('/api/v1/equipment/reservations', (req, res) => {
  const { start_date, end_date, equipment_id } = req.query;

  const mockReservations = [
    {
      id: 'res-1',
      equipment_id: 'eq-1',
      user_id: 'user-1',
      user_name: 'John Smith',
      start_time: '2024-01-22T10:00:00Z',
      end_time: '2024-01-22T12:00:00Z',
      duration_hours: 2,
      status: 'approved',
      purpose: '3D Printing prototype parts',
      project_name: 'Robot Chassis'
    },
    {
      id: 'res-2',
      equipment_id: 'eq-2',
      user_id: 'user-2',
      user_name: 'Emily Davis',
      start_time: '2024-01-22T14:00:00Z',
      end_time: '2024-01-22T16:00:00Z',
      duration_hours: 2,
      status: 'pending',
      purpose: 'Laser cutting acrylic sheets',
      project_name: 'Display Case'
    }
  ];

  let filtered = mockReservations;
  if (equipment_id) {
    filtered = filtered.filter(r => r.equipment_id === equipment_id);
  }

  res.json(filtered);
});

// Equipment Skills Requirements API
app.get('/api/v1/equipment/skill-requirements', (req, res) => {
  const mockSkillRequirements = [
    {
      equipment_id: 'eq-1',
      equipment_name: 'Prusa i3 MK3S #1',
      required_skills: [
        {
          skill_id: 'skill-1',
          skill_name: '3D Printer Operation',
          skill_level: 'beginner',
          required_level: 'beginner',
          category: 'Digital Fabrication',
          is_required: true
        }
      ]
    },
    {
      equipment_id: 'eq-2',
      equipment_name: 'Epilog Helix Laser Cutter',
      required_skills: [
        {
          skill_id: 'skill-2',
          skill_name: 'Laser Cutter Safety',
          skill_level: 'beginner',
          required_level: 'beginner',
          category: 'Laser Cutting',
          is_required: true
        },
        {
          skill_id: 'skill-5',
          skill_name: 'Material Handling',
          skill_level: 'beginner',
          required_level: 'beginner',
          category: 'Safety',
          is_required: true
        }
      ]
    },
    {
      equipment_id: 'eq-3',
      equipment_name: 'Tormach CNC Mill',
      required_skills: [
        {
          skill_id: 'skill-3',
          skill_name: 'CNC Operation',
          skill_level: 'advanced',
          required_level: 'intermediate',
          category: 'Machining',
          is_required: true
        },
        {
          skill_id: 'skill-6',
          skill_name: 'G-Code Programming',
          skill_level: 'intermediate',
          required_level: 'beginner',
          category: 'Programming',
          is_required: false
        }
      ]
    },
    {
      equipment_id: 'eq-4',
      equipment_name: 'Ultimaker S3',
      required_skills: [
        {
          skill_id: 'skill-1',
          skill_name: '3D Printer Operation',
          skill_level: 'beginner',
          required_level: 'beginner',
          category: 'Digital Fabrication',
          is_required: true
        },
        {
          skill_id: 'skill-7',
          skill_name: 'Advanced 3D Printing',
          skill_level: 'intermediate',
          required_level: 'intermediate',
          category: 'Digital Fabrication',
          is_required: false
        }
      ]
    }
  ];

  res.json(mockSkillRequirements);
});

// Project Management Endpoints
const mockProjects = [
  {
    project_id: 'proj-001',
    name: 'Smart Home Automation Hub',
    description: 'Building a centralized IoT hub for home automation using Arduino and Raspberry Pi',
    project_type: 'open-collab',
    owner_id: 'user-001',
    makerspace_id: 'ms-001',
    visibility: 'public',
    status: 'in-progress',
    start_date: '2024-01-15T00:00:00Z',
    end_date: '2024-03-15T00:00:00Z',
    tags: ['IoT', 'Arduino', 'Raspberry Pi', 'Home Automation'],
    is_featured: true,
    is_approved: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
    github_repo_url: 'https://github.com/user/smart-home-hub',
    github_repo_name: 'user/smart-home-hub',
    github_integration_enabled: true,
    github_default_branch: 'main',
    collaborators: [
      {
        id: 1,
        user_id: 'user-001',
        role: 'owner',
        invited_by: 'user-001',
        invited_at: '2024-01-15T10:00:00Z',
        accepted_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        user_id: 'user-002',
        role: 'editor',
        invited_by: 'user-001',
        invited_at: '2024-01-16T14:00:00Z',
        accepted_at: '2024-01-16T16:30:00Z'
      }
    ],
    bom_items: [
      {
        id: 1,
        item_type: 'inventory',
        item_id: 'inv-arduino-uno',
        item_name: 'Arduino Uno R3',
        part_code: 'ARD-UNO-R3',
        quantity: 2,
        unit_cost: 25.00,
        total_cost: 50.00,
        usage_notes: 'Main microcontroller for sensor nodes',
        alternatives: [
          {
            item_id: 'inv-arduino-nano',
            item_name: 'Arduino Nano',
            part_code: 'ARD-NANO',
            unit_cost: 15.00,
            availability_status: 'in-stock',
            compatibility_notes: 'Smaller form factor, same functionality'
          }
        ],
        is_critical: true,
        procurement_status: 'received',
        availability_status: 'in-stock',
        stock_level: 15,
        reorder_point: 5,
        added_by: 'user-001',
        added_at: '2024-01-15T12:00:00Z'
      },
      {
        id: 2,
        item_type: 'inventory',
        item_id: 'inv-rpi-4',
        item_name: 'Raspberry Pi 4 Model B',
        part_code: 'RPI-4B-4GB',
        quantity: 1,
        unit_cost: 75.00,
        total_cost: 75.00,
        usage_notes: 'Central hub processor',
        alternatives: [
          {
            item_id: 'inv-rpi-zero',
            item_name: 'Raspberry Pi Zero 2 W',
            part_code: 'RPI-ZERO-2W',
            unit_cost: 15.00,
            availability_status: 'low-stock',
            compatibility_notes: 'Lower performance but sufficient for basic tasks'
          }
        ],
        is_critical: true,
        procurement_status: 'received',
        availability_status: 'low-stock',
        stock_level: 2,
        reorder_point: 3,
        added_by: 'user-001',
        added_at: '2024-01-15T12:00:00Z'
      },
      {
        id: 3,
        item_type: 'external',
        item_id: 'ext-sensors',
        item_name: 'Temperature/Humidity Sensors',
        part_code: 'DHT22-SENSOR',
        quantity: 5,
        unit_cost: 8.00,
        total_cost: 40.00,
        usage_notes: 'DHT22 sensors for environmental monitoring',
        alternatives: [
          {
            item_id: 'ext-dht11',
            item_name: 'DHT11 Temperature/Humidity Sensor',
            part_code: 'DHT11-SENSOR',
            unit_cost: 3.00,
            availability_status: 'in-stock',
            compatibility_notes: 'Lower accuracy but adequate for basic monitoring'
          },
          {
            item_id: 'ext-sht30',
            item_name: 'SHT30 Digital Sensor',
            part_code: 'SHT30-SENSOR',
            unit_cost: 12.00,
            availability_status: 'in-stock',
            compatibility_notes: 'Higher accuracy, I2C interface'
          }
        ],
        is_critical: false,
        procurement_status: 'ordered',
        availability_status: 'out-of-stock',
        stock_level: 0,
        reorder_point: 10,
        added_by: 'user-002',
        added_at: '2024-01-16T10:00:00Z'
      }
    ],
    equipment_reservations: [
      {
        id: 1,
        equipment_id: 'eq-001',
        reservation_id: 'res-001',
        requested_start: '2024-01-22T10:00:00Z',
        requested_end: '2024-01-22T14:00:00Z',
        actual_start: '2024-01-22T10:15:00Z',
        actual_end: '2024-01-22T13:45:00Z',
        status: 'completed',
        usage_notes: '3D printed enclosure components',
        requested_by: 'user-001',
        requested_at: '2024-01-20T09:00:00Z'
      },
      {
        id: 2,
        equipment_id: 'eq-002',
        reservation_id: 'res-002',
        requested_start: '2024-01-25T14:00:00Z',
        requested_end: '2024-01-25T16:00:00Z',
        status: 'confirmed',
        usage_notes: 'Laser cut acrylic panels for display',
        requested_by: 'user-002',
        requested_at: '2024-01-22T11:00:00Z'
      }
    ],
    files: [
      {
        id: 1,
        filename: 'circuit-diagram-v2.pdf',
        original_filename: 'Smart_Home_Circuit_Diagram_v2.pdf',
        file_type: 'document',
        file_size: 1024000,
        file_url: '/files/proj-001/circuit-diagram-v2.pdf',
        description: 'Updated circuit diagram with all sensor connections',
        is_public: false,
        version: '2.0',
        uploaded_by: 'user-001',
        uploaded_at: '2024-01-18T16:00:00Z'
      },
      {
        id: 2,
        filename: 'enclosure-3d-model.stl',
        original_filename: 'Hub_Enclosure_Final.stl',
        file_type: '3d_model',
        file_size: 2048000,
        file_url: '/files/proj-001/enclosure-3d-model.stl',
        description: '3D printable enclosure for the main hub',
        is_public: true,
        version: '1.0',
        uploaded_by: 'user-002',
        uploaded_at: '2024-01-19T14:30:00Z'
      }
    ],
    milestones: [
      {
        id: 1,
        title: 'Hardware Setup Complete',
        description: 'All hardware components assembled and tested',
        target_date: '2024-02-01T00:00:00Z',
        completion_date: '2024-01-28T18:00:00Z',
        is_completed: true,
        priority: 'high',
        order_index: 1,
        created_by: 'user-001',
        created_at: '2024-01-15T10:00:00Z',
        completed_by: 'user-001'
      },
      {
        id: 2,
        title: 'Software Development',
        description: 'Core software functionality implemented',
        target_date: '2024-02-15T00:00:00Z',
        is_completed: false,
        priority: 'high',
        order_index: 2,
        created_by: 'user-001',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 3,
        title: 'Testing & Deployment',
        description: 'Complete system testing and deployment',
        target_date: '2024-03-01T00:00:00Z',
        is_completed: false,
        priority: 'medium',
        order_index: 3,
        created_by: 'user-001',
        created_at: '2024-01-15T10:00:00Z'
      }
    ],
    activity_logs: [
      {
        id: 1,
        activity_type: 'project_created',
        title: 'Project Created',
        description: 'Smart Home Automation Hub project was created',
        metadata: { initial_status: 'draft' },
        user_id: 'user-001',
        user_name: 'John Maker',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        activity_type: 'member_added',
        title: 'Team Member Added',
        description: 'Jane Smith was added as an editor',
        metadata: { member_role: 'editor', member_id: 'user-002' },
        user_id: 'user-001',
        user_name: 'John Maker',
        created_at: '2024-01-16T14:00:00Z'
      },
      {
        id: 3,
        activity_type: 'bom_item_added',
        title: 'BOM Item Added',
        description: 'Arduino Uno R3 added to project BOM',
        metadata: { item_name: 'Arduino Uno R3', quantity: 2 },
        user_id: 'user-001',
        user_name: 'John Maker',
        created_at: '2024-01-15T12:00:00Z'
      },
      {
        id: 4,
        activity_type: 'milestone_completed',
        title: 'Milestone Completed',
        description: 'Hardware Setup Complete milestone was finished',
        metadata: { milestone_title: 'Hardware Setup Complete' },
        user_id: 'user-001',
        user_name: 'John Maker',
        created_at: '2024-01-28T18:00:00Z'
      },
      {
        id: 5,
        activity_type: 'file_uploaded',
        title: 'File Uploaded',
        description: '3D model for enclosure uploaded',
        metadata: { filename: 'enclosure-3d-model.stl', file_type: '3d_model' },
        user_id: 'user-002',
        user_name: 'Jane Smith',
        created_at: '2024-01-19T14:30:00Z'
      }
    ]
  },
  {
    project_id: 'proj-002',
    name: 'Sustainable Garden Monitor',
    description: 'IoT-based monitoring system for tracking soil moisture, light levels, and plant health',
    project_type: 'sponsored',
    owner_id: 'user-003',
    makerspace_id: 'ms-001',
    visibility: 'team-only',
    status: 'draft',
    start_date: '2024-02-01T00:00:00Z',
    end_date: '2024-04-01T00:00:00Z',
    tags: ['IoT', 'Sustainability', 'Agriculture', 'Sensors'],
    is_featured: false,
    is_approved: true,
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-01T09:00:00Z',
    github_integration_enabled: false,
    github_default_branch: 'main',
    collaborators: [
      {
        id: 3,
        user_id: 'user-003',
        role: 'owner',
        invited_by: 'user-003',
        invited_at: '2024-02-01T09:00:00Z',
        accepted_at: '2024-02-01T09:00:00Z'
      }
    ],
    bom_items: [],
    equipment_reservations: [],
    files: [],
    milestones: [
      {
        id: 4,
        title: 'Requirements Gathering',
        description: 'Define project requirements and specifications',
        target_date: '2024-02-07T00:00:00Z',
        is_completed: false,
        priority: 'high',
        order_index: 1,
        created_by: 'user-003',
        created_at: '2024-02-01T09:00:00Z'
      }
    ],
    activity_logs: [
      {
        id: 6,
        activity_type: 'project_created',
        title: 'Project Created',
        description: 'Sustainable Garden Monitor project was created',
        metadata: { initial_status: 'draft' },
        user_id: 'user-003',
        user_name: 'Alice Green',
        created_at: '2024-02-01T09:00:00Z'
      }
    ]
  }
];

// Projects API endpoints
app.get('/api/v1/projects', (req, res) => {
  const { visibility, status, owner_id, search } = req.query;

  let filtered = [...mockProjects];

  if (visibility) {
    filtered = filtered.filter(p => p.visibility === visibility);
  }

  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }

  if (owner_id) {
    filtered = filtered.filter(p => p.owner_id === owner_id);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  res.json(filtered);
});

app.get('/api/v1/projects/:projectId', (req, res) => {
  const { projectId } = req.params;
  const project = mockProjects.find(p => p.project_id === projectId);

  if (!project) {
    return res.status(404).json({
      detail: 'Project not found',
      project_id: projectId
    });
  }

  res.json(project);
});

app.post('/api/v1/projects', (req, res) => {
  const now = new Date().toISOString();
  const projectId = req.body.project_id || `proj-${Date.now()}`;
  const ownerId = req.body.owner_id || 'current-user';

  // Handle initial collaborators
  const initialCollaborators = req.body.initial_collaborators || [];
  const collaborators = [
    {
      id: Date.now(),
      user_id: ownerId,
      role: 'owner',
      invited_by: ownerId,
      invited_at: now,
      accepted_at: now
    }
  ];

  // Add initial collaborators (excluding owner)
  initialCollaborators.forEach((collab, index) => {
    if (collab.user_id !== ownerId) {
      collaborators.push({
        id: Date.now() + index + 1,
        user_id: collab.user_id,
        role: collab.role || 'viewer',
        invited_by: ownerId,
        invited_at: now,
        accepted_at: null // Not accepted yet
      });
    }
  });

  // Handle initial milestones
  const initialMilestones = req.body.initial_milestones || [];
  const milestones = initialMilestones.map((milestone, index) => ({
    id: Date.now() + index,
    title: milestone.title,
    description: milestone.description || null,
    target_date: milestone.target_date || null,
    completion_date: null,
    is_completed: false,
    priority: milestone.priority || 'medium',
    order_index: index,
    created_by: ownerId,
    created_at: now,
    completed_by: null
  }));

  // Create activity logs
  const activityLogs = [
    {
      id: Date.now(),
      activity_type: 'project_created',
      title: 'Project Created',
      description: `${req.body.name} project was created`,
      metadata: {
        initial_status: req.body.status || 'draft',
        project_type: req.body.project_type || 'internal'
      },
      user_id: ownerId,
      user_name: 'Current User',
      created_at: now
    }
  ];

  // Add milestone creation activity if any
  if (initialMilestones.length > 0) {
    activityLogs.push({
      id: Date.now() + 1,
      activity_type: 'milestone_added',
      title: 'Initial Milestones Added',
      description: `${initialMilestones.length} milestones added during project creation`,
      metadata: { milestone_count: initialMilestones.length },
      user_id: ownerId,
      user_name: 'Current User',
      created_at: now
    });
  }

  // Add collaborator invitation activity if any
  if (initialCollaborators.length > 0) {
    activityLogs.push({
      id: Date.now() + 2,
      activity_type: 'member_added',
      title: 'Team Members Invited',
      description: `${initialCollaborators.length} team members invited during project creation`,
      metadata: { collaborator_count: initialCollaborators.length },
      user_id: ownerId,
      user_name: 'Current User',
      created_at: now
    });
  }

  const newProject = {
    project_id: projectId,
    name: req.body.name,
    description: req.body.description || null,
    project_type: req.body.project_type || 'internal',
    owner_id: ownerId,
    makerspace_id: req.body.makerspace_id || null,
    visibility: req.body.visibility || 'private',
    status: req.body.status || 'draft',
    start_date: req.body.start_date || null,
    end_date: req.body.end_date || null,
    tags: req.body.tags || [],
    is_featured: false,
    is_approved: true,
    created_at: now,
    updated_at: now,
    github_repo_url: null,
    github_repo_name: null,
    github_integration_enabled: false,
    github_default_branch: 'main',
    collaborators,
    bom_items: [],
    equipment_reservations: [],
    files: [],
    milestones,
    activity_logs: activityLogs
  };

  mockProjects.push(newProject);
  res.status(201).json(newProject);
});

app.put('/api/v1/projects/:projectId', (req, res) => {
  const { projectId } = req.params;
  const index = mockProjects.findIndex(p => p.project_id === projectId);

  if (index === -1) {
    return res.status(404).json({ detail: 'Project not found' });
  }

  mockProjects[index] = {
    ...mockProjects[index],
    ...req.body,
    project_id: projectId,
    updated_at: new Date().toISOString()
  };

  res.json(mockProjects[index]);
});

app.delete('/api/v1/projects/:projectId', (req, res) => {
  const { projectId } = req.params;
  const index = mockProjects.findIndex(p => p.project_id === projectId);

  if (index === -1) {
    return res.status(404).json({ detail: 'Project not found' });
  }

  mockProjects.splice(index, 1);
  res.status(204).send();
});

// BOM reorder endpoint
app.post('/api/v1/projects/:projectId/bom/:bomItemId/reorder', (req, res) => {
  const { projectId, bomItemId } = req.params;
  const project = mockProjects.find(p => p.project_id === projectId);

  if (!project) {
    return res.status(404).json({ detail: 'Project not found' });
  }

  const bomItem = project.bom_items.find(item => item.id === parseInt(bomItemId));
  if (!bomItem) {
    return res.status(404).json({ detail: 'BOM item not found' });
  }

  // Update BOM item status
  bomItem.procurement_status = 'ordered';

  // Add activity log
  project.activity_logs.push({
    id: Date.now(),
    activity_type: 'bom_item_updated',
    title: 'Reorder Requested',
    description: `Reorder requested for ${bomItem.item_name} (qty: ${req.body.quantity || bomItem.quantity})`,
    metadata: {
      reorder_id: `ro-${Date.now()}`,
      item_id: bomItem.item_id,
      quantity: req.body.quantity || bomItem.quantity,
      urgent: req.body.urgent || bomItem.is_critical
    },
    user_id: 'current-user',
    user_name: 'Current User',
    created_at: new Date().toISOString()
  });

  res.status(201).json({
    message: 'Reorder request created successfully',
    reorder_id: `ro-${Date.now()}`,
    estimated_delivery: '3-5 business days'
  });
});

// Billing API Endpoints
const mockTransactions = [
  {
    id: 'txn_001',
    amount: 250.00,
    currency: 'USD',
    type: 'membership',
    status: 'success',
    description: 'Monthly membership fee',
    gateway: 'stripe',
    gateway_transaction_id: 'pi_1234567890',
    created_at: '2024-02-01T10:00:00Z',
    completed_at: '2024-02-01T10:01:00Z'
  },
  {
    id: 'txn_002',
    amount: 75.50,
    currency: 'USD',
    type: 'printing_3d',
    status: 'success',
    description: '3D printing job - Prototype parts',
    gateway: 'credit',
    created_at: '2024-02-05T14:30:00Z',
    completed_at: '2024-02-05T14:30:00Z'
  }
];

const mockInvoices = [
  {
    id: 'inv_001',
    invoice_number: 'INV-2024-001',
    title: 'Equipment Usage - January 2024',
    amount: 150.00,
    total_amount: 150.00,
    currency: 'USD',
    status: 'paid',
    issue_date: '2024-01-31',
    due_date: '2024-02-15',
    paid_date: '2024-02-01',
    customer_name: 'John Maker',
    customer_email: 'john@example.com'
  }
];

const mockCreditWallet = {
  id: 'wallet_001',
  balance: 125.50,
  total_earned: 300.00,
  total_spent: 174.50,
  conversion_rate: 1.0,
  auto_recharge_enabled: true,
  auto_recharge_threshold: 50.0,
  auto_recharge_amount: 100.0
};

const mockPaymentMethods = [
  {
    id: 'pm_001',
    type: 'card',
    provider: 'stripe',
    last_four: '4242',
    brand: 'visa',
    expiry_month: 12,
    expiry_year: 2025,
    holder_name: 'John Maker',
    is_default: true,
    is_verified: true,
    created_at: '2024-01-15T10:00:00Z'
  }
];

const mockBillingAnalytics = {
  revenue: {
    total: 5250.00,
    monthly: 1250.00,
    weekly: 320.00,
    daily: 85.00,
    growth_rate: 12.5,
    previous_period: 1100.00
  },
  transactions: {
    total_count: 156,
    successful_count: 148,
    failed_count: 8,
    pending_count: 0,
    success_rate: 94.8,
    average_amount: 125.50
  },
  revenue_by_type: {
    membership: 2500.00,
    printing_3d: 1200.00,
    laser_cutting: 800.00,
    workshop: 450.00,
    materials: 300.00
  },
  revenue_by_month: [
    { month: '2024-01', revenue: 1100.00, transactions: 42 },
    { month: '2024-02', revenue: 1250.00, transactions: 48 }
  ],
  top_customers: [
    { customer_name: 'John Maker', customer_email: 'john@example.com', total_spent: 450.00, transaction_count: 12 }
  ],
  payment_methods: {
    credit_card: 65,
    credit_wallet: 25,
    bank_transfer: 10
  }
};

// Transactions endpoints (without v1 to match billingApi.ts)
app.get('/api/billing/transactions', (req, res) => {
  res.json(mockTransactions);
});

app.get('/api/billing/transactions/:id', (req, res) => {
  const transaction = mockTransactions.find(t => t.id === req.params.id);
  if (!transaction) {
    return res.status(404).json({ detail: 'Transaction not found' });
  }
  res.json(transaction);
});

app.post('/api/billing/transactions', (req, res) => {
  const newTransaction = {
    id: `txn_${Date.now()}`,
    ...req.body,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  mockTransactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// Invoices endpoints
app.get('/api/billing/invoices', (req, res) => {
  res.json(mockInvoices);
});

app.get('/api/billing/invoices/:id', (req, res) => {
  const invoice = mockInvoices.find(i => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ detail: 'Invoice not found' });
  }
  res.json(invoice);
});

app.post('/api/billing/invoices', (req, res) => {
  const newInvoice = {
    id: `inv_${Date.now()}`,
    invoice_number: `INV-2024-${String(mockInvoices.length + 1).padStart(3, '0')}`,
    ...req.body,
    status: 'draft',
    issue_date: new Date().toISOString().split('T')[0]
  };
  mockInvoices.push(newInvoice);
  res.status(201).json(newInvoice);
});

// Credit Wallet endpoints
app.get('/api/billing/credit-wallet', (req, res) => {
  res.json(mockCreditWallet);
});

app.put('/api/billing/credit-wallet', (req, res) => {
  Object.assign(mockCreditWallet, req.body);
  res.json(mockCreditWallet);
});

app.get('/api/billing/credit-wallet/transactions', (req, res) => {
  const creditTransactions = [
    {
      id: 'ct_001',
      type: 'earned',
      amount: 25.00,
      description: 'Membership bonus credits',
      created_at: '2024-02-01T10:00:00Z',
      balance_after: 125.50
    }
  ];
  res.json(creditTransactions);
});

app.post('/api/billing/credit-wallet/purchase', (req, res) => {
  const transaction = {
    id: `txn_${Date.now()}`,
    amount: req.body.amount,
    currency: 'USD',
    type: 'credit_purchase',
    status: 'success',
    description: `Credit purchase - $${req.body.amount}`,
    gateway: 'stripe',
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  };
  mockCreditWallet.balance += req.body.amount;
  res.status(201).json(transaction);
});

// Payment Methods endpoints
app.get('/api/billing/payment-methods', (req, res) => {
  res.json(mockPaymentMethods);
});

app.post('/api/billing/payment-methods', (req, res) => {
  const newPaymentMethod = {
    id: `pm_${Date.now()}`,
    ...req.body,
    is_verified: false,
    created_at: new Date().toISOString()
  };
  mockPaymentMethods.push(newPaymentMethod);
  res.status(201).json(newPaymentMethod);
});

app.delete('/api/billing/payment-methods/:id', (req, res) => {
  const index = mockPaymentMethods.findIndex(pm => pm.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Payment method not found' });
  }
  mockPaymentMethods.splice(index, 1);
  res.status(204).send();
});

// Analytics endpoints
app.get('/api/billing/analytics', (req, res) => {
  res.json(mockBillingAnalytics);
});

app.get('/api/billing/analytics/revenue-trends', (req, res) => {
  res.json({
    trends: [
      { period: '2024-01', revenue: 1100.00, growth: 5.2 },
      { period: '2024-02', revenue: 1250.00, growth: 13.6 }
    ]
  });
});

// Checkout endpoints
app.post('/api/billing/checkout/create-session', (req, res) => {
  res.json({
    session_id: `cs_${Date.now()}`,
    client_secret: 'pi_1234567890_secret_abcd',
    redirect_url: '/billing/checkout/success'
  });
});

app.post('/api/billing/checkout/verify-payment', (req, res) => {
  const transaction = {
    id: `txn_${Date.now()}`,
    amount: 100.00,
    currency: 'USD',
    type: 'payment',
    status: 'success',
    description: 'Payment verification',
    gateway: 'stripe',
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  };
  res.json(transaction);
});

// Generic 404 handler for other endpoints
app.use('*', (req, res) => {
  console.log(`🔍 Missing endpoint: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    detail: `Endpoint ${req.method} ${req.originalUrl} not found`,
    mock_server: true,
    suggestion: "Check if this endpoint needs to be implemented"
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   🔐 Authentication: /api/auth/*`);
  console.log(`   👤 Users: /api/users/me`);
  console.log(`   📊 Analytics: /api/v1/analytics/*`);
  console.log(`   🔧 Maintenance: /api/v1/maintenance/*`);
  console.log(`   💰 Billing: /api/v1/billing/*`);
  console.log(`   📦 Inventory: /api/v1/inventory/*`);
  console.log(`   🛠️  Equipment: /api/v1/equipment/*`);
  console.log(`   📋 Projects: /api/v1/projects/*`);
  console.log(`   🏢 Makerspaces: /api/v1/makerspaces/*`);
  console.log(`⚠️  All other endpoints will return 404 with debug info`);
});
