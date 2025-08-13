import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Settings, 
  Save, 
  Plus, 
  Trash, 
  Clock, 
  Shield, 
  Users, 
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Edit,
  Copy,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { useMakerspace } from '../contexts/MakerspaceContext';

interface EquipmentPolicy {
  equipment_id: string;
  equipment_name: string;
  requires_approval: boolean;
  max_duration_minutes: number;
  cooldown_minutes: number;
  required_badges: string[];
  buffer_between_reservations: number;
  time_slot_granularity: number;
  auto_approve: boolean;
  visibility_in_calendar: boolean;
  after_hours_restriction: boolean;
  guest_user_restriction: boolean;
  maintenance_blocks: MaintenanceBlock[];
  operating_hours: OperatingHours;
  skill_requirements: SkillRequirement[];
  cost_per_hour?: number;
  grace_period_minutes: number;
  max_advance_booking_days: number;
}

interface MaintenanceBlock {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  reason: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
}

interface OperatingHours {
  monday: { enabled: boolean; start: string; end: string };
  tuesday: { enabled: boolean; start: string; end: string };
  wednesday: { enabled: boolean; start: string; end: string };
  thursday: { enabled: boolean; start: string; end: string };
  friday: { enabled: boolean; start: string; end: string };
  saturday: { enabled: boolean; start: string; end: string };
  sunday: { enabled: boolean; start: string; end: string };
}

interface SkillRequirement {
  id: string;
  skill_name: string;
  minimum_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  certification_required: boolean;
  training_module_id?: string;
}

interface EquipmentPolicyManagerProps {
  className?: string;
}

const EquipmentPolicyManager: React.FC<EquipmentPolicyManagerProps> = ({ className = '' }) => {
  const { equipment } = useMakerspace();
  const [policies, setPolicies] = useState<EquipmentPolicy[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [currentPolicy, setCurrentPolicy] = useState<EquipmentPolicy | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Default operating hours
  const defaultOperatingHours: OperatingHours = {
    monday: { enabled: true, start: '08:00', end: '18:00' },
    tuesday: { enabled: true, start: '08:00', end: '18:00' },
    wednesday: { enabled: true, start: '08:00', end: '18:00' },
    thursday: { enabled: true, start: '08:00', end: '18:00' },
    friday: { enabled: true, start: '08:00', end: '18:00' },
    saturday: { enabled: true, start: '10:00', end: '16:00' },
    sunday: { enabled: false, start: '10:00', end: '16:00' }
  };

  // Mock data initialization
  const initializePolicies = () => {
    const mockPolicies: EquipmentPolicy[] = equipment.map(eq => ({
      equipment_id: eq.id,
      equipment_name: eq.name,
      requires_approval: eq.type === 'laser_cutter' || eq.type === 'cnc_machine',
      max_duration_minutes: eq.type === 'printer_3d' ? 480 : 240, // 8 hours for 3D printers, 4 for others
      cooldown_minutes: 30,
      required_badges: eq.requiredCertifications || [],
      buffer_between_reservations: 15,
      time_slot_granularity: 30,
      auto_approve: eq.type === 'printer_3d',
      visibility_in_calendar: true,
      after_hours_restriction: eq.type === 'laser_cutter',
      guest_user_restriction: eq.type !== 'workstation',
      maintenance_blocks: [],
      operating_hours: defaultOperatingHours,
      skill_requirements: [],
      cost_per_hour: eq.hourlyRate,
      grace_period_minutes: 15,
      max_advance_booking_days: 30
    }));
    setPolicies(mockPolicies);
    
    if (mockPolicies.length > 0) {
      setSelectedEquipment(mockPolicies[0].equipment_id);
      setCurrentPolicy(mockPolicies[0]);
    }
  };

  useEffect(() => {
    initializePolicies();
  }, [equipment]);

  useEffect(() => {
    if (selectedEquipment) {
      const policy = policies.find(p => p.equipment_id === selectedEquipment);
      setCurrentPolicy(policy || null);
      setHasUnsavedChanges(false);
    }
  }, [selectedEquipment, policies]);

  const updatePolicy = (updates: Partial<EquipmentPolicy>) => {
    if (!currentPolicy) return;
    
    const updatedPolicy = { ...currentPolicy, ...updates };
    setCurrentPolicy(updatedPolicy);
    setHasUnsavedChanges(true);
  };

  const updateOperatingHours = (day: keyof OperatingHours, updates: Partial<OperatingHours[typeof day]>) => {
    if (!currentPolicy) return;
    
    const updatedHours = {
      ...currentPolicy.operating_hours,
      [day]: { ...currentPolicy.operating_hours[day], ...updates }
    };
    updatePolicy({ operating_hours: updatedHours });
  };

  const addMaintenanceBlock = () => {
    if (!currentPolicy) return;
    
    const newBlock: MaintenanceBlock = {
      id: `maint-${Date.now()}`,
      title: 'Maintenance Block',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
      reason: '',
      recurring: 'none',
      is_active: true
    };
    
    updatePolicy({
      maintenance_blocks: [...currentPolicy.maintenance_blocks, newBlock]
    });
  };

  const updateMaintenanceBlock = (id: string, updates: Partial<MaintenanceBlock>) => {
    if (!currentPolicy) return;
    
    const updatedBlocks = currentPolicy.maintenance_blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    );
    updatePolicy({ maintenance_blocks: updatedBlocks });
  };

  const removeMaintenanceBlock = (id: string) => {
    if (!currentPolicy) return;
    
    const updatedBlocks = currentPolicy.maintenance_blocks.filter(block => block.id !== id);
    updatePolicy({ maintenance_blocks: updatedBlocks });
  };

  const addSkillRequirement = () => {
    if (!currentPolicy) return;
    
    const newRequirement: SkillRequirement = {
      id: `skill-${Date.now()}`,
      skill_name: '',
      minimum_level: 'basic',
      certification_required: false
    };
    
    updatePolicy({
      skill_requirements: [...currentPolicy.skill_requirements, newRequirement]
    });
  };

  const updateSkillRequirement = (id: string, updates: Partial<SkillRequirement>) => {
    if (!currentPolicy) return;
    
    const updatedRequirements = currentPolicy.skill_requirements.map(req =>
      req.id === id ? { ...req, ...updates } : req
    );
    updatePolicy({ skill_requirements: updatedRequirements });
  };

  const removeSkillRequirement = (id: string) => {
    if (!currentPolicy) return;
    
    const updatedRequirements = currentPolicy.skill_requirements.filter(req => req.id !== id);
    updatePolicy({ skill_requirements: updatedRequirements });
  };

  const savePolicy = async () => {
    if (!currentPolicy) return;
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPolicies(prev => prev.map(p => 
        p.equipment_id === currentPolicy.equipment_id ? currentPolicy : p
      ));
      setHasUnsavedChanges(false);
      alert('Policy saved successfully!');
    } catch (error) {
      alert('Failed to save policy. Please try again.');
    }
  };

  const resetPolicy = () => {
    if (!selectedEquipment) return;
    
    const originalPolicy = policies.find(p => p.equipment_id === selectedEquipment);
    if (originalPolicy) {
      setCurrentPolicy({ ...originalPolicy });
      setHasUnsavedChanges(false);
    }
  };

  const copyPolicyFrom = (sourceEquipmentId: string) => {
    const sourcePolicy = policies.find(p => p.equipment_id === sourceEquipmentId);
    if (!sourcePolicy || !currentPolicy) return;
    
    const copiedPolicy = {
      ...sourcePolicy,
      equipment_id: currentPolicy.equipment_id,
      equipment_name: currentPolicy.equipment_name
    };
    setCurrentPolicy(copiedPolicy);
    setHasUnsavedChanges(true);
  };

  if (!currentPolicy) {
    return (
      <div className={`p-6 ${className}`}>
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Equipment Selected</h3>
            <p className="text-gray-600">Select equipment to configure its reservation policy</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipment Policy Manager</h2>
          <p className="text-gray-600">Configure reservation rules and requirements</p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={resetPolicy} disabled={!hasUnsavedChanges}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={savePolicy} disabled={!hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Policy
          </Button>
        </div>
      </div>

      {/* Equipment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Equipment Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Select Equipment</Label>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose equipment to configure" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map(eq => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name} ({eq.type.replace('_', ' ')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Copy Settings From</Label>
              <Select onValueChange={copyPolicyFrom}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Copy from..." />
                </SelectTrigger>
                <SelectContent>
                  {equipment.filter(eq => eq.id !== selectedEquipment).map(eq => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{currentPolicy.equipment_name} - Reservation Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="timing">Timing Rules</TabsTrigger>
              <TabsTrigger value="access">Access Control</TabsTrigger>
              <TabsTrigger value="schedule">Operating Hours</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Requires Manual Approval</Label>
                    <Switch 
                      checked={currentPolicy.requires_approval}
                      onCheckedChange={(checked) => updatePolicy({ requires_approval: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Auto-Approve (if no approval required)</Label>
                    <Switch 
                      checked={currentPolicy.auto_approve}
                      onCheckedChange={(checked) => updatePolicy({ auto_approve: checked })}
                      disabled={currentPolicy.requires_approval}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Visible in Calendar</Label>
                    <Switch 
                      checked={currentPolicy.visibility_in_calendar}
                      onCheckedChange={(checked) => updatePolicy({ visibility_in_calendar: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>After Hours Restriction</Label>
                    <Switch 
                      checked={currentPolicy.after_hours_restriction}
                      onCheckedChange={(checked) => updatePolicy({ after_hours_restriction: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Guest User Restriction</Label>
                    <Switch 
                      checked={currentPolicy.guest_user_restriction}
                      onCheckedChange={(checked) => updatePolicy({ guest_user_restriction: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Cost per Hour ($)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={currentPolicy.cost_per_hour || 0}
                      onChange={(e) => updatePolicy({ cost_per_hour: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Maximum Advance Booking (days)</Label>
                    <Input 
                      type="number"
                      value={currentPolicy.max_advance_booking_days}
                      onChange={(e) => updatePolicy({ max_advance_booking_days: parseInt(e.target.value) || 30 })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Grace Period (minutes)</Label>
                    <Input 
                      type="number"
                      value={currentPolicy.grace_period_minutes}
                      onChange={(e) => updatePolicy({ grace_period_minutes: parseInt(e.target.value) || 15 })}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Time allowed before auto-cancelling for no-show
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Maximum Duration (hours)</Label>
                    <Input 
                      type="number"
                      step="0.5"
                      value={currentPolicy.max_duration_minutes / 60}
                      onChange={(e) => updatePolicy({ max_duration_minutes: (parseFloat(e.target.value) || 0) * 60 })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Time Slot Granularity (minutes)</Label>
                    <Select 
                      value={currentPolicy.time_slot_granularity.toString()}
                      onValueChange={(value) => updatePolicy({ time_slot_granularity: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Cooldown Period (minutes)</Label>
                    <Input 
                      type="number"
                      value={currentPolicy.cooldown_minutes}
                      onChange={(e) => updatePolicy({ cooldown_minutes: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Time before same user can book again
                    </p>
                  </div>

                  <div>
                    <Label>Buffer Between Reservations (minutes)</Label>
                    <Input 
                      type="number"
                      value={currentPolicy.buffer_between_reservations}
                      onChange={(e) => updatePolicy({ buffer_between_reservations: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maintenance time between reservations
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="access" className="space-y-6 mt-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Required Badges</h3>
                </div>
                <div>
                  <Label>Badge Names (comma-separated)</Label>
                  <Input 
                    value={currentPolicy.required_badges.join(', ')}
                    onChange={(e) => updatePolicy({ 
                      required_badges: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                    })}
                    placeholder="Safety Certified, 3D Printing, Laser Safety"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Skill Requirements</h3>
                  <Button onClick={addSkillRequirement} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Requirement
                  </Button>
                </div>
                <div className="space-y-3">
                  {currentPolicy.skill_requirements.map(req => (
                    <div key={req.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Skill Name</Label>
                          <Input 
                            value={req.skill_name}
                            onChange={(e) => updateSkillRequirement(req.id, { skill_name: e.target.value })}
                            placeholder="e.g., CNC Operation"
                          />
                        </div>
                        <div>
                          <Label>Minimum Level</Label>
                          <Select 
                            value={req.minimum_level}
                            onValueChange={(value: any) => updateSkillRequirement(req.id, { minimum_level: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={req.certification_required}
                            onCheckedChange={(checked) => updateSkillRequirement(req.id, { certification_required: checked })}
                          />
                          <Label>Certification Required</Label>
                        </div>
                        <div className="flex items-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeSkillRequirement(req.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
                <div className="space-y-4">
                  {Object.entries(currentPolicy.operating_hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-24">
                        <Switch 
                          checked={hours.enabled}
                          onCheckedChange={(checked) => updateOperatingHours(day as keyof OperatingHours, { enabled: checked })}
                        />
                        <Label className="capitalize">{day}</Label>
                      </div>
                      {hours.enabled && (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="time"
                            value={hours.start}
                            onChange={(e) => updateOperatingHours(day as keyof OperatingHours, { start: e.target.value })}
                            className="w-32"
                          />
                          <span>to</span>
                          <Input 
                            type="time"
                            value={hours.end}
                            onChange={(e) => updateOperatingHours(day as keyof OperatingHours, { end: e.target.value })}
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6 mt-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Maintenance Blocks</h3>
                  <Button onClick={addMaintenanceBlock} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block
                  </Button>
                </div>
                <div className="space-y-4">
                  {currentPolicy.maintenance_blocks.map(block => (
                    <div key={block.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Title</Label>
                          <Input 
                            value={block.title}
                            onChange={(e) => updateMaintenanceBlock(block.id, { title: e.target.value })}
                            placeholder="Maintenance Block Title"
                          />
                        </div>
                        <div>
                          <Label>Recurring</Label>
                          <Select 
                            value={block.recurring}
                            onValueChange={(value: any) => updateMaintenanceBlock(block.id, { recurring: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">One-time</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Start Time</Label>
                          <Input 
                            type="datetime-local"
                            value={format(new Date(block.start_time), 'yyyy-MM-dd\'T\'HH:mm')}
                            onChange={(e) => updateMaintenanceBlock(block.id, { 
                              start_time: new Date(e.target.value).toISOString() 
                            })}
                          />
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input 
                            type="datetime-local"
                            value={format(new Date(block.end_time), 'yyyy-MM-dd\'T\'HH:mm')}
                            onChange={(e) => updateMaintenanceBlock(block.id, { 
                              end_time: new Date(e.target.value).toISOString() 
                            })}
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <Label>Reason</Label>
                        <Textarea 
                          value={block.reason}
                          onChange={(e) => updateMaintenanceBlock(block.id, { reason: e.target.value })}
                          placeholder="Describe the maintenance activities..."
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={block.is_active}
                            onCheckedChange={(checked) => updateMaintenanceBlock(block.id, { is_active: checked })}
                          />
                          <Label>Active</Label>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeMaintenanceBlock(block.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {currentPolicy.maintenance_blocks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>No maintenance blocks configured</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentPolicyManager;
