import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  FileText,
  Bell,
  Users,
  DollarSign,
  Plus,
  Edit,
  Eye,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Battery,
  Gauge,
  ThermometerSun,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Shield,
  Cpu,
  HardDrive,
  Power,
  Wifi,
  AlertCircle,
  XCircle,
  RefreshCw,
  PlayCircle,
  StopCircle,
  Router
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  assignedTo: string;
  scheduledDate: string;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  cost?: number;
  parts: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
  completedDate?: string;
  notes?: string;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: 'operational' | 'maintenance' | 'down' | 'retired';
  location: string;
  healthScore: number;
  utilizationRate: number;
  lastMaintenance: string;
  nextMaintenance: string;
  totalDowntime: number; // in hours
  maintenanceCost: number;
  specifications: Record<string, any>;
  sensors?: Array<{
    name: string;
    value: number;
    unit: string;
    threshold: number;
    status: 'normal' | 'warning' | 'critical';
  }>;
}

interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  equipmentName: string;
  taskType: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  lastPerformed: string;
  nextDue: string;
  estimatedDuration: number;
  criticalityLevel: 'low' | 'medium' | 'high';
}

const AdvancedMaintenance: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = () => {
    // Mock maintenance tasks
    const mockTasks: MaintenanceTask[] = [
      {
        id: 'task-001',
        equipmentId: 'eq-001',
        equipmentName: 'Ultimaker S3 #001',
        type: 'preventive',
        title: 'Monthly Calibration and Cleaning',
        description: 'Perform bed leveling, extruder calibration, and general cleaning',
        priority: 'medium',
        status: 'scheduled',
        assignedTo: 'tech-001',
        scheduledDate: '2024-12-20',
        estimatedDuration: 2,
        cost: 50,
        parts: [
          { name: 'Cleaning Solution', quantity: 1, cost: 15 },
          { name: 'Nozzle Kit', quantity: 1, cost: 35 }
        ]
      },
      {
        id: 'task-002',
        equipmentId: 'eq-002',
        equipmentName: 'Haas VF-2 CNC',
        type: 'corrective',
        title: 'Spindle Bearing Replacement',
        description: 'Replace worn spindle bearings causing vibration',
        priority: 'high',
        status: 'in_progress',
        assignedTo: 'tech-002',
        scheduledDate: '2024-12-18',
        estimatedDuration: 8,
        actualDuration: 6,
        cost: 1200,
        parts: [
          { name: 'Spindle Bearing Set', quantity: 1, cost: 800 },
          { name: 'Lubricant', quantity: 2, cost: 100 }
        ]
      },
      {
        id: 'task-003',
        equipmentId: 'eq-003',
        equipmentName: 'Epilog Fusion Pro',
        type: 'emergency',
        title: 'Laser Tube Replacement',
        description: 'Emergency replacement of failed laser tube',
        priority: 'critical',
        status: 'overdue',
        assignedTo: 'tech-003',
        scheduledDate: '2024-12-15',
        estimatedDuration: 4,
        cost: 2500,
        parts: [
          { name: 'CO2 Laser Tube', quantity: 1, cost: 2200 },
          { name: 'Alignment Kit', quantity: 1, cost: 150 }
        ]
      }
    ];

    // Mock equipment data
    const mockEquipment: Equipment[] = [
      {
        id: 'eq-001',
        name: 'Ultimaker S3 #001',
        category: '3D Printer',
        model: 'S3',
        manufacturer: 'Ultimaker',
        serialNumber: 'UM3S-001-2023',
        purchaseDate: '2023-01-15',
        warrantyExpiry: '2025-01-15',
        status: 'operational',
        location: 'Zone A - Station 3',
        healthScore: 85,
        utilizationRate: 78,
        lastMaintenance: '2024-11-15',
        nextMaintenance: '2024-12-20',
        totalDowntime: 24,
        maintenanceCost: 450,
        specifications: {
          buildVolume: '230 × 190 × 200 mm',
          layerHeight: '0.1-0.4 mm',
          printSpeed: '24 mm³/s',
          nozzleTemperature: '280°C max',
          bedTemperature: '100°C max'
        },
        sensors: [
          { name: 'Nozzle Temperature', value: 210, unit: '°C', threshold: 280, status: 'normal' },
          { name: 'Bed Temperature', value: 60, unit: '°C', threshold: 100, status: 'normal' },
          { name: 'Print Head Position', value: 100, unit: 'mm', threshold: 200, status: 'normal' }
        ]
      },
      {
        id: 'eq-002',
        name: 'Haas VF-2 CNC',
        category: 'CNC Machine',
        model: 'VF-2',
        manufacturer: 'Haas',
        serialNumber: 'HAS-VF2-2022-001',
        purchaseDate: '2022-03-10',
        warrantyExpiry: '2025-03-10',
        status: 'maintenance',
        location: 'Zone B - Bay 1',
        healthScore: 72,
        utilizationRate: 65,
        lastMaintenance: '2024-12-18',
        nextMaintenance: '2025-01-18',
        totalDowntime: 48,
        maintenanceCost: 3200,
        specifications: {
          travels: 'X: 30", Y: 16", Z: 20"',
          tableSize: '36" × 14"',
          spindleSpeed: '8100 RPM',
          toolCapacity: '20 tools',
          weight: '5500 lbs'
        },
        sensors: [
          { name: 'Spindle Speed', value: 4500, unit: 'RPM', threshold: 8100, status: 'normal' },
          { name: 'Coolant Temperature', value: 75, unit: '°C', threshold: 85, status: 'warning' },
          { name: 'Vibration Level', value: 2.1, unit: 'mm/s', threshold: 3.0, status: 'normal' }
        ]
      },
      {
        id: 'eq-003',
        name: 'Epilog Fusion Pro',
        category: 'Laser Cutter',
        model: 'Fusion Pro 48',
        manufacturer: 'Epilog',
        serialNumber: 'EPL-FP48-2023-002',
        purchaseDate: '2023-06-20',
        warrantyExpiry: '2026-06-20',
        status: 'down',
        location: 'Zone C - Station 2',
        healthScore: 45,
        utilizationRate: 0,
        lastMaintenance: '2024-12-10',
        nextMaintenance: '2024-12-25',
        totalDowntime: 72,
        maintenanceCost: 5200,
        specifications: {
          cuttingArea: '48" × 36"',
          laserPower: '120W',
          resolution: '1200 DPI',
          speed: '165 IPS',
          materials: 'Wood, Acrylic, Fabric, etc.'
        },
        sensors: [
          { name: 'Laser Power', value: 0, unit: 'W', threshold: 120, status: 'critical' },
          { name: 'Exhaust Flow', value: 450, unit: 'CFM', threshold: 400, status: 'normal' },
          { name: 'Water Temperature', value: 22, unit: '°C', threshold: 25, status: 'normal' }
        ]
      }
    ];

    // Mock maintenance schedules
    const mockSchedules: MaintenanceSchedule[] = [
      {
        id: 'sched-001',
        equipmentId: 'eq-001',
        equipmentName: 'Ultimaker S3 #001',
        taskType: 'Calibration Check',
        frequency: 'monthly',
        interval: 1,
        lastPerformed: '2024-11-20',
        nextDue: '2024-12-20',
        estimatedDuration: 1,
        criticalityLevel: 'medium'
      },
      {
        id: 'sched-002',
        equipmentId: 'eq-002',
        equipmentName: 'Haas VF-2 CNC',
        taskType: 'Lubrication Service',
        frequency: 'weekly',
        interval: 1,
        lastPerformed: '2024-12-16',
        nextDue: '2024-12-23',
        estimatedDuration: 0.5,
        criticalityLevel: 'high'
      },
      {
        id: 'sched-003',
        equipmentId: 'eq-003',
        equipmentName: 'Epilog Fusion Pro',
        taskType: 'Lens Cleaning',
        frequency: 'weekly',
        interval: 1,
        lastPerformed: '2024-12-10',
        nextDue: '2024-12-17',
        estimatedDuration: 0.25,
        criticalityLevel: 'medium'
      }
    ];

    setTasks(mockTasks);
    setEquipment(mockEquipment);
    setSchedules(mockSchedules);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'down': return 'bg-red-100 text-red-800 border-red-200';
      case 'retired': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSensorStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const maintenanceStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    overdueTasks: tasks.filter(t => t.status === 'overdue').length,
    emergencyTasks: tasks.filter(t => t.type === 'emergency').length,
    totalCost: tasks.reduce((sum, task) => sum + (task.cost || 0), 0),
    avgHealthScore: Math.round(equipment.reduce((sum, eq) => sum + eq.healthScore, 0) / equipment.length),
    operationalEquipment: equipment.filter(eq => eq.status === 'operational').length,
    downEquipment: equipment.filter(eq => eq.status === 'down').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Maintenance</h1>
          <p className="text-gray-600">Comprehensive equipment lifecycle and maintenance management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{maintenanceStats.totalTasks}</p>
                <p className="text-sm text-gray-600">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{maintenanceStats.operationalEquipment}</p>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{maintenanceStats.overdueTasks}</p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${maintenanceStats.totalCost.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipment Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Equipment Health Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipment.map((eq) => (
                    <div key={eq.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{eq.name}</h4>
                          <p className="text-sm text-gray-600">{eq.category}</p>
                        </div>
                        <Badge className={getStatusColor(eq.status)}>
                          {eq.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Health Score</span>
                          <span className="font-medium">{eq.healthScore}%</span>
                        </div>
                        <Progress value={eq.healthScore} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Utilization</span>
                          <span className="font-medium">{eq.utilizationRate}%</span>
                        </div>
                        <Progress value={eq.utilizationRate} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-3">
                        <span>Last: {eq.lastMaintenance}</span>
                        <span>Next: {eq.nextMaintenance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Maintenance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedules.slice(0, 5).map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{schedule.taskType}</h4>
                        <p className="text-sm text-gray-600">{schedule.equipmentName}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          Due: {schedule.nextDue}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getPriorityColor(schedule.criticalityLevel)} variant="outline">
                          {schedule.criticalityLevel}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {schedule.estimatedDuration}h
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Critical Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'critical', message: 'Epilog Fusion Pro laser tube failure detected', time: '2 hours ago' },
                    { type: 'warning', message: 'Haas VF-2 coolant temperature above threshold', time: '4 hours ago' },
                    { type: 'info', message: 'Ultimaker S3 #001 calibration due today', time: '6 hours ago' }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      {alert.type === 'critical' && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                      {alert.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Maintenance Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12%</div>
                      <div className="text-sm text-gray-600">Cost Reduction</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">98.5%</div>
                      <div className="text-sm text-gray-600">Uptime</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Preventive Maintenance</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Emergency Repairs</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Planned Downtime</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {equipment.map((eq) => (
              <Card key={eq.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{eq.name}</CardTitle>
                      <p className="text-sm text-gray-600">{eq.manufacturer} {eq.model}</p>
                    </div>
                    <Badge className={getStatusColor(eq.status)}>
                      {eq.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Health Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{eq.healthScore}%</div>
                      <div className="text-xs text-gray-600">Health Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{eq.utilizationRate}%</div>
                      <div className="text-xs text-gray-600">Utilization</div>
                    </div>
                  </div>
                  
                  {/* Sensor Data */}
                  {eq.sensors && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Real-time Sensors</h5>
                      {eq.sensors.map((sensor, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            {getSensorStatusIcon(sensor.status)}
                            <span>{sensor.name}</span>
                          </div>
                          <span className="font-medium">
                            {sensor.value} {sensor.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Downtime:</span>
                      <div className="font-medium">{eq.totalDowntime}h</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Maint. Cost:</span>
                      <div className="font-medium">${eq.maintenanceCost}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Service:</span>
                      <div className="font-medium">{eq.lastMaintenance}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Next Service:</span>
                      <div className="font-medium">{eq.nextMaintenance}</div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-2" />
                      Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Wrench className="h-3 w-3 mr-2" />
                      Maintain
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks or equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)} variant="outline">
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {task.type}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Equipment:</span>
                          <div className="font-medium">{task.equipmentName}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Assigned To:</span>
                          <div className="font-medium">{task.assignedTo}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Scheduled:</span>
                          <div className="font-medium">{task.scheduledDate}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <div className="font-medium">{task.estimatedDuration}h est.</div>
                        </div>
                      </div>
                      
                      {task.parts.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium text-sm mb-2">Required Parts:</h5>
                          <div className="flex flex-wrap gap-2">
                            {task.parts.map((part, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {part.name} (${part.cost})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{schedule.taskType}</h3>
                      <p className="text-sm text-gray-600">{schedule.equipmentName}</p>
                    </div>
                    <Badge className={getPriorityColor(schedule.criticalityLevel)} variant="outline">
                      {schedule.criticalityLevel}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Frequency:</span>
                      <div className="font-medium capitalize">{schedule.frequency}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-medium">{schedule.estimatedDuration}h</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Done:</span>
                      <div className="font-medium">{schedule.lastPerformed}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Next Due:</span>
                      <div className="font-medium">{schedule.nextDue}</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Maintenance Cost Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Cost Trend Chart</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">$12,450</div>
                      <div className="text-xs text-gray-600">This Month</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">-8%</div>
                      <div className="text-xs text-gray-600">vs Last Month</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">$145,200</div>
                      <div className="text-xs text-gray-600">YTD Total</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipment Lifecycle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Equipment Lifecycle</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <PieChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Lifecycle Distribution</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { phase: 'New (0-2 years)', count: 5, color: 'bg-green-500' },
                      { phase: 'Prime (2-5 years)', count: 12, color: 'bg-blue-500' },
                      { phase: 'Mature (5-8 years)', count: 8, color: 'bg-yellow-500' },
                      { phase: 'End-of-Life (8+ years)', count: 3, color: 'bg-red-500' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span>{item.phase}</span>
                        </div>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Key Performance Indicators</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">98.5%</div>
                  <div className="text-sm text-gray-600 mb-2">Equipment Uptime</div>
                  <div className="text-xs text-green-600">+2.1% from last month</div>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">4.2</div>
                  <div className="text-sm text-gray-600 mb-2">Avg Response Time (hrs)</div>
                  <div className="text-xs text-blue-600">-0.8h from last month</div>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
                  <div className="text-sm text-gray-600 mb-2">Preventive Maintenance</div>
                  <div className="text-xs text-purple-600">+5% from last month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedMaintenance;
