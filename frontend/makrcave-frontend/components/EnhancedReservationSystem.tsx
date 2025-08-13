import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Users,
  Shield,
  Zap,
  Settings,
  CreditCard,
  Eye,
  Edit,
  Trash,
  Filter,
  Search,
  Download,
  Upload,
  MoreHorizontal,
  Bell,
  Star,
  Award
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays, parseISO } from 'date-fns';

interface Equipment {
  id: string;
  name: string;
  category: string;
  hourly_rate?: number;
  requires_certification: boolean;
  image_url?: string;
  location: string;
  status: string;
}

interface EnhancedReservation {
  id: string;
  equipment_id: string;
  user_id: string;
  user_name: string;
  user_membership_tier?: string;
  requested_start: string;
  requested_end: string;
  duration_hours: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled' | 'rejected';
  purpose?: string;
  project_name?: string;
  total_cost?: number;
  estimated_cost?: number;
  payment_status: string;
  required_skills_verified: boolean;
  supervisor_required: boolean;
  supervisor_assigned?: string;
  access_granted: boolean;
  is_emergency: boolean;
  priority_level: number;
  cost_breakdown: CostBreakdownItem[];
  skill_verifications: SkillVerification[];
  created_at: string;
}

interface CostBreakdownItem {
  cost_type: string;
  description: string;
  calculated_amount: number;
  is_refundable: boolean;
  rule_applied?: string;
}

interface SkillVerification {
  skill_gate_id: string;
  skill_verified: boolean;
  verification_method?: string;
  verified_by?: string;
  gate_name?: string;
}

interface CostRule {
  id: string;
  equipment_id: string;
  rule_name: string;
  rule_type: string;
  description?: string;
  base_amount?: number;
  rate_per_hour?: number;
  minimum_charge?: number;
  maximum_charge?: number;
  is_active: boolean;
  priority: number;
}

interface SkillGate {
  id: string;
  equipment_id: string;
  gate_name: string;
  gate_type: string;
  description?: string;
  required_skill_level?: string;
  required_certification?: string;
  requires_supervisor: boolean;
  enforcement_level: string;
  is_active: boolean;
}

interface EnhancedReservationSystemProps {
  equipment?: Equipment;
  mode: 'user' | 'admin';
}

const EnhancedReservationSystem: React.FC<EnhancedReservationSystemProps> = ({ equipment, mode }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservations, setReservations] = useState<EnhancedReservation[]>([]);
  const [costRules, setCostRules] = useState<CostRule[]>([]);
  const [skillGates, setSkillGates] = useState<SkillGate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reservation form state
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(equipment || null);
  const [reservationForm, setReservationForm] = useState({
    equipment_id: equipment?.id || '',
    requested_start: '',
    requested_end: '',
    purpose: '',
    project_name: '',
    user_notes: '',
    is_emergency: false,
    emergency_justification: ''
  });
  
  // Cost estimation
  const [costEstimate, setCostEstimate] = useState<any>(null);
  const [estimating, setEstimating] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReservations();
    if (mode === 'admin') {
      loadCostRules();
      loadSkillGates();
    }
  }, [equipment, mode]);

  useEffect(() => {
    if (reservationForm.requested_start && reservationForm.requested_end && reservationForm.equipment_id) {
      estimateCost();
    }
  }, [reservationForm.requested_start, reservationForm.requested_end, reservationForm.equipment_id]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const params = new URLSearchParams();
      
      if (equipment?.id) {
        params.append('equipment_id', equipment.id);
      }
      
      const response = await fetch(`/api/v1/equipment-reservations/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      } else {
        // Fallback to mock data
        setReservations(getMockReservations());
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      setReservations(getMockReservations());
    } finally {
      setLoading(false);
    }
  };

  const loadCostRules = async () => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const params = new URLSearchParams();
      
      if (equipment?.id) {
        params.append('equipment_id', equipment.id);
      }
      
      const response = await fetch(`/api/v1/equipment-reservations/cost-rules/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCostRules(data);
      } else {
        setCostRules(getMockCostRules());
      }
    } catch (error) {
      console.error('Error loading cost rules:', error);
      setCostRules(getMockCostRules());
    }
  };

  const loadSkillGates = async () => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const params = new URLSearchParams();
      
      if (equipment?.id) {
        params.append('equipment_id', equipment.id);
      }
      
      const response = await fetch(`/api/v1/equipment-reservations/skill-gates/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSkillGates(data);
      } else {
        setSkillGates(getMockSkillGates());
      }
    } catch (error) {
      console.error('Error loading skill gates:', error);
      setSkillGates(getMockSkillGates());
    }
  };

  const estimateCost = async () => {
    if (!reservationForm.equipment_id || !reservationForm.requested_start || !reservationForm.requested_end) {
      return;
    }

    try {
      setEstimating(true);
      const token = localStorage.getItem('auth_token') || 'mock-token';
      
      const response = await fetch('/api/v1/equipment-reservations/cost-estimate/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment_id: reservationForm.equipment_id,
          user_id: user?.user_id,
          requested_start: reservationForm.requested_start,
          requested_end: reservationForm.requested_end,
          membership_tier: user?.membership_tier
        }),
      });

      if (response.ok) {
        const estimate = await response.json();
        setCostEstimate(estimate);
      } else {
        // Mock cost estimate
        const duration = (new Date(reservationForm.requested_end).getTime() - new Date(reservationForm.requested_start).getTime()) / (1000 * 60 * 60);
        const baseCost = (selectedEquipment?.hourly_rate || 25) * duration;
        setCostEstimate({
          duration_hours: duration,
          base_cost: baseCost,
          total_cost: baseCost,
          deposit_required: baseCost > 100,
          deposit_amount: baseCost > 100 ? 50 : 0
        });
      }
    } catch (error) {
      console.error('Error estimating cost:', error);
    } finally {
      setEstimating(false);
    }
  };

  const createReservation = async () => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      
      const response = await fetch('/api/v1/equipment-reservations/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationForm),
      });

      if (response.ok) {
        alert('Reservation created successfully!');
        setShowReservationForm(false);
        setReservationForm({
          equipment_id: equipment?.id || '',
          requested_start: '',
          requested_end: '',
          purpose: '',
          project_name: '',
          user_notes: '',
          is_emergency: false,
          emergency_justification: ''
        });
        loadReservations();
      } else {
        const error = await response.json();
        alert(`Failed to create reservation: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Failed to create reservation. Please try again.');
    }
  };

  const approveReservation = async (reservationId: string, approved: boolean, adminNotes?: string) => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      
      const response = await fetch(`/api/v1/equipment-reservations/${reservationId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved,
          admin_notes: adminNotes,
          rejection_reason: approved ? null : adminNotes
        }),
      });

      if (response.ok) {
        alert(`Reservation ${approved ? 'approved' : 'rejected'} successfully!`);
        loadReservations();
      } else {
        alert('Failed to update reservation status.');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert('Failed to update reservation. Please try again.');
    }
  };

  const getMockReservations = (): EnhancedReservation[] => [
    {
      id: 'res-1',
      equipment_id: 'eq-1',
      user_id: 'user-1',
      user_name: 'John Maker',
      user_membership_tier: 'premium',
      requested_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      requested_end: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
      duration_hours: 3,
      status: 'pending',
      purpose: 'Prototype development for IoT project',
      project_name: 'Smart Home Controller',
      total_cost: 75,
      estimated_cost: 75,
      payment_status: 'pending',
      required_skills_verified: true,
      supervisor_required: false,
      access_granted: false,
      is_emergency: false,
      priority_level: 0,
      cost_breakdown: [
        {
          cost_type: 'base_rate',
          description: 'Equipment usage (3.0 hours)',
          calculated_amount: 75,
          is_refundable: true,
          rule_applied: 'Standard Hourly Rate'
        }
      ],
      skill_verifications: [
        {
          skill_gate_id: 'sg-1',
          skill_verified: true,
          verification_method: 'auto',
          verified_by: 'system',
          gate_name: '3D Printing Safety'
        }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 'res-2',
      equipment_id: 'eq-2',
      user_id: 'user-2',
      user_name: 'Sarah Designer',
      user_membership_tier: 'basic',
      requested_start: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      requested_end: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
      duration_hours: 2,
      status: 'approved',
      purpose: 'Laser cutting acrylic panels',
      project_name: 'LED Art Installation',
      total_cost: 50,
      estimated_cost: 50,
      payment_status: 'paid',
      required_skills_verified: true,
      supervisor_required: true,
      supervisor_assigned: 'Alex Supervisor',
      access_granted: true,
      is_emergency: false,
      priority_level: 0,
      cost_breakdown: [
        {
          cost_type: 'base_rate',
          description: 'Equipment usage (2.0 hours)',
          calculated_amount: 50,
          is_refundable: true,
          rule_applied: 'Standard Hourly Rate'
        }
      ],
      skill_verifications: [
        {
          skill_gate_id: 'sg-2',
          skill_verified: true,
          verification_method: 'manual',
          verified_by: 'Alex Supervisor',
          gate_name: 'Laser Safety Certification'
        }
      ],
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getMockCostRules = (): CostRule[] => [
    {
      id: 'cr-1',
      equipment_id: 'eq-1',
      rule_name: 'Standard Hourly Rate',
      rule_type: 'hourly_rate',
      description: 'Standard hourly pricing for 3D printer',
      rate_per_hour: 25,
      minimum_charge: 10,
      is_active: true,
      priority: 1
    },
    {
      id: 'cr-2',
      equipment_id: 'eq-1',
      rule_name: 'Premium Member Discount',
      rule_type: 'membership_discount',
      description: '10% discount for premium members',
      is_active: true,
      priority: 2
    }
  ];

  const getMockSkillGates = (): SkillGate[] => [
    {
      id: 'sg-1',
      equipment_id: 'eq-1',
      gate_name: '3D Printing Safety',
      gate_type: 'required_skill',
      description: 'Basic 3D printing safety and operation knowledge required',
      required_skill_level: 'beginner',
      requires_supervisor: false,
      enforcement_level: 'block',
      is_active: true
    },
    {
      id: 'sg-2',
      equipment_id: 'eq-2',
      gate_name: 'Laser Safety Certification',
      gate_type: 'certification',
      description: 'Valid laser safety certification required',
      required_certification: 'Laser Safety Level 2',
      requires_supervisor: true,
      enforcement_level: 'block',
      is_active: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (level: number) => {
    if (level >= 3) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (level >= 2) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    if (level >= 1) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return null;
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    const matchesSearch = !searchTerm || 
      reservation.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {equipment ? `${equipment.name} Reservations` : 'Equipment Reservations'}
          </h2>
          <p className="text-gray-600">
            Manage equipment reservations with cost rules and skill gating
          </p>
        </div>
        
        {mode === 'user' && equipment && (
          <Button onClick={() => setShowReservationForm(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="cost-rules" disabled={mode !== 'admin'}>Cost Rules</TabsTrigger>
          <TabsTrigger value="skill-gates" disabled={mode !== 'admin'}>Skill Gates</TabsTrigger>
          <TabsTrigger value="analytics" disabled={mode !== 'admin'}>Analytics</TabsTrigger>
        </TabsList>

        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search reservations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reservations List */}
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{reservation.user_name}</span>
                          {reservation.user_membership_tier && (
                            <Badge variant="outline" className="text-xs">
                              {reservation.user_membership_tier}
                            </Badge>
                          )}
                        </div>
                        
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status}
                        </Badge>
                        
                        {getPriorityIcon(reservation.priority_level)}
                        
                        {reservation.is_emergency && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Emergency
                          </Badge>
                        )}
                      </div>

                      {/* Timing */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(parseISO(reservation.requested_start), 'MMM dd, HH:mm')} - 
                            {format(parseISO(reservation.requested_end), 'HH:mm')}
                          </span>
                        </div>
                        <span>({reservation.duration_hours}h)</span>
                        
                        {reservation.total_cost && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${reservation.total_cost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Purpose and Project */}
                      {(reservation.purpose || reservation.project_name) && (
                        <div className="text-sm">
                          {reservation.project_name && (
                            <p><strong>Project:</strong> {reservation.project_name}</p>
                          )}
                          {reservation.purpose && (
                            <p><strong>Purpose:</strong> {reservation.purpose}</p>
                          )}
                        </div>
                      )}

                      {/* Status Indicators */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className={`flex items-center gap-1 ${reservation.required_skills_verified ? 'text-green-600' : 'text-red-600'}`}>
                          <Shield className="h-3 w-3" />
                          <span>Skills {reservation.required_skills_verified ? 'Verified' : 'Pending'}</span>
                        </div>
                        
                        {reservation.supervisor_required && (
                          <div className={`flex items-center gap-1 ${reservation.supervisor_assigned ? 'text-green-600' : 'text-yellow-600'}`}>
                            <Users className="h-3 w-3" />
                            <span>Supervisor {reservation.supervisor_assigned ? 'Assigned' : 'Required'}</span>
                          </div>
                        )}
                        
                        <div className={`flex items-center gap-1 ${reservation.access_granted ? 'text-green-600' : 'text-gray-600'}`}>
                          <CheckCircle className="h-3 w-3" />
                          <span>Access {reservation.access_granted ? 'Granted' : 'Pending'}</span>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      {reservation.cost_breakdown.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-sm font-medium mb-2">Cost Breakdown</h4>
                          <div className="space-y-1">
                            {reservation.cost_breakdown.map((item, index) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span>{item.description}</span>
                                <span className={item.calculated_amount < 0 ? 'text-green-600' : ''}>
                                  ${item.calculated_amount.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {mode === 'admin' && reservation.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveReservation(reservation.id, true, 'Approved by admin')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) {
                                approveReservation(reservation.id, false, reason);
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {(reservation.user_id === user?.user_id || mode === 'admin') && (
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {reservation.status === 'pending' && (
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReservations.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No reservations have been made yet'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cost Rules Tab */}
        <TabsContent value="cost-rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Cost Rules</h3>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="space-y-4">
            {costRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{rule.rule_name}</h4>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <Badge variant="outline">{rule.rule_type}</Badge>
                        {rule.rate_per_hour && (
                          <span>${rule.rate_per_hour}/hour</span>
                        )}
                        {rule.base_amount && (
                          <span>${rule.base_amount} flat</span>
                        )}
                        <span>Priority: {rule.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Skill Gates Tab */}
        <TabsContent value="skill-gates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Skill Gates</h3>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Add Gate
            </Button>
          </div>

          <div className="space-y-4">
            {skillGates.map((gate) => (
              <Card key={gate.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{gate.gate_name}</h4>
                      <p className="text-sm text-gray-600">{gate.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <Badge variant="outline">{gate.gate_type}</Badge>
                        {gate.required_skill_level && (
                          <span>Level: {gate.required_skill_level}</span>
                        )}
                        {gate.required_certification && (
                          <span>Cert: {gate.required_certification}</span>
                        )}
                        {gate.requires_supervisor && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Users className="h-3 w-3 mr-1" />
                            Supervisor Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${gate.enforcement_level === 'block' ? 'bg-red-100 text-red-800' : 
                                        gate.enforcement_level === 'warn' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-blue-100 text-blue-800'}`}>
                        {gate.enforcement_level}
                      </Badge>
                      <Badge className={gate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {gate.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reservations</p>
                    <p className="text-2xl font-bold">{reservations.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold">
                      ${reservations.reduce((sum, r) => sum + (r.total_cost || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Duration</p>
                    <p className="text-2xl font-bold">
                      {reservations.length > 0 ? 
                        (reservations.reduce((sum, r) => sum + r.duration_hours, 0) / reservations.length).toFixed(1) : 
                        '0'
                      }h
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reservation Form Modal */}
      {showReservationForm && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Reserve {selectedEquipment.name}</h3>
                <Button variant="ghost" onClick={() => setShowReservationForm(false)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Equipment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {selectedEquipment.image_url ? (
                        <img src={selectedEquipment.image_url} alt={selectedEquipment.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Settings className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedEquipment.name}</h4>
                      <p className="text-sm text-gray-600">{selectedEquipment.location}</p>
                      {selectedEquipment.hourly_rate && (
                        <p className="text-sm font-medium">${selectedEquipment.hourly_rate}/hour</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time</label>
                    <Input
                      type="datetime-local"
                      value={reservationForm.requested_start}
                      onChange={(e) => setReservationForm({ ...reservationForm, requested_start: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Time</label>
                    <Input
                      type="datetime-local"
                      value={reservationForm.requested_end}
                      onChange={(e) => setReservationForm({ ...reservationForm, requested_end: e.target.value })}
                      min={reservationForm.requested_start}
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium mb-2">Purpose</label>
                  <Textarea
                    value={reservationForm.purpose}
                    onChange={(e) => setReservationForm({ ...reservationForm, purpose: e.target.value })}
                    placeholder="What will you be using this equipment for?"
                    rows={3}
                  />
                </div>

                {/* Project */}
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name (Optional)</label>
                  <Input
                    value={reservationForm.project_name}
                    onChange={(e) => setReservationForm({ ...reservationForm, project_name: e.target.value })}
                    placeholder="Associate with a project"
                  />
                </div>

                {/* Emergency */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency"
                    checked={reservationForm.is_emergency}
                    onCheckedChange={(checked) => setReservationForm({ ...reservationForm, is_emergency: checked as boolean })}
                  />
                  <label htmlFor="emergency" className="text-sm font-medium">
                    Emergency reservation
                  </label>
                </div>

                {reservationForm.is_emergency && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Emergency Justification</label>
                    <Textarea
                      value={reservationForm.emergency_justification}
                      onChange={(e) => setReservationForm({ ...reservationForm, emergency_justification: e.target.value })}
                      placeholder="Explain why this is an emergency"
                      rows={2}
                    />
                  </div>
                )}

                {/* Cost Estimate */}
                {costEstimate && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Cost Estimate</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{costEstimate.duration_hours?.toFixed(1)} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Cost:</span>
                        <span>${costEstimate.base_cost?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>${costEstimate.total_cost?.toFixed(2)}</span>
                      </div>
                      {costEstimate.deposit_required && (
                        <div className="flex justify-between text-orange-600">
                          <span>Deposit Required:</span>
                          <span>${costEstimate.deposit_amount?.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Notes</label>
                  <Textarea
                    value={reservationForm.user_notes}
                    onChange={(e) => setReservationForm({ ...reservationForm, user_notes: e.target.value })}
                    placeholder="Any special requirements or notes"
                    rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setShowReservationForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createReservation}
                    disabled={!reservationForm.requested_start || !reservationForm.requested_end || estimating}
                  >
                    {estimating ? 'Calculating...' : 'Create Reservation'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedReservationSystem;
