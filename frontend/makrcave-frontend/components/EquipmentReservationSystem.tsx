import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Camera,
  QrCode,
  Wrench,
  FileText,
  Download,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash,
  Eye,
  BarChart3
} from 'lucide-react';
import { format, addHours, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useMakerspace } from '../contexts/MakerspaceContext';
import { formatUserDisplayName } from '../lib/userUtils';
import { EquipmentAccessPolicy } from '../types/equipment-access';
import { EquipmentBillingService } from '../services/billingService';
import ReservationWithBilling from './ReservationWithBilling';
import EquipmentAccessPricingManager from './EquipmentAccessPricingManager';
import { api } from '../services/apiService';

// Interfaces for the reservation system
interface EquipmentReservation {
  id: string;
  equipment_id: string;
  equipment_name: string;
  user_id: string;
  user_name: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled' | 'no_show';
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
  grace_period_minutes?: number;
}

interface EquipmentPolicy {
  equipment_id: string;
  requires_approval: boolean;
  max_duration_minutes: number;
  cooldown_minutes: number;
  skill_gate_badge_id?: string;
  required_badges: string[];
  buffer_between_reservations: number;
  time_slot_granularity: number; // 15, 30, or 60 minutes
  auto_approve: boolean;
  maintenance_blocks: MaintenanceBlock[];
  visibility_in_calendar: boolean;
  after_hours_restriction: boolean;
  guest_user_restriction: boolean;
}

interface MaintenanceBlock {
  id: string;
  start_time: string;
  end_time: string;
  reason: string;
  recurring?: 'weekly' | 'monthly' | 'none';
}

interface ReservationFormData {
  equipment_id: string;
  date: Date;
  start_time: string;
  end_time: string;
  purpose: string;
  notes: string;
  linked_project_id?: string;
  attached_files: File[];
}

interface EquipmentReservationSystemProps {
  className?: string;
}

const EquipmentReservationSystem: React.FC<EquipmentReservationSystemProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { equipment } = useMakerspace();
  
  // State management
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reservations, setReservations] = useState<EquipmentReservation[]>([]);
  const [policies, setPolicies] = useState<EquipmentPolicy[]>([]);
  const [accessPolicies, setAccessPolicies] = useState<EquipmentAccessPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<ReservationFormData>({
    equipment_id: '',
    date: new Date(),
    start_time: '09:00',
    end_time: '10:00',
    purpose: '',
    notes: '',
    attached_files: []
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEquipment, setFilterEquipment] = useState<string>('all');

  // Mock data for development
  const mockReservations: EquipmentReservation[] = [
    {
      id: 'res-1',
      equipment_id: 'eq-1',
      equipment_name: 'Prusa i3 MK3S+',
      user_id: 'user-1',
      user_name: 'John Maker',
      start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      end_time: new Date(Date.now() + 86400000 + 14400000).toISOString(), // Tomorrow + 4 hours
      status: 'approved',
      purpose: 'Prototype printing for IoT housing',
      notes: 'Using PLA filament, estimated 3.5 hours',
      linked_project_id: 'proj-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_by: 'admin-1'
    },
    {
      id: 'res-2',
      equipment_id: 'eq-3',
      equipment_name: 'Glowforge Pro',
      user_id: 'user-2',
      user_name: 'Sarah Designer',
      start_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      end_time: new Date(Date.now() + 172800000 + 5400000).toISOString(), // +1.5 hours
      status: 'pending',
      purpose: 'Acrylic panel cutting for display case',
      notes: 'Need to review material safety guidelines',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'res-3',
      equipment_id: 'eq-1',
      equipment_name: 'Prusa i3 MK3S+',
      user_id: 'user-3',
      user_name: 'Mike Creator',
      start_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      end_time: new Date(Date.now() - 86400000 + 10800000).toISOString(), // Yesterday + 3 hours
      status: 'completed',
      purpose: 'Print drone frame components',
      checked_in_at: new Date(Date.now() - 86400000).toISOString(),
      checked_out_at: new Date(Date.now() - 86400000 + 10800000).toISOString(),
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const mockPolicies: EquipmentPolicy[] = [
    {
      equipment_id: 'eq-1',
      requires_approval: false,
      max_duration_minutes: 480, // 8 hours
      cooldown_minutes: 30,
      required_badges: ['3D Printing', 'Safety Certified'],
      buffer_between_reservations: 15,
      time_slot_granularity: 30,
      auto_approve: true,
      maintenance_blocks: [],
      visibility_in_calendar: true,
      after_hours_restriction: false,
      guest_user_restriction: false
    },
    {
      equipment_id: 'eq-3',
      requires_approval: true,
      max_duration_minutes: 240, // 4 hours
      cooldown_minutes: 60,
      required_badges: ['Laser Safety', 'Material Safety'],
      buffer_between_reservations: 30,
      time_slot_granularity: 30,
      auto_approve: false,
      maintenance_blocks: [
        {
          id: 'maint-1',
          start_time: '2024-02-15T09:00:00Z',
          end_time: '2024-02-15T17:00:00Z',
          reason: 'Monthly maintenance and calibration'
        }
      ],
      visibility_in_calendar: true,
      after_hours_restriction: true,
      guest_user_restriction: true
    }
  ];

  useEffect(() => {
    if (user) {
      loadReservationsData();
    }
  }, [user]);

  const loadReservationsData = async () => {
    setLoading(true);
    try {
      // Load reservations from API
      const reservationsResponse = await api.reservations.getAllReservations();
      if (reservationsResponse.data) {
        setReservations(reservationsResponse.data);
      } else {
        // Fallback to mock data if API fails
        setReservations(mockReservations);
      }

      // Initialize access policies (mock for now, could be from API)
      const mockAccessPolicies: EquipmentAccessPolicy[] = equipment.map(eq => ({
        id: `access-policy-${eq.id}`,
        equipment_id: eq.id,
        access_type: eq.type === 'workstation' ? 'free' : eq.type === 'printer_3d' ? 'subscription_only' : 'pay_per_use',
        membership_required: eq.type !== 'workstation',
        price_per_unit: eq.type === 'laser_cutter' ? 150 : eq.type === 'cnc_machine' ? 200 : undefined,
        cost_unit: eq.type === 'laser_cutter' || eq.type === 'cnc_machine' ? 'hour' : undefined,
        minimum_billing_time: eq.type === 'laser_cutter' ? 15 : eq.type === 'cnc_machine' ? 30 : undefined,
        grace_period_minutes: 5,
        max_daily_cap: eq.type === 'laser_cutter' ? 500 : eq.type === 'cnc_machine' ? 800 : undefined,
        overuse_penalty_flat: 50,
        overuse_penalty_percent: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user?.id || 'admin'
      }));
      setAccessPolicies(mockAccessPolicies);
      setPolicies(mockPolicies);

    } catch (error) {
      console.error('Failed to load reservations data:', error);
      // Fallback to mock data
      setReservations(mockReservations);
      setPolicies(mockPolicies);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'no_show': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'active': return <User className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      case 'no_show': return <AlertCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const isSlotAvailable = (equipmentId: string, startTime: Date, endTime: Date) => {
    const conflictingReservations = reservations.filter(res => 
      res.equipment_id === equipmentId &&
      res.status !== 'cancelled' &&
      res.status !== 'rejected' &&
      res.status !== 'no_show' &&
      (
        isWithinInterval(startTime, { start: new Date(res.start_time), end: new Date(res.end_time) }) ||
        isWithinInterval(endTime, { start: new Date(res.start_time), end: new Date(res.end_time) }) ||
        isWithinInterval(new Date(res.start_time), { start: startTime, end: endTime })
      )
    );
    return conflictingReservations.length === 0;
  };

  const hasRequiredBadges = (equipmentId: string) => {
    const policy = policies.find(p => p.equipment_id === equipmentId);
    if (!policy || !policy.required_badges.length) return true;
    
    // This would check against user's actual badges in a real implementation
    // For now, we'll assume the user has basic badges
    const userBadges = ['3D Printing', 'Safety Certified']; // Mock user badges
    return policy.required_badges.every(badge => userBadges.includes(badge));
  };

  const validateReservationTime = (equipmentId: string, startTime: Date, endTime: Date) => {
    const policy = policies.find(p => p.equipment_id === equipmentId);
    if (!policy) return { valid: true, message: '' };

    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    if (durationMinutes > policy.max_duration_minutes) {
      return { 
        valid: false, 
        message: `Maximum duration is ${Math.floor(policy.max_duration_minutes / 60)} hours ${policy.max_duration_minutes % 60} minutes` 
      };
    }

    if (!isSlotAvailable(equipmentId, startTime, endTime)) {
      return { valid: false, message: 'Time slot conflicts with existing reservation' };
    }

    if (!hasRequiredBadges(equipmentId)) {
      const requiredBadges = policy.required_badges.join(', ');
      return { valid: false, message: `Required badges: ${requiredBadges}` };
    }

    return { valid: true, message: '' };
  };

  const handleCreateReservation = async () => {
    if (!formData.equipment_id || !formData.purpose.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const startDateTime = new Date(formData.date);
    const [startHour, startMinute] = formData.start_time.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(formData.date);
    const [endHour, endMinute] = formData.end_time.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const validation = validateReservationTime(formData.equipment_id, startDateTime, endDateTime);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    const newReservation: EquipmentReservation = {
      id: `res-${Date.now()}`,
      equipment_id: formData.equipment_id,
      equipment_name: equipment.find(e => e.id === formData.equipment_id)?.name || 'Unknown Equipment',
      user_id: user?.id || 'current-user',
      user_name: formatUserDisplayName(user),
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: policies.find(p => p.equipment_id === formData.equipment_id)?.auto_approve ? 'approved' : 'pending',
      purpose: formData.purpose,
      notes: formData.notes,
      linked_project_id: formData.linked_project_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setReservations(prev => [...prev, newReservation]);
    setShowCreateModal(false);
    setFormData({
      equipment_id: '',
      date: new Date(),
      start_time: '09:00',
      end_time: '10:00',
      purpose: '',
      notes: '',
      attached_files: []
    });
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filterStatus !== 'all' && reservation.status !== filterStatus) return false;
    if (filterEquipment !== 'all' && reservation.equipment_id !== filterEquipment) return false;
    return true;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipment Reservations</h2>
          <p className="text-gray-600">Schedule and manage equipment usage</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Reservation
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reservations.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reservations.filter(r => 
                    r.status === 'active' || r.status === 'approved' &&
                    format(new Date(r.start_time), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ).length}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {reservations.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Equipment Available</p>
                <p className="text-2xl font-bold text-purple-600">
                  {equipment.filter(e => e.status === 'available').length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Reservations Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="list">Reservations List</TabsTrigger>
              <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
              <TabsTrigger value="settings">Equipment Settings</TabsTrigger>
              <TabsTrigger value="pricing">Access & Pricing</TabsTrigger>
            </TabsList>
          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment</SelectItem>
                  {equipment.map(eq => (
                    <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="border rounded-md"
              />
            </div>

            {/* Time slot grid would go here - simplified for now */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-4">
                Schedule for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {filteredReservations
                  .filter(res => format(new Date(res.start_time), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
                  .map(reservation => (
                    <div key={reservation.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusIcon(reservation.status)}
                          {reservation.status}
                        </Badge>
                        <div>
                          <p className="font-medium">{reservation.equipment_name}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(reservation.start_time), 'HH:mm')} - {format(new Date(reservation.end_time), 'HH:mm')}
                          </p>
                          {accessPolicies.find(p => p.equipment_id === reservation.equipment_id) && (
                            <p className="text-xs text-purple-600">
                              {EquipmentBillingService.getPricingDisplay(
                                accessPolicies.find(p => p.equipment_id === reservation.equipment_id)!
                              )}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{reservation.user_name}</p>
                          <p className="text-sm text-gray-600">{reservation.purpose}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user?.id === reservation.user_id && (
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                {filteredReservations.filter(res => 
                  format(new Date(res.start_time), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                ).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No reservations for this date</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterEquipment} onValueChange={setFilterEquipment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment</SelectItem>
                  {equipment.map(eq => (
                    <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setReservations([...mockReservations])}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {filteredReservations.map(reservation => (
                <Card key={reservation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusIcon(reservation.status)}
                          {reservation.status}
                        </Badge>
                        <div>
                          <h4 className="font-semibold">{reservation.equipment_name}</h4>
                          <p className="text-sm text-gray-600">{reservation.user_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{reservation.purpose}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(reservation.start_time), 'MMM d, HH:mm')} - {format(new Date(reservation.end_time), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user?.id === reservation.user_id && (
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Popular Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {equipment.slice(0, 3).map(eq => {
                      const reservationCount = reservations.filter(r => r.equipment_id === eq.id).length;
                      return (
                        <div key={eq.id} className="flex items-center justify-between">
                          <span className="font-medium">{eq.name}</span>
                          <Badge variant="outline">{reservationCount} reservations</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Utilization Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Analytics charts would be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {equipment.map(eq => {
                const policy = policies.find(p => p.equipment_id === eq.id);
                return (
                  <Card key={eq.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {eq.name}
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Requires Approval</span>
                        <Switch checked={policy?.requires_approval || false} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auto Approve</span>
                        <Switch checked={policy?.auto_approve || false} />
                      </div>
                      <div>
                        <Label className="text-sm">Max Duration (hours)</Label>
                        <Input 
                          type="number" 
                          value={policy ? Math.floor(policy.max_duration_minutes / 60) : 8}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Required Badges</Label>
                        <Input 
                          value={policy?.required_badges.join(', ') || ''}
                          placeholder="Safety Certified, Equipment Training"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <EquipmentAccessPricingManager />
          </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Reservation Modal with Billing */}
      <ReservationWithBilling
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onReservationCreated={() => {
          setShowCreateModal(false);
          // Refresh reservations
          setReservations([...mockReservations]);
        }}
        policies={accessPolicies}
      />
    </div>
  );
};

export default EquipmentReservationSystem;
