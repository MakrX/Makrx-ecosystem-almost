import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  DollarSign,
  Users,
  Shield,
  Settings,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  BarChart3,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EnhancedReservationSystem from '../components/EnhancedReservationSystem';

interface Equipment {
  id: string;
  equipment_id: string;
  name: string;
  category: string;
  status: 'available' | 'in_use' | 'under_maintenance' | 'offline';
  location: string;
  hourly_rate?: number;
  requires_certification: boolean;
  certification_required?: string;
  total_usage_hours: number;
  usage_count: number;
  average_rating: number;
  manufacturer?: string;
  model?: string;
  description?: string;
  image_url?: string;
}

interface EquipmentStats {
  total_equipment: number;
  available_equipment: number;
  in_use_equipment: number;
  maintenance_equipment: number;
  total_reservations_today: number;
  utilization_rate: number;
  revenue_today: number;
  avg_reservation_duration: number;
}

const EnhancedEquipment: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  // Role-based permissions
  const isAdmin = user?.role === 'super_admin' || user?.role === 'makerspace_admin';
  const canManageEquipment = isAdmin || user?.role === 'service_provider';
  const canViewReservations = true; // All users can view reservations
  const canCreateReservations = user?.role !== 'admin'; // All except admin can reserve

  useEffect(() => {
    loadEquipment();
    loadStats();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || 'mock-token';
      
      const response = await fetch('/api/v1/equipment/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      } else {
        setEquipment(getMockEquipment());
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
      setEquipment(getMockEquipment());
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      
      const response = await fetch('/api/v1/equipment/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setStats(calculateMockStats());
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(calculateMockStats());
    }
  };

  const getMockEquipment = (): Equipment[] => [
    {
      id: 'eq-1',
      equipment_id: 'PRINTER3D-001',
      name: 'Ultimaker S3',
      category: 'printer_3d',
      status: 'available',
      location: 'Station A1',
      hourly_rate: 25.00,
      requires_certification: true,
      certification_required: '3D Printing Safety',
      total_usage_hours: 247.5,
      usage_count: 89,
      average_rating: 4.5,
      manufacturer: 'Ultimaker',
      model: 'S3',
      description: 'High-precision FDM 3D printer perfect for prototyping',
      image_url: '/images/ultimaker-s3.jpg'
    },
    {
      id: 'eq-2',
      equipment_id: 'LASER-001',
      name: 'Glowforge Pro',
      category: 'laser_cutter',
      status: 'in_use',
      location: 'Station B1',
      hourly_rate: 35.00,
      requires_certification: true,
      certification_required: 'Laser Safety Certification',
      total_usage_hours: 156.2,
      usage_count: 45,
      average_rating: 4.8,
      manufacturer: 'Glowforge',
      model: 'Pro',
      description: 'Precision laser cutter for wood, acrylic, and fabric'
    },
    {
      id: 'eq-3',
      equipment_id: 'CNC-001',
      name: 'Shapeoko 4',
      category: 'cnc_machine',
      status: 'under_maintenance',
      location: 'Station C1',
      hourly_rate: 45.00,
      requires_certification: true,
      certification_required: 'CNC Operation Certificate',
      total_usage_hours: 89.3,
      usage_count: 23,
      average_rating: 4.2,
      manufacturer: 'Carbide 3D',
      model: 'Shapeoko 4',
      description: 'CNC machine for precision cutting and carving'
    }
  ];

  const calculateMockStats = (): EquipmentStats => {
    const mockEquip = getMockEquipment();
    return {
      total_equipment: mockEquip.length,
      available_equipment: mockEquip.filter(eq => eq.status === 'available').length,
      in_use_equipment: mockEquip.filter(eq => eq.status === 'in_use').length,
      maintenance_equipment: mockEquip.filter(eq => eq.status === 'under_maintenance').length,
      total_reservations_today: 12,
      utilization_rate: 68.5,
      revenue_today: 425.50,
      avg_reservation_duration: 2.8
    };
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_use': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'in_use': return <Clock className="h-4 w-4" />;
      case 'under_maintenance': return <Wrench className="h-4 w-4" />;
      case 'offline': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'printer_3d', label: '3D Printers' },
    { value: 'laser_cutter', label: 'Laser Cutters' },
    { value: 'cnc_machine', label: 'CNC Machines' },
    { value: 'testing_tool', label: 'Testing Tools' },
    { value: 'soldering_station', label: 'Soldering Stations' },
    { value: 'workstation', label: 'Workstations' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'in_use', label: 'In Use' },
    { value: 'under_maintenance', label: 'Maintenance' },
    { value: 'offline', label: 'Offline' }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive equipment reservation system with cost rules and skill gating
          </p>
        </div>
        
        {canManageEquipment && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_equipment}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.utilization_rate.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.revenue_today.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reservations Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_reservations_today}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Equipment Overview</TabsTrigger>
          <TabsTrigger value="reservations">Reservation System</TabsTrigger>
          <TabsTrigger value="analytics" disabled={!isAdmin}>Analytics</TabsTrigger>
        </TabsList>

        {/* Equipment Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredEquipment.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.equipment_id}</p>
                      <p className="text-sm text-gray-600">{item.location}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getStatusColor(item.status)} flex items-center gap-1`}>
                        {getStatusIcon(item.status)}
                        {item.status.replace('_', ' ')}
                      </Badge>
                      {item.requires_certification && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Cert Required
                        </Badge>
                      )}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Usage</p>
                      <p className="font-medium">{item.total_usage_hours.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sessions</p>
                      <p className="font-medium">{item.usage_count}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{item.average_rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Rate</p>
                      <p className="font-medium">
                        {item.hourly_rate ? `$${item.hourly_rate}/hr` : 'Free'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {canCreateReservations && item.status === 'available' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedEquipment(item);
                          setActiveTab('reservations');
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Reserve
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEquipment.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No equipment found</h3>
                <p className="text-gray-600">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No equipment available'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reservation System Tab */}
        <TabsContent value="reservations">
          <EnhancedReservationSystem 
            equipment={selectedEquipment || undefined}
            mode={isAdmin ? 'admin' : 'user'}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Equipment Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEquipment.slice(0, 5).map((item) => {
                    const utilizationRate = (item.total_usage_hours / (30 * 24)) * 100; // 30 days
                    return (
                      <div key={item.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.name}</span>
                          <span>{utilizationRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue by Equipment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEquipment.slice(0, 5).map((item) => {
                    const revenue = (item.hourly_rate || 0) * item.total_usage_hours;
                    const maxRevenue = Math.max(...filteredEquipment.map(eq => (eq.hourly_rate || 0) * eq.total_usage_hours));
                    const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                    
                    return (
                      <div key={item.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.name}</span>
                          <span>${revenue.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['available', 'in_use', 'under_maintenance', 'offline'].map(status => {
                    const count = filteredEquipment.filter(eq => eq.status === status).length;
                    const percentage = filteredEquipment.length > 0 ? (count / filteredEquipment.length) * 100 : 0;
                    const statusColors = {
                      available: 'bg-green-500',
                      in_use: 'bg-blue-500',
                      under_maintenance: 'bg-yellow-500',
                      offline: 'bg-red-500'
                    };

                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`}></div>
                          <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">
                        {equipment.length > 0 ? 
                          (equipment.reduce((sum, eq) => sum + eq.average_rating, 0) / equipment.length).toFixed(1) : 
                          '0.0'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Usage Hours</span>
                    <span className="font-medium">
                      {equipment.reduce((sum, eq) => sum + eq.total_usage_hours, 0).toFixed(1)}h
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Sessions</span>
                    <span className="font-medium">
                      {equipment.reduce((sum, eq) => sum + eq.usage_count, 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Certification Required</span>
                    <span className="font-medium">
                      {equipment.filter(eq => eq.requires_certification).length} / {equipment.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedEquipment;
