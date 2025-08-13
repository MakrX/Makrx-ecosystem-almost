import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import AdminAnalyticsDashboard from '../../components/AdminAnalyticsDashboard';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Settings,
  Users,
  BarChart3,
  Globe,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import MakerspaceListTable from '../../components/makerspaces/MakerspaceListTable';
import MakerspaceFormModal from '../../components/makerspaces/MakerspaceFormModal';
import MakerspaceDetail from '../../components/makerspaces/MakerspaceDetail';
import ModuleToggleCard from '../../components/makerspaces/ModuleToggleCard';

interface Makerspace {
  id: string;
  name: string;
  slug: string;
  location: string;
  address: string;
  subdomain?: string;
  createdAt: string;
  updatedAt: string;
  adminIds: string[];
  modules: string[];
  maxUsers?: number;
  maxEquipment?: number;
  timezone: string;
  country: string;
  status: 'active' | 'suspended' | 'pending';
  description?: string;
  contactEmail?: string;
  phone?: string;
  admins?: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    assignedAt: string;
  }>;
  stats?: {
    totalUsers: number;
    activeUsers: number;
    totalEquipment: number;
    activeReservations: number;
    inventoryValue: number;
    monthlyUsageHours: number;
    monthlyRevenue: number;
    projectCount: number;
    completedProjects: number;
  };
}

const Makerspaces: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();

  // Check if user has makerspaces access
  if (!hasPermission('admin', 'globalDashboard') || user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">Only Super Admins can manage makerspaces</p>
          <p className="text-sm text-gray-500">Contact your administrator for access</p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('overview');
  const [makerspaces, setMakerspaces] = useState<Makerspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [selectedMakerspace, setSelectedMakerspace] = useState<Makerspace | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchMakerspaces();
  }, [searchTerm, statusFilter]);

  const fetchMakerspaces = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/v1/makerspaces?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMakerspaces(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load makerspaces",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching makerspaces:', error);
      toast({
        title: "Error",
        description: "Failed to load makerspaces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (makerspaceId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/makerspaces/${makerspaceId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Makerspace status updated to ${newStatus}`,
        });
        fetchMakerspaces();
      } else {
        toast({
          title: "Error",
          description: "Failed to update makerspace status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update makerspace status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <PowerOff className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredMakerspaces = makerspaces.filter(ms => {
    const matchesSearch = searchTerm === '' || 
      ms.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ms.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ms.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const overviewStats = {
    total: makerspaces.length,
    active: makerspaces.filter(ms => ms.status === 'active').length,
    suspended: makerspaces.filter(ms => ms.status === 'suspended').length,
    pending: makerspaces.filter(ms => ms.status === 'pending').length,
    totalUsers: makerspaces.reduce((sum, ms) => sum + (ms.stats?.totalUsers || 0), 0),
    totalRevenue: makerspaces.reduce((sum, ms) => sum + (ms.stats?.monthlyRevenue || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Makerspaces Management
          </h1>
          <p className="text-gray-600">Manage all makerspaces across the MakrX ecosystem</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Makerspace
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Makerspaces</p>
                <p className="text-2xl font-bold text-gray-900">{overviewStats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Spaces</p>
                <p className="text-2xl font-bold text-green-600">{overviewStats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{overviewStats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${overviewStats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            All Makerspaces
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Module Management
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Admin Assignment
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Global Settings
          </TabsTrigger>
        </TabsList>

        {/* All Makerspaces Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search makerspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <MakerspaceListTable
            makerspaces={filteredMakerspaces}
            loading={loading}
            onView={setSelectedMakerspace}
            onEdit={(ms) => {
              setSelectedMakerspace(ms);
              setShowEditModal(true);
            }}
            onStatusChange={handleStatusChange}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        {/* Module Management Tab */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMakerspaces.map((makerspace) => (
              <ModuleToggleCard
                key={makerspace.id}
                makerspace={makerspace}
                onUpdate={fetchMakerspaces}
              />
            ))}
          </div>
        </TabsContent>

        {/* Other tabs content would go here */}
        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Assignment Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Admin assignment functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AdminAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Global settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showCreateModal && (
        <MakerspaceFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchMakerspaces();
          }}
        />
      )}

      {showEditModal && selectedMakerspace && (
        <MakerspaceFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          makerspace={selectedMakerspace}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedMakerspace(null);
            fetchMakerspaces();
          }}
        />
      )}

      {selectedMakerspace && !showEditModal && (
        <MakerspaceDetail
          makerspace={selectedMakerspace}
          isOpen={!!selectedMakerspace}
          onClose={() => setSelectedMakerspace(null)}
          onEdit={() => setShowEditModal(true)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default Makerspaces;
