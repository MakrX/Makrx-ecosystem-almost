import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  CalendarIcon, 
  Upload, 
  X, 
  Wrench, 
  Clock, 
  DollarSign, 
  Users,
  AlertTriangle,
  CheckCircle,
  FileText,
  Camera
} from 'lucide-react';
import { format } from 'date-fns';

interface MaintenanceLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log?: any;
  onSave: (logData: any) => void;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
}

interface Technician {
  id: string;
  name: string;
  specialization: string;
  available: boolean;
}

const MaintenanceLogModal: React.FC<MaintenanceLogModalProps> = ({
  isOpen,
  onClose,
  log,
  onSave
}) => {
  const [formData, setFormData] = useState({
    equipment_id: '',
    type: 'preventive',
    status: 'scheduled',
    priority: 'medium',
    title: '',
    description: '',
    assigned_to: '',
    scheduled_date: null as Date | null,
    estimated_duration: '',
    estimated_cost: '',
    parts_needed: [] as string[],
    safety_requirements: '',
    notes: '',
    attachments: [] as File[]
  });

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [newPart, setNewPart] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEquipmentAndTechnicians();
      
      if (log) {
        // Editing existing log
        setFormData({
          equipment_id: log.equipment_id || '',
          type: log.type || 'preventive',
          status: log.status || 'scheduled',
          priority: log.priority || 'medium',
          title: log.title || '',
          description: log.description || '',
          assigned_to: log.assigned_to || '',
          scheduled_date: log.scheduled_date ? new Date(log.scheduled_date) : null,
          estimated_duration: log.estimated_duration?.toString() || '',
          estimated_cost: log.cost?.toString() || '',
          parts_needed: log.parts_used || [],
          safety_requirements: log.safety_requirements || '',
          notes: log.notes || '',
          attachments: []
        });
      } else {
        // Reset form for new log
        setFormData({
          equipment_id: '',
          type: 'preventive',
          status: 'scheduled',
          priority: 'medium',
          title: '',
          description: '',
          assigned_to: '',
          scheduled_date: null,
          estimated_duration: '',
          estimated_cost: '',
          parts_needed: [],
          safety_requirements: '',
          notes: '',
          attachments: []
        });
      }
    }
  }, [isOpen, log]);

  const loadEquipmentAndTechnicians = async () => {
    try {
      // Load equipment list
      const equipmentResponse = await fetch('/api/v1/equipment', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (equipmentResponse.ok) {
        const equipmentData = await equipmentResponse.json();
        setEquipment(equipmentData);
      } else {
        // Mock data
        setEquipment([
          { id: 'eq-1', name: '3D Printer Pro', type: '3D Printer', location: 'Station A1' },
          { id: 'eq-2', name: 'Laser Cutter X1', type: 'Laser Cutter', location: 'Station B2' },
          { id: 'eq-3', name: 'CNC Mill Pro', type: 'CNC Machine', location: 'Station C1' }
        ]);
      }

      // Load technicians
      setTechnicians([
        { id: 'tech-1', name: 'Alex Johnson', specialization: '3D Printing', available: true },
        { id: 'tech-2', name: 'Sarah Tech', specialization: 'Laser Cutting', available: true },
        { id: 'tech-3', name: 'Mike Mechanic', specialization: 'CNC & Mechanical', available: false }
      ]);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        scheduled_date: formData.scheduled_date?.toISOString(),
      };

      onSave(submitData);
    } catch (error) {
      console.error('Error saving log:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPart = () => {
    if (newPart.trim()) {
      setFormData(prev => ({
        ...prev,
        parts_needed: [...prev.parts_needed, newPart.trim()]
      }));
      setNewPart('');
    }
  };

  const removePart = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parts_needed: prev.parts_needed.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Wrench className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {log ? 'Edit Maintenance Log' : 'Create Maintenance Log'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
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
                      {eq.name} - {eq.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Maintenance Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">🔧 Preventive Maintenance</SelectItem>
                  <SelectItem value="breakdown">🚨 Breakdown Repair</SelectItem>
                  <SelectItem value="repair">🛠️ General Repair</SelectItem>
                  <SelectItem value="inspection">🔍 Inspection</SelectItem>
                  <SelectItem value="upgrade">⬆️ Upgrade/Modification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Scheduled
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Resolved
                    </div>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Overdue
                    </div>
                  </SelectItem>
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
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id} disabled={!tech.available}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {tech.name} - {tech.specialization}
                        {!tech.available && <span className="text-red-500">(Unavailable)</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief maintenance title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the maintenance work..."
                rows={3}
                required
              />
            </div>
          </div>

          {/* Scheduling and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduled_date ? format(formData.scheduled_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.scheduled_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, scheduled_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

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
              <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Parts Needed */}
          <div className="space-y-4">
            <div>
              <Label>Parts/Materials Needed</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newPart}
                  onChange={(e) => setNewPart(e.target.value)}
                  placeholder="Add part or material..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPart())}
                />
                <Button type="button" onClick={addPart} variant="outline">
                  Add
                </Button>
              </div>
            </div>
            
            {formData.parts_needed.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.parts_needed.map((part, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {part}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removePart(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
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

          {/* File Attachments */}
          <div className="space-y-4">
            <div>
              <Label>Attachments</Label>
              <div className="mt-2">
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Upload photos, documents, or manuals
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Attached Files:</p>
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes, observations, or instructions..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (log ? 'Update Log' : 'Create Log')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceLogModal;
