import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import {
  Settings, Users, DollarSign, Clock, CheckCircle, AlertCircle,
  Package, Printer, Star, TrendingUp, BarChart3, Wrench, 
  Calendar, FileText, Upload, Plus, Edit3, Trash2, Eye
} from 'lucide-react';

// Types
interface ServiceProvider {
  provider_id: string;
  business_name?: string;
  display_name: string;
  description?: string;
  contact_email: string;
  contact_phone?: string;
  website_url?: string;
  services_offered: string[];
  materials_supported: string[];
  max_build_volume?: { x: number; y: number; z: number };
  is_active: boolean;
  accepts_new_jobs: boolean;
  minimum_order_value?: number;
  turnaround_time_days: number;
  base_hourly_rate?: number;
  material_markup_percentage: number;
  rush_order_multiplier: number;
  total_jobs_completed: number;
  customer_rating?: number;
  on_time_delivery_rate?: number;
  is_verified: boolean;
  verification_level: string;
  created_at: string;
  last_active_at?: string;
}

interface ProviderEquipment {
  id: number;
  equipment_type: string;
  brand?: string;
  model?: string;
  name: string;
  build_volume?: { x: number; y: number; z: number };
  materials_supported: string[];
  is_active: boolean;
  is_available: boolean;
  total_print_hours: number;
  total_jobs_completed: number;
  maintenance_due?: string;
  last_maintenance?: string;
}

interface MaterialUsage {
  id: number;
  material_type: string;
  material_brand?: string;
  material_color?: string;
  estimated_weight?: number;
  actual_weight?: number;
  cost_per_gram?: number;
  actual_material_cost?: number;
  usage_method: string;
  material_quality_rating?: number;
  recorded_at: string;
}

interface ProviderStats {
  active_jobs: number;
  pending_jobs: number;
  completed_this_month: number;
  revenue_this_month: number;
  average_job_value: number;
  utilization_rate: number;
  customer_satisfaction: number;
  on_time_delivery: number;
}

const ServiceProviderDashboard: React.FC = () => {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [equipment, setEquipment] = useState<ProviderEquipment[]>([]);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateProvider, setShowCreateProvider] = useState(false);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showProviderSettings, setShowProviderSettings] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<ProviderEquipment | null>(null);
  const { toast } = useToast();

  // Form states
  const [providerForm, setProviderForm] = useState({
    business_name: '',
    display_name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    services_offered: [] as string[],
    materials_supported: [] as string[],
    minimum_order_value: '',
    turnaround_time_days: '7',
    base_hourly_rate: '',
    material_markup_percentage: '20',
    rush_order_multiplier: '1.5',
    accepts_new_jobs: true
  });

  const [equipmentForm, setEquipmentForm] = useState({
    equipment_type: '',
    brand: '',
    model: '',
    name: '',
    build_volume_x: '',
    build_volume_y: '',
    build_volume_z: '',
    materials_supported: [] as string[],
    is_active: true,
    is_available: true
  });

  // Constants
  const serviceTypes = [
    '3D Printing', 'Laser Cutting', 'CNC Milling', 'Injection Molding',
    'PCB Assembly', 'Custom Fabrication', 'Prototyping', 'Small Batch Production'
  ];

  const materialTypes = [
    'PLA', 'ABS', 'PETG', 'TPU', 'ASA', 'PC', 'Nylon', 'PVA', 'HIPS',
    'Wood Fill', 'Metal Fill', 'Carbon Fiber', 'Acrylic', 'Wood', 'Metal'
  ];

  const equipmentTypes = [
    '3D Printer', 'Laser Cutter', 'CNC Mill', 'CNC Router', '3D Scanner',
    'Injection Molding Machine', 'Vacuum Former', 'PCB Mill'
  ];

  // Fetch provider profile
  const fetchProvider = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/jobs/providers/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const providerData = await response.json();
        setProvider(providerData);
        
        // Update form with provider data
        setProviderForm({
          business_name: providerData.business_name || '',
          display_name: providerData.display_name || '',
          description: providerData.description || '',
          contact_email: providerData.contact_email || '',
          contact_phone: providerData.contact_phone || '',
          website_url: providerData.website_url || '',
          services_offered: providerData.services_offered || [],
          materials_supported: providerData.materials_supported || [],
          minimum_order_value: providerData.minimum_order_value?.toString() || '',
          turnaround_time_days: providerData.turnaround_time_days?.toString() || '7',
          base_hourly_rate: providerData.base_hourly_rate?.toString() || '',
          material_markup_percentage: providerData.material_markup_percentage?.toString() || '20',
          rush_order_multiplier: providerData.rush_order_multiplier?.toString() || '1.5',
          accepts_new_jobs: providerData.accepts_new_jobs
        });
      } else if (response.status === 404) {
        // Provider profile doesn't exist
        setProvider(null);
      }
    } catch (error) {
      console.error('Failed to fetch provider:', error);
    }
  }, []);

  // Fetch equipment
  const fetchEquipment = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/jobs/providers/me/equipment', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const equipmentData = await response.json();
        setEquipment(equipmentData);
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/jobs/providers/me/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  // Create provider profile
  const createProvider = async () => {
    try {
      const response = await fetch('/api/v1/jobs/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...providerForm,
          minimum_order_value: providerForm.minimum_order_value ? parseFloat(providerForm.minimum_order_value) : undefined,
          turnaround_time_days: parseInt(providerForm.turnaround_time_days),
          base_hourly_rate: providerForm.base_hourly_rate ? parseFloat(providerForm.base_hourly_rate) : undefined,
          material_markup_percentage: parseFloat(providerForm.material_markup_percentage),
          rush_order_multiplier: parseFloat(providerForm.rush_order_multiplier)
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Service provider profile created successfully"
        });
        
        setShowCreateProvider(false);
        await fetchProvider();
      } else {
        throw new Error('Failed to create provider');
      }
    } catch (error) {
      console.error('Failed to create provider:', error);
      toast({
        title: "Error",
        description: "Failed to create provider profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update provider profile
  const updateProvider = async () => {
    if (!provider) return;

    try {
      const response = await fetch(`/api/v1/jobs/providers/${provider.provider_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...providerForm,
          minimum_order_value: providerForm.minimum_order_value ? parseFloat(providerForm.minimum_order_value) : undefined,
          turnaround_time_days: parseInt(providerForm.turnaround_time_days),
          base_hourly_rate: providerForm.base_hourly_rate ? parseFloat(providerForm.base_hourly_rate) : undefined,
          material_markup_percentage: parseFloat(providerForm.material_markup_percentage),
          rush_order_multiplier: parseFloat(providerForm.rush_order_multiplier)
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Provider profile updated successfully"
        });
        
        setShowProviderSettings(false);
        await fetchProvider();
      } else {
        throw new Error('Failed to update provider');
      }
    } catch (error) {
      console.error('Failed to update provider:', error);
      toast({
        title: "Error",
        description: "Failed to update provider profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Add equipment
  const addEquipment = async () => {
    try {
      const response = await fetch('/api/v1/jobs/providers/me/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...equipmentForm,
          build_volume: equipmentForm.build_volume_x && equipmentForm.build_volume_y && equipmentForm.build_volume_z ? {
            x: parseFloat(equipmentForm.build_volume_x),
            y: parseFloat(equipmentForm.build_volume_y),
            z: parseFloat(equipmentForm.build_volume_z)
          } : undefined
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Equipment added successfully"
        });
        
        setShowAddEquipment(false);
        setEquipmentForm({
          equipment_type: '',
          brand: '',
          model: '',
          name: '',
          build_volume_x: '',
          build_volume_y: '',
          build_volume_z: '',
          materials_supported: [],
          is_active: true,
          is_available: true
        });
        await fetchEquipment();
      } else {
        throw new Error('Failed to add equipment');
      }
    } catch (error) {
      console.error('Failed to add equipment:', error);
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProvider(),
        fetchEquipment(),
        fetchStats()
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchProvider, fetchEquipment, fetchStats]);

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show setup flow if no provider profile
  if (!provider) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Service Provider Setup</h1>
          <p className="text-muted-foreground mb-8">
            Create your service provider profile to start accepting jobs
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Your Provider Profile</CardTitle>
            <CardDescription>
              Set up your business information and service capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={providerForm.business_name}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, business_name: e.target.value }))}
                  placeholder="Your business name"
                />
              </div>
              
              <div>
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  value={providerForm.display_name}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Public display name"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={providerForm.description}
                onChange={(e) => setProviderForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your services and capabilities"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={providerForm.contact_email}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={providerForm.contact_phone}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="turnaround_time">Standard Turnaround (days)</Label>
                <Input
                  id="turnaround_time"
                  type="number"
                  value={providerForm.turnaround_time_days}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, turnaround_time_days: e.target.value }))}
                  min="1"
                  max="365"
                />
              </div>
              
              <div>
                <Label htmlFor="base_rate">Base Hourly Rate ($)</Label>
                <Input
                  id="base_rate"
                  type="number"
                  value={providerForm.base_hourly_rate}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, base_hourly_rate: e.target.value }))}
                  placeholder="50.00"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="accepts_jobs"
                checked={providerForm.accepts_new_jobs}
                onCheckedChange={(checked) => setProviderForm(prev => ({ ...prev, accepts_new_jobs: checked }))}
              />
              <Label htmlFor="accepts_jobs">Accept new jobs immediately</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button onClick={createProvider} disabled={!providerForm.display_name || !providerForm.contact_email}>
                Create Provider Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Provider Dashboard</h1>
          <p className="text-muted-foreground">Manage your service provider business</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowProviderSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setShowAddEquipment(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>

      {/* Provider Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Printer className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{provider.display_name}</h2>
                <p className="text-muted-foreground">{provider.business_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Badge variant={provider.is_active ? "default" : "secondary"}>
                    {provider.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={provider.accepts_new_jobs ? "default" : "secondary"}>
                    {provider.accepts_new_jobs ? "Accepting Jobs" : "Not Accepting"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {provider.is_verified && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {provider.verification_level}
                  </Badge>
                </div>
              </div>
              
              {provider.customer_rating && (
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{provider.customer_rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {provider.total_jobs_completed} jobs completed
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{stats.active_jobs}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Jobs</p>
                  <p className="text-2xl font-bold">{stats.pending_jobs}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.revenue_this_month)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilization</p>
                  <p className="text-2xl font-bold">{Math.round(stats.utilization_rate)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Active Jobs
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Reports
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* Recent Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Customer Satisfaction</span>
                        <span className="text-sm">{Math.round(stats.customer_satisfaction * 100)}%</span>
                      </div>
                      <Progress value={stats.customer_satisfaction * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">On-Time Delivery</span>
                        <span className="text-sm">{Math.round(stats.on_time_delivery * 100)}%</span>
                      </div>
                      <Progress value={stats.on_time_delivery * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Equipment Utilization</span>
                        <span className="text-sm">{Math.round(stats.utilization_rate)}%</span>
                      </div>
                      <Progress value={stats.utilization_rate} className="h-2" />
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Average Job Value</span>
                        <span className="font-medium">{formatCurrency(stats.average_job_value)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.brand} {item.model}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={item.is_available ? "default" : "secondary"}>
                        {item.is_available ? "Available" : "Busy"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{item.equipment_type}</span>
                    </div>
                    
                    {item.build_volume && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Build Volume:</span>
                        <span>{item.build_volume.x}×{item.build_volume.y}×{item.build_volume.z}mm</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Hours:</span>
                      <span>{Math.round(item.total_print_hours)}h</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jobs Completed:</span>
                      <span>{item.total_jobs_completed}</span>
                    </div>
                  </div>

                  {item.maintenance_due && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <Wrench className="h-4 w-4" />
                        <span className="text-sm font-medium">Maintenance Due</span>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        {new Date(item.maintenance_due).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingEquipment(item)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {equipment.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Printer className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No equipment added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your equipment to start accepting jobs
                  </p>
                  <Button onClick={() => setShowAddEquipment(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                Detailed analytics and performance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and reporting features will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Equipment Dialog */}
      <Dialog open={showAddEquipment} onOpenChange={setShowAddEquipment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
            <DialogDescription>
              Add equipment to your service provider profile
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipment_type">Equipment Type *</Label>
                <Select
                  value={equipmentForm.equipment_type}
                  onValueChange={(value) => setEquipmentForm(prev => ({ ...prev, equipment_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypes.map(type => (
                      <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '_')}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="equipment_name">Equipment Name *</Label>
                <Input
                  id="equipment_name"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My 3D Printer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={equipmentForm.brand}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Prusa, Ultimaker, etc."
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={equipmentForm.model}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="i3 MK3S+, S3, etc."
                />
              </div>
            </div>

            <div>
              <Label>Build Volume (mm)</Label>
              <div className="grid grid-cols-3 gap-4 mt-1">
                <Input
                  value={equipmentForm.build_volume_x}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, build_volume_x: e.target.value }))}
                  placeholder="X (width)"
                  type="number"
                />
                <Input
                  value={equipmentForm.build_volume_y}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, build_volume_y: e.target.value }))}
                  placeholder="Y (depth)"
                  type="number"
                />
                <Input
                  value={equipmentForm.build_volume_z}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, build_volume_z: e.target.value }))}
                  placeholder="Z (height)"
                  type="number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Supported Materials</Label>
              <div className="grid grid-cols-3 gap-2">
                {materialTypes.map(material => (
                  <div key={material} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`material-${material}`}
                      checked={equipmentForm.materials_supported.includes(material.toLowerCase())}
                      onChange={(e) => {
                        const materialLower = material.toLowerCase();
                        setEquipmentForm(prev => ({
                          ...prev,
                          materials_supported: e.target.checked
                            ? [...prev.materials_supported, materialLower]
                            : prev.materials_supported.filter(m => m !== materialLower)
                        }));
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`material-${material}`} className="text-sm">
                      {material}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="equipment_active"
                    checked={equipmentForm.is_active}
                    onCheckedChange={(checked) => setEquipmentForm(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="equipment_active">Active</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="equipment_available"
                    checked={equipmentForm.is_available}
                    onCheckedChange={(checked) => setEquipmentForm(prev => ({ ...prev, is_available: checked }))}
                  />
                  <Label htmlFor="equipment_available">Available</Label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowAddEquipment(false)}>
                  Cancel
                </Button>
                <Button onClick={addEquipment} disabled={!equipmentForm.equipment_type || !equipmentForm.name}>
                  Add Equipment
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceProviderDashboard;
