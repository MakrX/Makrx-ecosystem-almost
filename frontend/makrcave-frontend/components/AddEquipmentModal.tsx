import { useState, useEffect } from 'react';
import { 
  X, Save, Upload, Wrench, Shield, DollarSign, 
  Calendar, MapPin, Tag, FileText, Settings, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Equipment {
  id?: string;
  equipment_id: string;
  name: string;
  category: string;
  sub_category?: string;
  status?: string;
  location: string;
  linked_makerspace_id?: string;
  requires_certification: boolean;
  certification_required?: string;
  maintenance_interval_hours?: number;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  hourly_rate?: number;
  deposit_required?: number;
  description?: string;
  image_url?: string;
  notes?: string;
}

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editEquipment?: Equipment | null;
  onSubmit: (equipmentData: Equipment) => void;
}

export default function AddEquipmentModal({
  isOpen,
  onClose,
  editEquipment,
  onSubmit
}: AddEquipmentModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Equipment>({
    equipment_id: '',
    name: '',
    category: 'printer_3d',
    sub_category: '',
    location: '',
    requires_certification: false,
    certification_required: '',
    maintenance_interval_hours: 100,
    manufacturer: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    warranty_expiry: '',
    hourly_rate: 0,
    deposit_required: 0,
    description: '',
    image_url: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (editEquipment) {
        setFormData({
          equipment_id: editEquipment.equipment_id || '',
          name: editEquipment.name || '',
          category: editEquipment.category || 'printer_3d',
          sub_category: editEquipment.sub_category || '',
          location: editEquipment.location || '',
          requires_certification: editEquipment.requires_certification || false,
          certification_required: editEquipment.certification_required || '',
          maintenance_interval_hours: editEquipment.maintenance_interval_hours || 100,
          manufacturer: editEquipment.manufacturer || '',
          model: editEquipment.model || '',
          serial_number: editEquipment.serial_number || '',
          purchase_date: editEquipment.purchase_date ? editEquipment.purchase_date.split('T')[0] : '',
          warranty_expiry: editEquipment.warranty_expiry ? editEquipment.warranty_expiry.split('T')[0] : '',
          hourly_rate: editEquipment.hourly_rate || 0,
          deposit_required: editEquipment.deposit_required || 0,
          description: editEquipment.description || '',
          image_url: editEquipment.image_url || '',
          notes: editEquipment.notes || ''
        });
      } else {
        // Reset form for new equipment
        setFormData({
          equipment_id: '',
          name: '',
          category: 'printer_3d',
          sub_category: '',
          location: '',
          requires_certification: false,
          certification_required: '',
          maintenance_interval_hours: 100,
          manufacturer: '',
          model: '',
          serial_number: '',
          purchase_date: '',
          warranty_expiry: '',
          hourly_rate: 0,
          deposit_required: 0,
          description: '',
          image_url: '',
          notes: ''
        });
      }
      setCurrentStep(1);
      setErrors({});
    }
  }, [isOpen, editEquipment]);

  const categories = [
    { value: 'printer_3d', label: '3D Printers', subcategories: ['FDM', 'SLA', 'SLS', 'Industrial'] },
    { value: 'laser_cutter', label: 'Laser Cutters', subcategories: ['CO2', 'Fiber', 'Diode', 'UV'] },
    { value: 'cnc_machine', label: 'CNC Machines', subcategories: ['Mill', 'Lathe', 'Router', 'Plasma'] },
    { value: 'testing_tool', label: 'Testing Tools', subcategories: ['Multimeter', 'Oscilloscope', 'Function Generator', 'Spectrum Analyzer'] },
    { value: 'soldering_station', label: 'Soldering Stations', subcategories: ['Temperature Controlled', 'Hot Air', 'Desoldering', 'SMD Rework'] },
    { value: 'workstation', label: 'Workstations', subcategories: ['Design Station', 'Gaming Rig', 'Render Farm', 'Development Machine'] },
    { value: 'hand_tool', label: 'Hand Tools', subcategories: ['Screwdrivers', 'Pliers', 'Wrenches', 'Specialty Tools'] },
    { value: 'measuring_tool', label: 'Measuring Tools', subcategories: ['Calipers', 'Micrometers', 'Gauges', 'Rulers'] },
    { value: 'general_tool', label: 'General Tools', subcategories: ['Power Tools', 'Assembly Tools', 'Safety Equipment', 'Other'] }
  ];

  const getSubcategories = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.subcategories : [];
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Basic Information validation
      if (!formData.equipment_id.trim()) {
        newErrors.equipment_id = 'Equipment ID is required';
      }
      if (!formData.name.trim()) {
        newErrors.name = 'Equipment name is required';
      }
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
      if (!formData.category) {
        newErrors.category = 'Category is required';
      }
    } else if (step === 2) {
      // Technical specifications validation
      if (formData.requires_certification && !formData.certification_required?.trim()) {
        newErrors.certification_required = 'Certification name is required when certification is required';
      }
      if (formData.maintenance_interval_hours && formData.maintenance_interval_hours <= 0) {
        newErrors.maintenance_interval_hours = 'Maintenance interval must be positive';
      }
    } else if (step === 3) {
      // Financial information validation
      if (formData.hourly_rate && formData.hourly_rate < 0) {
        newErrors.hourly_rate = 'Hourly rate cannot be negative';
      }
      if (formData.deposit_required && formData.deposit_required < 0) {
        newErrors.deposit_required = 'Deposit cannot be negative';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps
    let allValid = true;
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        allValid = false;
        setCurrentStep(step);
        break;
      }
    }

    if (allValid) {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // linked_makerspace_id will be set by the backend based on current user
        purchase_date: formData.purchase_date ? `${formData.purchase_date}T00:00:00Z` : undefined,
        warranty_expiry: formData.warranty_expiry ? `${formData.warranty_expiry}T00:00:00Z` : undefined,
        hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : undefined,
        deposit_required: formData.deposit_required ? Number(formData.deposit_required) : undefined,
        maintenance_interval_hours: formData.maintenance_interval_hours ? Number(formData.maintenance_interval_hours) : undefined,
        // Ensure required fields have proper defaults
        requires_certification: Boolean(formData.requires_certification),
        // Remove any undefined values to avoid validation issues
        sub_category: formData.sub_category || undefined,
        certification_required: formData.requires_certification ? formData.certification_required : undefined,
        manufacturer: formData.manufacturer || undefined,
        model: formData.model || undefined,
        serial_number: formData.serial_number || undefined,
        description: formData.description || undefined,
        image_url: formData.image_url || undefined,
        notes: formData.notes || undefined
      };

      // Remove undefined values to clean up the payload
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined || submitData[key] === '') {
          delete submitData[key];
        }
      });

      console.log('Final submit data:', submitData);
      onSubmit(submitData);
      onClose();
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === currentStep 
              ? 'bg-makrx-blue text-white' 
              : step < currentStep 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600'
          }`}>
            {step < currentStep ? '✓' : step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipment ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.equipment_id}
            onChange={(e) => setFormData(prev => ({ ...prev, equipment_id: e.target.value }))}
            placeholder="e.g., PRINTER3D-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
          {errors.equipment_id && <p className="text-sm text-red-600 mt-1">{errors.equipment_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipment Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Ultimaker S3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, sub_category: '' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
          <select
            value={formData.sub_category || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, sub_category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          >
            <option value="">Select sub-category</option>
            {getSubcategories(formData.category).map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="e.g., Station A1, Workshop Area"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
        />
        {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed description of the equipment..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input
          type="url"
          value={formData.image_url || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
          placeholder="https://example.com/equipment-image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
          <input
            type="text"
            value={formData.manufacturer || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
            placeholder="e.g., Ultimaker, Formlabs"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <input
            type="text"
            value={formData.model || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            placeholder="e.g., S3, Form 3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
        <input
          type="text"
          value={formData.serial_number || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
          placeholder="Equipment serial number"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
          <input
            type="date"
            value={formData.purchase_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
          <input
            type="date"
            value={formData.warranty_expiry || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, warranty_expiry: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.requires_certification}
            onChange={(e) => setFormData(prev => ({ ...prev, requires_certification: e.target.checked }))}
          />
          <span className="text-sm font-medium text-gray-700">Requires Certification</span>
        </label>
      </div>

      {formData.requires_certification && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Required Certification <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.certification_required || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, certification_required: e.target.value }))}
            placeholder="e.g., 3D Printing Safety, Laser Safety"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
          {errors.certification_required && <p className="text-sm text-red-600 mt-1">{errors.certification_required}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Maintenance Interval (hours)
        </label>
        <input
          type="number"
          value={formData.maintenance_interval_hours || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, maintenance_interval_hours: parseInt(e.target.value) || 0 }))}
          placeholder="100"
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
        />
        {errors.maintenance_interval_hours && <p className="text-sm text-red-600 mt-1">{errors.maintenance_interval_hours}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial & Additional Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hourly Rate ($)
          </label>
          <input
            type="number"
            value={formData.hourly_rate || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
          {errors.hourly_rate && <p className="text-sm text-red-600 mt-1">{errors.hourly_rate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Security Deposit ($)
          </label>
          <input
            type="number"
            value={formData.deposit_required || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, deposit_required: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
          />
          {errors.deposit_required && <p className="text-sm text-red-600 mt-1">{errors.deposit_required}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes, special instructions, etc..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
        />
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Equipment Summary</h4>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="font-medium text-gray-500">ID:</dt>
            <dd className="text-gray-900">{formData.equipment_id}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Name:</dt>
            <dd className="text-gray-900">{formData.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Category:</dt>
            <dd className="text-gray-900">{categories.find(c => c.value === formData.category)?.label}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Location:</dt>
            <dd className="text-gray-900">{formData.location}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Certification:</dt>
            <dd className="text-gray-900">{formData.requires_certification ? 'Required' : 'Not Required'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Hourly Rate:</dt>
            <dd className="text-gray-900">${(formData.hourly_rate || 0).toFixed(2)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {editEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {editEquipment ? 'Update equipment information' : 'Add equipment to your makerspace'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 p-4 sm:p-6">
              {renderStepIndicator()}

              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Step {currentStep} of 3</span>
            </div>

            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                >
                  Previous
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3 sm:px-4 py-2 bg-makrx-blue text-white rounded-lg hover:bg-makrx-blue/90 text-sm sm:text-base"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-makrx-blue text-white rounded-lg hover:bg-makrx-blue/90 text-sm sm:text-base"
                >
                  <Save className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{editEquipment ? 'Update Equipment' : 'Create Equipment'}</span>
                  <span className="sm:hidden">{editEquipment ? 'Update' : 'Create'}</span>
                </button>
              )}
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
