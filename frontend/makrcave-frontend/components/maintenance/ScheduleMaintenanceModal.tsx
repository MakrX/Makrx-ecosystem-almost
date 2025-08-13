import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  CalendarIcon, 
  Clock, 
  Repeat, 
  Users,
  Wrench,
  AlertTriangle,
  Info
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

interface ScheduleMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: any;
  onSave: (scheduleData: any) => void;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  current_status: string;
}

const ScheduleMaintenanceModal: React.FC<ScheduleMaintenanceModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onSave
}) => {
  const [formData, setFormData] = useState({
    equipment_id: '',
    maintenance_type: '',
    description: '',
    interval_type: 'days',
    interval_value: 30,
    start_date: new Date(),
    responsible_team: '',
    is_active: true,
    priority: 'medium',
    estimated_duration: '',
    notification_days_before: 3,
    auto_create_work_order: true,
    requires_shutdown: false,
    safety_requirements: '',
    notes: ''
  });

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEquipment();
      
      if (schedule) {
        // Editing existing schedule
        setFormData({
          equipment_id: schedule.equipment_id || '',
          maintenance_type: schedule.maintenance_type || '',
          description: schedule.description || '',
          interval_type: schedule.interval_type || 'days',
          interval_value: schedule.interval_value || 30,
          start_date: schedule.start_date ? new Date(schedule.start_date) : new Date(),
          responsible_team: schedule.responsible_team || '',
          is_active: schedule.is_active ?? true,
          priority: schedule.priority || 'medium',
          estimated_duration: schedule.estimated_duration?.toString() || '',
          notification_days_before: schedule.notification_days_before || 3,
          auto_create_work_order: schedule.auto_create_work_order ?? true,
          requires_shutdown: schedule.requires_shutdown || false,
          safety_requirements: schedule.safety_requirements || '',
          notes: schedule.notes || ''
        });
      } else {
        // Reset form for new schedule
        setFormData({
          equipment_id: '',
          maintenance_type: '',
          description: '',
          interval_type: 'days',
          interval_value: 30,
          start_date: new Date(),
          responsible_team: '',
          is_active: true,
          priority: 'medium',
          estimated_duration: '',
          notification_days_before: 3,
          auto_create_work_order: true,
          requires_shutdown: false,
          safety_requirements: '',
          notes: ''
        });
      }
    }
  }, [isOpen, schedule]);

  useEffect(() => {
    // Calculate next maintenance date
    if (formData.start_date && formData.interval_type && formData.interval_value) {
      let nextDate: Date;
      switch (formData.interval_type) {
        case 'days':
          nextDate = addDays(formData.start_date, formData.interval_value);
          break;
        case 'weeks':
          nextDate = addWeeks(formData.start_date, formData.interval_value);
          break;
        case 'months':
          nextDate = addMonths(formData.start_date, formData.interval_value);
          break;
        default:
          nextDate = addDays(formData.start_date, formData.interval_value);
      }
      setNextMaintenanceDate(nextDate);
    }
  }, [formData.start_date, formData.interval_type, formData.interval_value]);

  const loadEquipment = async () => {
    try {
      const response = await fetch('/api/v1/equipment', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (response.ok) {
        const equipmentData = await response.json();
        setEquipment(equipmentData);
      } else {
        // Mock data
        setEquipment([
          { id: 'eq-1', name: '3D Printer Pro', type: '3D Printer', location: 'Station A1', current_status: 'available' },
          { id: 'eq-2', name: 'Laser Cutter X1', type: 'Laser Cutter', location: 'Station B2', current_status: 'available' },
          { id: 'eq-3', name: 'CNC Mill Pro', type: 'CNC Machine', location: 'Station C1', current_status: 'maintenance_scheduled' },
          { id: 'eq-4', name: 'Soldering Station', type: 'Workstation', location: 'Electronics Lab', current_status: 'available' },
          { id: 'eq-5', name: 'Oscilloscope Pro', type: 'Testing Equipment', location: 'Electronics Lab', current_status: 'available' }
        ]);
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
        start_date: formData.start_date.toISOString(),
        next_due_date: nextMaintenanceDate?.toISOString(),
      };

      onSave(submitData);
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const maintenanceTypes = [
    { value: 'preventive_cleaning', label: '🧹 Preventive Cleaning', description: 'Regular cleaning and inspection' },
    { value: 'calibration', label: '⚖️ Calibration', description: 'Precision adjustment and verification' },
    { value: 'lubrication', label: '🛢️ Lubrication', description: 'Moving parts maintenance' },
    { value: 'filter_replacement', label: '🔄 Filter Replacement', description: 'Air/fluid filter changes' },
    { value: 'software_update', label: '💻 Software Update', description: 'Firmware and software updates' },
    { value: 'safety_inspection', label: '🛡️ Safety Inspection', description: 'Safety systems check' },
    { value: 'performance_check', label: '📊 Performance Check', description: 'Performance testing and optimization' },
    { value: 'wear_inspection', label: '🔍 Wear Inspection', description: 'Check for wear and tear' },
    { value: 'electrical_check', label: '⚡ Electrical Check', description: 'Electrical systems inspection' },
    { value: 'custom', label: '🔧 Custom Maintenance', description: 'Custom maintenance procedure' }
  ];

  const teams = [
    { value: 'tech_team', label: 'Tech Team', specialization: 'General maintenance' },
    { value: 'laser_specialists', label: 'Laser Specialists', specialization: 'Laser equipment' },
    { value: 'electronics_team', label: 'Electronics Team', specialization: 'Electronic equipment' },
    { value: 'mechanical_team', label: 'Mechanical Team', specialization: 'Mechanical systems' },
    { value: 'software_team', label: 'Software Team', specialization: 'Software and firmware' },
    { value: 'external_contractor', label: 'External Contractor', specialization: 'Specialized services' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {schedule ? 'Edit Maintenance Schedule' : 'Schedule Maintenance'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Equipment Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipment_id">Equipment *</Label>
              <Select
                value={formData.equipment_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, equipment_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      <div>
                        <div className="font-medium">{eq.name}</div>
                        <div className="text-sm text-gray-500">{eq.type} - {eq.location}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance_type">Maintenance Type *</Label>
              <Select
                value={formData.maintenance_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, maintenance_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maintenance type" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the maintenance procedure..."
              rows={3}
              required
            />
          </div>

          {/* Scheduling Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Schedule Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Repeat Every</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={formData.interval_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, interval_value: parseInt(e.target.value) || 1 }))}
                    className="w-20"
                  />
                  <Select
                    value={formData.interval_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, interval_type: value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.start_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Next Due Date</Label>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    {nextMaintenanceDate ? format(nextMaintenanceDate, "PPP") : 'Not calculated'}
                  </p>
                  <p className="text-xs text-blue-600">
                    Automatically calculated based on interval
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsible_team">Responsible Team *</Label>
              <Select
                value={formData.responsible_team}
                onValueChange={(value) => setFormData(prev => ({ ...prev, responsible_team: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.value} value={team.value}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <div>
                          <div>{team.label}</div>
                          <div className="text-xs text-gray-500">{team.specialization}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low Priority</SelectItem>
                  <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                  <SelectItem value="high">🟠 High Priority</SelectItem>
                  <SelectItem value="critical">🔴 Critical Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration and Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="estimated_duration"
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                  placeholder="120"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_days_before">Notification Days Before</Label>
              <Input
                id="notification_days_before"
                type="number"
                min="0"
                value={formData.notification_days_before}
                onChange={(e) => setFormData(prev => ({ ...prev, notification_days_before: parseInt(e.target.value) || 0 }))}
                placeholder="3"
              />
            </div>
          </div>

          {/* Settings Switches */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_active">Active Schedule</Label>
                    <p className="text-sm text-gray-500">Enable this maintenance schedule</p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_create_work_order">Auto-create Work Orders</Label>
                    <p className="text-sm text-gray-500">Automatically create maintenance logs</p>
                  </div>
                  <Switch
                    id="auto_create_work_order"
                    checked={formData.auto_create_work_order}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_create_work_order: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requires_shutdown">Requires Equipment Shutdown</Label>
                    <p className="text-sm text-gray-500">Block reservations during maintenance</p>
                  </div>
                  <Switch
                    id="requires_shutdown"
                    checked={formData.requires_shutdown}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_shutdown: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Safety Requirements */}
          <div className="space-y-2">
            <Label htmlFor="safety_requirements">Safety Requirements</Label>
            <Textarea
              id="safety_requirements"
              value={formData.safety_requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, safety_requirements: e.target.value }))}
              placeholder="Safety precautions, PPE requirements, lockout procedures..."
              rows={2}
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional instructions, special considerations..."
              rows={3}
            />
          </div>

          {/* Schedule Preview */}
          {nextMaintenanceDate && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Schedule Preview</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This maintenance will repeat every {formData.interval_value} {formData.interval_type}, 
                    starting from {format(formData.start_date, "PPP")}. 
                    The next maintenance is scheduled for {format(nextMaintenanceDate, "PPP")}.
                  </p>
                  {formData.requires_shutdown && (
                    <p className="text-sm text-orange-700 mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Equipment will be unavailable for reservations during maintenance windows.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (schedule ? 'Update Schedule' : 'Create Schedule')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleMaintenanceModal;
