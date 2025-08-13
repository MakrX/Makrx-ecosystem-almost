import { useState, useEffect } from 'react';
import { 
  X, Save, Wrench, Calendar, Clock, DollarSign, 
  FileText, User, AlertTriangle, CheckCircle, Plus,
  Minus, Tool, Package, List
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Equipment {
  id: string;
  equipment_id: string;
  name: string;
  category: string;
  location: string;
  status: string;
}

interface MaintenanceLog {
  id?: string;
  equipment_id?: string;
  maintenance_type: string;
  title: string;
  description?: string;
  scheduled_date?: string;
  started_at: string;
  completed_at?: string;
  duration_hours?: number;
  performed_by_user_id?: string;
  performed_by_name?: string;
  supervised_by?: string;
  parts_used?: Array<{name: string, quantity: number, cost: number}>;
  labor_cost?: number;
  parts_cost?: number;
  total_cost?: number;
  issues_found?: string;
  actions_taken?: string;
  recommendations?: string;
  next_maintenance_due?: string;
  is_completed: boolean;
  notes?: string;
}

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment;
  editLog?: MaintenanceLog | null;
  onSubmit: (maintenanceData: MaintenanceLog) => void;
}

export default function MaintenanceModal({
  isOpen,
  onClose,
  equipment,
  editLog,
  onSubmit
}: MaintenanceModalProps) {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'form' | 'history'>('form');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceLog[]>([]);
  
  const [formData, setFormData] = useState<MaintenanceLog>({
    maintenance_type: 'routine',
    title: '',
    description: '',
    scheduled_date: '',
    started_at: new Date().toISOString().slice(0, 16),
    completed_at: '',
    duration_hours: 0,
    supervised_by: '',
    parts_used: [],
    labor_cost: 0,
    parts_cost: 0,
    issues_found: '',
    actions_taken: '',
    recommendations: '',
    next_maintenance_due: '',
    is_completed: false,
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (editLog) {
        setFormData({
          ...editLog,
          started_at: editLog.started_at ? new Date(editLog.started_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          completed_at: editLog.completed_at ? new Date(editLog.completed_at).toISOString().slice(0, 16) : '',
          scheduled_date: editLog.scheduled_date ? editLog.scheduled_date.split('T')[0] : '',
          next_maintenance_due: editLog.next_maintenance_due ? editLog.next_maintenance_due.split('T')[0] : ''
        });
      } else {
        // Reset form for new maintenance log
        setFormData({
          maintenance_type: 'routine',
          title: '',
          description: '',
          scheduled_date: '',
          started_at: new Date().toISOString().slice(0, 16),
          completed_at: '',
          duration_hours: 0,
          supervised_by: '',
          parts_used: [],
          labor_cost: 0,
          parts_cost: 0,
          issues_found: '',
          actions_taken: '',
          recommendations: '',
          next_maintenance_due: '',
          is_completed: false,
          notes: ''
        });
      }
      setErrors({});
      loadMaintenanceHistory();
    }
  }, [isOpen, editLog, equipment.id]);

  const loadMaintenanceHistory = async () => {
    try {
      const response = await fetch(`/api/v1/equipment/${equipment.id}/maintenance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const history = await response.json();
        setMaintenanceHistory(history);
      }
    } catch (error) {
      console.error('Error loading maintenance history:', error);
      // Mock data for development
      setMaintenanceHistory([
        {
          id: 'maint-1',
          maintenance_type: 'routine',
          title: 'Monthly Cleaning and Calibration',
          started_at: '2024-01-15T09:00:00Z',
          completed_at: '2024-01-15T11:30:00Z',
          duration_hours: 2.5,
          performed_by_name: 'John Smith',
          actions_taken: 'Cleaned print bed, calibrated axes, lubricated moving parts',
          is_completed: true,
          total_cost: 50.00
        }
      ]);
    }
  };

  const maintenanceTypes = [
    { value: 'routine', label: 'Routine Maintenance', icon: '🔧' },
    { value: 'repair', label: 'Repair', icon: '🛠️' },
    { value: 'calibration', label: 'Calibration', icon: '⚖️' },
    { value: 'cleaning', label: 'Cleaning', icon: '🧽' },
    { value: 'replacement', label: 'Part Replacement', icon: '🔄' }
  ];

  const addPart = () => {
    setFormData(prev => ({
      ...prev,
      parts_used: [...(prev.parts_used || []), { name: '', quantity: 1, cost: 0 }]
    }));
  };

  const removePart = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parts_used: prev.parts_used?.filter((_, i) => i !== index) || []
    }));
  };

  const updatePart = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      parts_used: prev.parts_used?.map((part, i) => 
        i === index ? { ...part, [field]: value } : part
      ) || []
    }));
  };

  const calculateTotalCost = () => {
    const partsTotal = formData.parts_used?.reduce((sum, part) => sum + (part.cost * part.quantity), 0) || 0;
    const laborTotal = formData.labor_cost || 0;
    return partsTotal + laborTotal;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.started_at) {
      newErrors.started_at = 'Start time is required';
    }

    if (formData.is_completed && !formData.completed_at) {
      newErrors.completed_at = 'Completion time is required when marking as completed';
    }

    if (formData.completed_at && formData.started_at && 
        new Date(formData.completed_at) <= new Date(formData.started_at)) {
      newErrors.completed_at = 'Completion time must be after start time';
    }

    if (formData.duration_hours && formData.duration_hours < 0) {
      newErrors.duration_hours = 'Duration cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Calculate totals
    const partsTotal = formData.parts_used?.reduce((sum, part) => sum + (part.cost * part.quantity), 0) || 0;
    const totalCost = partsTotal + (formData.labor_cost || 0);

    // Auto-calculate duration if not provided
    let duration = formData.duration_hours;
    if (!duration && formData.started_at && formData.completed_at) {
      const startTime = new Date(formData.started_at);
      const endTime = new Date(formData.completed_at);
      duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    }

    const submitData: MaintenanceLog = {
      ...formData,
      equipment_id: equipment.id,
      performed_by_user_id: user?.id,
      performed_by_name: user?.name || 'Unknown User',
      parts_cost: partsTotal,
      total_cost: totalCost,
      duration_hours: duration,
      started_at: new Date(formData.started_at).toISOString(),
      completed_at: formData.completed_at ? new Date(formData.completed_at).toISOString() : undefined,
      scheduled_date: formData.scheduled_date ? `${formData.scheduled_date}T00:00:00Z` : undefined,
      next_maintenance_due: formData.next_maintenance_due ? `${formData.next_maintenance_due}T00:00:00Z` : undefined
    };

    onSubmit(submitData);
    onClose();
  };

  const renderMaintenanceForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maintenance Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.maintenance_type}
            onChange={(e) => setFormData(prev => ({ ...prev, maintenance_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          >
            {maintenanceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Brief description of maintenance"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed description of the maintenance work..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
        />
      </div>

      {/* Timing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
          <input
            type="date"
            value={formData.scheduled_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Started At <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.started_at}
            onChange={(e) => setFormData(prev => ({ ...prev, started_at: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
          {errors.started_at && <p className="text-sm text-red-600 mt-1">{errors.started_at}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Completed At</label>
          <input
            type="datetime-local"
            value={formData.completed_at || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, completed_at: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
          {errors.completed_at && <p className="text-sm text-red-600 mt-1">{errors.completed_at}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
          <input
            type="number"
            value={formData.duration_hours || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseFloat(e.target.value) || 0 }))}
            placeholder="Auto-calculated if start/end times provided"
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
          {errors.duration_hours && <p className="text-sm text-red-600 mt-1">{errors.duration_hours}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Supervised By</label>
          <input
            type="text"
            value={formData.supervised_by || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, supervised_by: e.target.value }))}
            placeholder="Supervisor name (if applicable)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
        </div>
      </div>

      {/* Parts Used */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Parts Used</label>
          <button
            type="button"
            onClick={addPart}
            className="inline-flex items-center px-3 py-1 text-sm bg-makrx-blue text-white rounded-lg hover:bg-makrx-blue/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Part
          </button>
        </div>

        {formData.parts_used?.map((part, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-5">
              <input
                type="text"
                value={part.name}
                onChange={(e) => updatePart(index, 'name', e.target.value)}
                placeholder="Part name"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-makrx-blue focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                value={part.quantity}
                onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                placeholder="Qty"
                min="1"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-makrx-blue focus:border-transparent"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                value={part.cost}
                onChange={(e) => updatePart(index, 'cost', parseFloat(e.target.value) || 0)}
                placeholder="Cost each"
                min="0"
                step="0.01"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-makrx-blue focus:border-transparent"
              />
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-gray-600 mr-2">${(part.cost * part.quantity).toFixed(2)}</span>
              <button
                type="button"
                onClick={() => removePart(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Costs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost ($)</label>
          <input
            type="number"
            value={formData.labor_cost || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, labor_cost: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parts Cost ($)</label>
          <input
            type="text"
            value={`$${(formData.parts_used?.reduce((sum, part) => sum + (part.cost * part.quantity), 0) || 0).toFixed(2)}`}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
          <input
            type="text"
            value={`$${calculateTotalCost().toFixed(2)}`}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium"
          />
        </div>
      </div>

      {/* Findings and Actions */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issues Found</label>
          <textarea
            value={formData.issues_found || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, issues_found: e.target.value }))}
            placeholder="Describe any issues or problems discovered..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Actions Taken</label>
          <textarea
            value={formData.actions_taken || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, actions_taken: e.target.value }))}
            placeholder="Describe the maintenance work performed..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
          <textarea
            value={formData.recommendations || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
            placeholder="Recommendations for future maintenance or improvements..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance Due</label>
        <input
          type="date"
          value={formData.next_maintenance_due || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, next_maintenance_due: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes or comments..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
        />
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.is_completed}
            onChange={(e) => setFormData(prev => ({ ...prev, is_completed: e.target.checked }))}
          />
          <span className="text-sm font-medium text-gray-700">Mark as completed</span>
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 bg-makrx-blue text-white rounded-lg hover:bg-makrx-blue/90"
        >
          <Save className="w-4 h-4 mr-2" />
          {editLog ? 'Update Log' : 'Save Maintenance Log'}
        </button>
      </div>
    </form>
  );

  const renderMaintenanceHistory = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Maintenance History</h3>
        <span className="text-sm text-gray-600">{maintenanceHistory.length} records</span>
      </div>

      {maintenanceHistory.length > 0 ? (
        <div className="space-y-4">
          {maintenanceHistory.map((log) => (
            <div key={log.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{log.title}</h4>
                  <p className="text-sm text-gray-600">
                    {maintenanceTypes.find(t => t.value === log.maintenance_type)?.label}
                  </p>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  log.is_completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {log.is_completed ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                  {log.is_completed ? 'Completed' : 'In Progress'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Performed by:</span>
                  <span className="ml-1 text-gray-900">{log.performed_by_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-1 text-gray-900">
                    {new Date(log.started_at).toLocaleDateString()}
                  </span>
                </div>
                {log.duration_hours && (
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-1 text-gray-900">{log.duration_hours}h</span>
                  </div>
                )}
                {log.total_cost && (
                  <div>
                    <span className="text-gray-500">Cost:</span>
                    <span className="ml-1 text-gray-900">${log.total_cost.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {log.actions_taken && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700">{log.actions_taken}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Maintenance History</h3>
          <p className="text-gray-600">No maintenance records found for this equipment.</p>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {editLog ? 'Edit Maintenance Log' : 'Maintenance Log'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {equipment.name} ({equipment.equipment_id}) - {equipment.location}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setCurrentTab('form')}
            className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium ${
              currentTab === 'form'
                ? 'text-makrx-blue border-b-2 border-makrx-blue'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{editLog ? 'Edit Log' : 'New Log'}</span>
            <span className="sm:hidden">Form</span>
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium ${
              currentTab === 'history'
                ? 'text-makrx-blue border-b-2 border-makrx-blue'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4 inline mr-1 sm:mr-2" />
            History
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentTab === 'form' ? renderMaintenanceForm() : renderMaintenanceHistory()}
        </div>
      </div>
    </div>
  );
}
