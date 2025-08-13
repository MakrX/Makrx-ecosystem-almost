import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Wrench,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Download,
  Settings,
  Users,
  Activity,
  TrendingUp,
  FileText,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import MaintenanceLogModal from '../components/maintenance/MaintenanceLogModal';
import ScheduleMaintenanceModal from '../components/maintenance/ScheduleMaintenanceModal';
import MaintenanceStatsWidget from '../components/maintenance/MaintenanceStatsWidget';
import DowntimeTimeline from '../components/maintenance/DowntimeTimeline';

interface MaintenanceLog {
  id: string;
  equipment_id: string;
  equipment_name: string;
  makerspace_id: string;
  type: 'preventive' | 'breakdown' | 'repair' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'resolved' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  scheduled_date?: string;
  resolved_at?: string;
  estimated_duration?: number;
  actual_duration?: number;
  cost?: number;
  parts_used?: string[];
  attachments?: string[];
  notes?: string;
}

interface MaintenanceSchedule {
  id: string;
  equipment_id: string;
  equipment_name: string;
  interval_type: 'hours' | 'days' | 'weeks' | 'months';
  interval_value: number;
  last_maintenance_date: string;
  next_due_date: string;
  is_active: boolean;
  maintenance_type: string;
  responsible_team: string;
}

interface EquipmentStatus {
  equipment_id: string;
  name: string;
  status: 'available' | 'maintenance_scheduled' | 'out_of_service' | 'in_maintenance';
  current_issue?: string;
  estimated_repair_time?: string;
  last_maintenance: string;
  next_maintenance: string;
}

const Maintenance: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [equipmentStatuses, setEquipmentStatuses] = useState<EquipmentStatus[]>([]);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Check permissions - provide context for makerspace-level access
  const canAccessMaintenance = hasPermission('equipment', 'maintenance', {
    isAssignedMakerspace: true // Assume user is working within their assigned makerspace
  });

  if (!canAccessMaintenance) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You don't have permission to access maintenance management</p>
          <p className="text-sm text-gray-500">Contact your administrator for access</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = async () => {
    setLoading(true);
    try {
      // Load maintenance logs
      const logsResponse = await fetch('/api/v1/maintenance/logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        setMaintenanceLogs(logs);
      }

      // Load maintenance schedules
      const schedulesResponse = await fetch('/api/v1/maintenance/schedules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (schedulesResponse.ok) {
        const schedules = await schedulesResponse.json();
        setMaintenanceSchedules(schedules);
      }

      // Load equipment statuses
      const statusResponse = await fetch('/api/v1/maintenance/equipment-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (statusResponse.ok) {
        const statuses = await statusResponse.json();
        setEquipmentStatuses(statuses);
      }

    } catch (error) {
      console.error('Error loading maintenance data:', error);
      // Use mock data for development
      setMaintenanceLogs(getMockMaintenanceLogs());
      setMaintenanceSchedules(getMockMaintenanceSchedules());
      setEquipmentStatuses(getMockEquipmentStatuses());
    } finally {
      setLoading(false);
    }
  };

  const getMockMaintenanceLogs = (): MaintenanceLog[] => [
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
      cost: 50,
      maintenance_type: 'routine'
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

  const getMockMaintenanceSchedules = (): MaintenanceSchedule[] => [
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

  const getMockEquipmentStatuses = (): EquipmentStatus[] => [
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'maintenance_scheduled': return 'bg-blue-100 text-blue-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      case 'in_maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = maintenanceLogs.filter(log => {
    const matchesSearch = log.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const upcomingMaintenance = maintenanceSchedules.filter(schedule => 
    new Date(schedule.next_due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const outOfServiceCount = equipmentStatuses.filter(eq => eq.status === 'out_of_service').length;
  const scheduledCount = equipmentStatuses.filter(eq => eq.status === 'maintenance_scheduled').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 animate-spin" />
          <span>Loading maintenance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            Maintenance Management
          </h1>
          <p className="text-gray-600">Track, schedule, and manage equipment maintenance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowScheduleModal(true)} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
          <Button onClick={() => setShowLogModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Maintenance Log
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Service</p>
                <p className="text-2xl font-bold text-red-600">{outOfServiceCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{scheduledCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming (7 days)</p>
                <p className="text-2xl font-bold text-yellow-600">{upcomingMaintenance.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{maintenanceLogs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="logs">Maintenance Logs</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="equipment">Equipment Status</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MaintenanceStatsWidget logs={maintenanceLogs} />
            <DowntimeTimeline logs={maintenanceLogs} />
          </div>

          {/* Upcoming Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Maintenance (Next 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMaintenance.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMaintenance.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">{schedule.equipment_name}</p>
                        <p className="text-sm text-gray-600">{schedule.maintenance_type}</p>
                        <p className="text-sm text-gray-500">Due: {new Date(schedule.next_due_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">{schedule.responsible_team}</p>
                        <Badge variant="outline">
                          {schedule.interval_value} {schedule.interval_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No upcoming maintenance scheduled</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search maintenance logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="breakdown">Breakdown</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs List */}
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{log.equipment_name}</h3>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(log.priority)}>
                          {log.priority}
                        </Badge>
                        <Badge variant="outline">
                          {log.type}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{log.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Created by</p>
                          <p className="font-medium">{log.created_by}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Assigned to</p>
                          <p className="font-medium">{log.assigned_to || 'Unassigned'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Duration</p>
                          <p className="font-medium">
                            {log.estimated_duration ? `${log.estimated_duration} min (est.)` : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cost</p>
                          <p className="font-medium">{log.cost ? `$${log.cost}` : 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setShowLogModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setShowLogModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{schedule.equipment_name}</h3>
                      <p className="text-sm text-gray-600">{schedule.maintenance_type}</p>
                      <p className="text-sm text-gray-500">
                        Every {schedule.interval_value} {schedule.interval_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Next Due: {new Date(schedule.next_due_date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Team: {schedule.responsible_team}</p>
                      <Badge variant={schedule.is_active ? "default" : "secondary"}>
                        {schedule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipment Status Tab */}
        <TabsContent value="equipment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipmentStatuses.map((equipment) => (
              <Card key={equipment.equipment_id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg">{equipment.name}</h3>
                    <Badge className={getEquipmentStatusColor(equipment.status)}>
                      {equipment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {equipment.current_issue && (
                    <div className="mb-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800">Current Issue:</p>
                      <p className="text-sm text-red-600">{equipment.current_issue}</p>
                      {equipment.estimated_repair_time && (
                        <p className="text-sm text-red-500">Est. repair time: {equipment.estimated_repair_time}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Maintenance:</span>
                      <span>{new Date(equipment.last_maintenance).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Next Maintenance:</span>
                      <span>{new Date(equipment.next_maintenance).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Wrench className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showLogModal && (
        <MaintenanceLogModal
          isOpen={showLogModal}
          onClose={() => {
            setShowLogModal(false);
            setSelectedLog(null);
          }}
          log={selectedLog}
          onSave={(logData) => {
            console.log('Save log:', logData);
            setShowLogModal(false);
            setSelectedLog(null);
            loadMaintenanceData();
          }}
        />
      )}

      {showScheduleModal && (
        <ScheduleMaintenanceModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSave={(scheduleData) => {
            console.log('Save schedule:', scheduleData);
            setShowScheduleModal(false);
            loadMaintenanceData();
          }}
        />
      )}
    </div>
  );
};

export default Maintenance;
