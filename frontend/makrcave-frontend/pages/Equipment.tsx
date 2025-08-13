import { useState, useMemo, useEffect } from 'react';
import {
  Wrench, Plus, Search, Filter, Calendar, Star, MapPin,
  Clock, AlertTriangle, CheckCircle, XCircle, Settings,
  Grid, List, Eye, Edit, Trash2, BookOpen, Shield,
  PlayCircle, PauseCircle, BarChart3, Users, Activity,
  X, DollarSign, GraduationCap
} from 'lucide-react';
import { useMakerspace } from '../contexts/MakerspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { useSkills } from '../contexts/SkillContext';
import { FeatureGate } from '../components/FeatureGate';
import EquipmentCard from '../components/EquipmentCard';
import ReservationModal from '../components/ReservationModal';
import EquipmentRating from '../components/EquipmentRating';
import AddEquipmentModal from '../components/AddEquipmentModal';
import MaintenanceModal from '../components/MaintenanceModal';
import EquipmentSkillRequirements from '../components/EquipmentSkillRequirements';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Equipment {
  id: string;
  equipment_id: string;
  name: string;
  category: 'printer_3d' | 'laser_cutter' | 'cnc_machine' | 'testing_tool' | 'soldering_station' | 'workstation' | 'hand_tool' | 'measuring_tool' | 'general_tool';
  sub_category?: string;
  status: 'available' | 'in_use' | 'under_maintenance' | 'offline';
  location: string;
  linked_makerspace_id: string;
  requires_certification: boolean;
  certification_required?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  total_usage_hours: number;
  usage_count: number;
  average_rating: number;
  total_ratings: number;
  manufacturer?: string;
  model?: string;
  hourly_rate?: number;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface EquipmentReservation {
  id: string;
  equipment_id: string;
  user_id: string;
  user_name: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  purpose?: string;
  project_name?: string;
}

interface EquipmentStats {
  total_equipment: number;
  available_equipment: number;
  in_use_equipment: number;
  maintenance_equipment: number;
  offline_equipment: number;
  total_reservations_today: number;
  utilization_rate: number;
  average_rating: number;
  categories: Record<string, number>;
  locations: Record<string, number>;
}

export default function Equipment() {
  const { user, hasPermission } = useAuth();
  const { canAccessEquipment, hasSkillForEquipment } = useSkills();
  
  // State management
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [activeTab, setActiveTab] = useState('equipment');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Load equipment and stats on mount
  useEffect(() => {
    loadEquipment();
    loadStats();
  }, []);

  const loadEquipment = async () => {
    try {
      const authToken = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch('/api/v1/equipment/', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const equipmentData = await response.json();
        setEquipment(equipmentData);
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
      // Fallback to mock data
      setEquipment(mockEquipment);
    }
  };

  const loadStats = async () => {
    try {
      const authToken = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch('/api/v1/equipment/stats/overview', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Calculate mock stats
      setStats(calculateMockStats());
    }
  };

  // Role-based permissions
  const canViewEquipment = user?.role === 'super_admin' || user?.role === 'makerspace_admin' || 
                          user?.role === 'admin' || user?.role === 'user' || user?.role === 'service_provider';
  const canReserve = user?.role === 'super_admin' || user?.role === 'makerspace_admin' || 
                    user?.role === 'user' || user?.role === 'service_provider';
  const canCreateEquipment = user?.role === 'super_admin' || user?.role === 'makerspace_admin' || 
                            (user?.role === 'service_provider');
  const canMaintenanceLogs = user?.role === 'super_admin' || user?.role === 'makerspace_admin' || 
                            user?.role === 'service_provider';
  const canDeleteEquipment = user?.role === 'super_admin' || user?.role === 'makerspace_admin' || 
                            (user?.role === 'service_provider');

  // Mock data for development
  const mockEquipment: Equipment[] = [
    {
      id: 'eq-1',
      equipment_id: 'PRINTER3D-001',
      name: 'Ultimaker S3',
      category: 'printer_3d',
      sub_category: 'FDM Printer',
      status: 'available',
      location: 'Station A1',
      linked_makerspace_id: 'ms-1',
      requires_certification: true,
      certification_required: '3D Printing Safety',
      last_maintenance_date: '2024-01-15',
      next_maintenance_date: '2024-02-15',
      total_usage_hours: 247.5,
      usage_count: 89,
      average_rating: 4.5,
      total_ratings: 23,
      manufacturer: 'Ultimaker',
      model: 'S3',
      hourly_rate: 12.00,
      description: 'High-precision FDM 3D printer perfect for prototyping',
      image_url: '/images/ultimaker-s3.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 'eq-2',
      equipment_id: 'LASER-001',
      name: 'Glowforge Pro',
      category: 'laser_cutter',
      sub_category: 'CO2 Laser',
      status: 'in_use',
      location: 'Station B1',
      linked_makerspace_id: 'ms-1',
      requires_certification: true,
      certification_required: 'Laser Safety Certification',
      last_maintenance_date: '2024-01-20',
      next_maintenance_date: '2024-02-20',
      total_usage_hours: 156.2,
      usage_count: 45,
      average_rating: 4.8,
      total_ratings: 18,
      manufacturer: 'Glowforge',
      model: 'Pro',
      hourly_rate: 25.00,
      description: 'Precision laser cutter for wood, acrylic, and fabric',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-20T14:20:00Z'
    },
    {
      id: 'eq-3',
      equipment_id: 'CNC-001',
      name: 'Shapeoko 4',
      category: 'cnc_machine',
      sub_category: 'Desktop CNC',
      status: 'under_maintenance',
      location: 'Station C1',
      linked_makerspace_id: 'ms-1',
      requires_certification: true,
      certification_required: 'CNC Operation Certificate',
      last_maintenance_date: '2024-01-25',
      total_usage_hours: 89.3,
      usage_count: 23,
      average_rating: 4.2,
      total_ratings: 12,
      manufacturer: 'Carbide 3D',
      model: 'Shapeoko 4',
      hourly_rate: 30.00,
      description: 'CNC machine for precision cutting and carving',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-25T09:15:00Z'
    }
  ];

  const calculateMockStats = (): EquipmentStats => {
    const total = mockEquipment.length;
    const available = mockEquipment.filter(eq => eq.status === 'available').length;
    const inUse = mockEquipment.filter(eq => eq.status === 'in_use').length;
    const maintenance = mockEquipment.filter(eq => eq.status === 'under_maintenance').length;
    const offline = mockEquipment.filter(eq => eq.status === 'offline').length;
    
    return {
      total_equipment: total,
      available_equipment: available,
      in_use_equipment: inUse,
      maintenance_equipment: maintenance,
      offline_equipment: offline,
      total_reservations_today: 8,
      utilization_rate: total > 0 ? (inUse / total) * 100 : 0,
      average_rating: 4.5,
      categories: {
        'printer_3d': 1,
        'laser_cutter': 1,
        'cnc_machine': 1
      },
      locations: {
        'Station A1': 1,
        'Station B1': 1,
        'Station C1': 1
      }
    };
  };

  // Filtered equipment
  const filteredEquipment = useMemo(() => {
    let items = equipment;

    // Role-based filtering
    if (user?.role === 'service_provider') {
      // Service providers only see their own equipment or equipment they can service
      items = items.filter(item => 
        item.linked_makerspace_id === user.makerspace_id
        // In future: || item.service_provider_ids?.includes(user.id)
      );
    } else if (user?.role !== 'super_admin') {
      // Non-super admins only see their makerspace equipment
      items = items.filter(item => item.linked_makerspace_id === user?.makerspace_id);
    }

    // Search filtering
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filtering
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Status filtering
    if (selectedStatus !== 'all') {
      items = items.filter(item => item.status === selectedStatus);
    }

    // Location filtering
    if (selectedLocation !== 'all') {
      items = items.filter(item => item.location === selectedLocation);
    }

    return items;
  }, [equipment, searchTerm, selectedCategory, selectedStatus, selectedLocation, user]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'printer_3d', label: '3D Printers' },
    { value: 'laser_cutter', label: 'Laser Cutters' },
    { value: 'cnc_machine', label: 'CNC Machines' },
    { value: 'testing_tool', label: 'Testing Tools' },
    { value: 'soldering_station', label: 'Soldering Stations' },
    { value: 'workstation', label: 'Workstations' },
    { value: 'hand_tool', label: 'Hand Tools' },
    { value: 'measuring_tool', label: 'Measuring Tools' },
    { value: 'general_tool', label: 'General Tools' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'in_use', label: 'In Use' },
    { value: 'under_maintenance', label: 'Under Maintenance' },
    { value: 'offline', label: 'Offline' }
  ];

  const locations = useMemo(() => {
    const uniqueLocations = Array.from(new Set(equipment.map(item => item.location)));
    return [
      { value: 'all', label: 'All Locations' },
      ...uniqueLocations.map(location => ({ value: location, label: location }))
    ];
  }, [equipment]);

  const handleReserveEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowReservationModal(true);
  };

  const handleMaintenanceLog = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowMaintenanceModal(true);
  };

  const handleViewDetails = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowDetailModal(true);
  };

  if (!canViewEquipment) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view equipment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipment Management</h1>
          <p className="text-gray-600">Manage and reserve makerspace equipment</p>
        </div>
        
        {canCreateEquipment && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-makrx-blue text-white rounded-lg hover:bg-makrx-blue/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Equipment
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Equipment List
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Skill Requirements
          </TabsTrigger>
        </TabsList>

        {/* Equipment List Tab */}
        <TabsContent value="equipment" className="space-y-6">
          {/* Statistics Cards */}
          {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_equipment}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.available_equipment}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                <p className="text-2xl font-bold text-gray-900">{(stats.utilization_rate || 0).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{(stats.average_rating || 0).toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Usage Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Equipment Usage Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredEquipment.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} hours`, 'Usage Hours']} />
                <Bar dataKey="total_usage_hours" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Equipment Status Overview
          </h3>
          <div className="space-y-4">
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
                    <span className="text-sm font-medium capitalize">{(status || '').replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{count} ({(percentage || 0).toFixed(0)}%)</span>
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
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-makrx-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-makrx-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
            >
              {locations.map((location) => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Equipment Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredEquipment.map((item) => (
          <EquipmentCard
            key={item.id}
            equipment={item}
            onReserve={canReserve ? handleReserveEquipment : undefined}
            onViewDetails={handleViewDetails}
            onEdit={canCreateEquipment ? (eq) => {
              setSelectedEquipment(eq);
              setShowAddModal(true);
            } : undefined}
            onMaintenance={canMaintenanceLogs ? handleMaintenanceLog : undefined}
            viewMode={viewMode}
            userRole={user?.role || 'user'}
            canReserve={canReserve}
            canEdit={canCreateEquipment}
            canMaintenance={canMaintenanceLogs}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No equipment found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedLocation !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first piece of equipment'
            }
          </p>
          {canCreateEquipment && !searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && selectedLocation === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-makrx-blue text-white rounded-lg hover:bg-makrx-blue/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Equipment
            </button>
          )}
        </div>
      )}

      {/* Reservation Modal */}
      {showReservationModal && selectedEquipment && (
        <ReservationModal
          isOpen={showReservationModal}
          onClose={() => {
            setShowReservationModal(false);
            setSelectedEquipment(null);
          }}
          equipment={selectedEquipment}
          onSubmit={async (reservationData) => {
            try {
              const authToken = localStorage.getItem('auth_token') || 'mock-token';
              const response = await fetch(`/api/v1/equipment/${selectedEquipment.id}/reserve`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(reservationData)
              });

              if (response.ok) {
                alert('Reservation submitted successfully!');
                loadEquipment(); // Refresh equipment list
              } else {
                throw new Error('Failed to create reservation');
              }
            } catch (error) {
              console.error('Error creating reservation:', error);
              alert('Failed to create reservation. Please try again.');
            }
          }}
          userProjects={[]} // Would load user projects from context
        />
        )}
        </TabsContent>

        {/* Skill Requirements Tab */}
        <TabsContent value="skills" className="space-y-6">
          <EquipmentSkillRequirements />
        </TabsContent>
      </Tabs>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <AddEquipmentModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedEquipment(null);
          }}
          editEquipment={selectedEquipment}
          onSubmit={async (equipmentData) => {
            try {
              console.log('Submitting equipment data:', equipmentData);

              const url = selectedEquipment
                ? `/api/v1/equipment/${selectedEquipment.id}`
                : '/api/v1/equipment/';

              const method = selectedEquipment ? 'PUT' : 'POST';

              console.log(`Making ${method} request to:`, url);

              const authToken = localStorage.getItem('auth_token') || 'mock-token';

              const response = await fetch(url, {
                method,
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(equipmentData)
              });

              console.log('Response status:', response.status);
              console.log('Response headers:', response.headers);

              // Read response body once
              let responseData;
              let isJson = false;

              try {
                responseData = await response.json();
                isJson = true;
              } catch (e) {
                try {
                  responseData = await response.text();
                } catch (e2) {
                  responseData = 'Unknown error';
                }
              }

              console.log('Response data:', responseData);

              if (response.ok) {
                console.log('Success response:', responseData);
                alert(selectedEquipment ? 'Equipment updated successfully!' : 'Equipment created successfully!');
                loadEquipment(); // Refresh equipment list
              } else {
                let errorMessage = `Failed to save equipment (${response.status})`;

                if (isJson && responseData.detail) {
                  errorMessage = `Failed to save equipment: ${responseData.detail}`;
                } else if (typeof responseData === 'string' && responseData) {
                  errorMessage = `Failed to save equipment: ${responseData}`;
                }

                console.error('Error response:', responseData);
                throw new Error(errorMessage);
              }
            } catch (error) {
              console.error('Error saving equipment:', error);
              alert(`Failed to save equipment: ${error.message}`);
            }
          }}
        />
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedEquipment && (
        <MaintenanceModal
          isOpen={showMaintenanceModal}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedEquipment(null);
          }}
          equipment={selectedEquipment}
          onSubmit={async (maintenanceData) => {
            try {
              const authToken = localStorage.getItem('auth_token') || 'mock-token';
              const response = await fetch(`/api/v1/equipment/${selectedEquipment.id}/maintenance`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(maintenanceData)
              });

              if (response.ok) {
                alert('Maintenance log created successfully!');
                loadEquipment(); // Refresh equipment list
              } else {
                throw new Error('Failed to create maintenance log');
              }
            } catch (error) {
              console.error('Error creating maintenance log:', error);
              alert('Failed to create maintenance log. Please try again.');
            }
          }}
        />
      )}

      {/* Equipment Detail Modal */}
      {showDetailModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedEquipment.name}</h2>
                <p className="text-sm text-gray-600">{selectedEquipment.equipment_id}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedEquipment(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6">
                {/* Equipment Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      {selectedEquipment.image_url ? (
                        <img src={selectedEquipment.image_url} alt={selectedEquipment.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Wrench className="w-16 h-16 text-gray-400" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">{selectedEquipment.location}</span>
                      </div>

                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">{(selectedEquipment.total_usage_hours || 0).toFixed(1)}h used ({selectedEquipment.usage_count || 0} sessions)</span>
                      </div>

                      {selectedEquipment.hourly_rate && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">${(selectedEquipment.hourly_rate || 0).toFixed(2)}/hour</span>
                        </div>
                      )}

                      {selectedEquipment.requires_certification && (
                        <div className="flex items-center text-amber-600">
                          <Shield className="w-4 h-4 mr-2" />
                          <span className="text-sm">Certification Required: {selectedEquipment.certification_required}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
                        <dd className="text-sm text-gray-900">{selectedEquipment.manufacturer || 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Model</dt>
                        <dd className="text-sm text-gray-900">{selectedEquipment.model || 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Category</dt>
                        <dd className="text-sm text-gray-900">{(selectedEquipment.category || '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="text-sm text-gray-900 capitalize">{(selectedEquipment.status || '').replace('_', ' ')}</dd>
                      </div>
                      {selectedEquipment.description && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="text-sm text-gray-900">{selectedEquipment.description}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Equipment Rating Component */}
                <EquipmentRating
                  equipmentId={selectedEquipment.id}
                  equipmentName={selectedEquipment.name}
                  averageRating={selectedEquipment.average_rating}
                  totalRatings={selectedEquipment.total_ratings}
                  canRate={user?.role !== 'admin'} // Admins typically don't rate equipment
                  onRatingSubmit={(rating) => {
                    // Refresh equipment data to update ratings
                    loadEquipment();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
