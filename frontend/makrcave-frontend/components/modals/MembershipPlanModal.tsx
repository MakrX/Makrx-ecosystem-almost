import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { useMember } from '../../contexts/MemberContext';
import { Plus, AlertCircle, CreditCard, X } from 'lucide-react';

interface MembershipPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MembershipPlanModal: React.FC<MembershipPlanModalProps> = ({
  open,
  onOpenChange
}) => {
  const { createMembershipPlan } = useMember();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_days: '',
    price: '',
    features: [''],
    equipment: [''],
    rooms: [''],
    hours_per_day: '',
    max_reservations: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleArrayChange = (field: 'features' | 'equipment' | 'rooms', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'features' | 'equipment' | 'rooms') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'features' | 'equipment' | 'rooms', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.duration_days || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    const durationDays = parseInt(formData.duration_days);
    
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price');
      return;
    }
    
    if (isNaN(durationDays) || durationDays < 1) {
      setError('Please enter a valid duration in days');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const planData = {
        name: formData.name,
        description: formData.description,
        duration_days: durationDays,
        price: price,
        features: formData.features.filter(f => f.trim() !== ''),
        access_level: {
          equipment: formData.equipment.filter(e => e.trim() !== ''),
          rooms: formData.rooms.filter(r => r.trim() !== ''),
          hours_per_day: formData.hours_per_day ? parseInt(formData.hours_per_day) : undefined,
          max_reservations: formData.max_reservations ? parseInt(formData.max_reservations) : undefined,
        }
      };
      
      await createMembershipPlan(planData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        duration_days: '',
        price: '',
        features: [''],
        equipment: [''],
        rooms: [''],
        hours_per_day: '',
        max_reservations: '',
      });
      
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create membership plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      duration_days: '',
      price: '',
      features: [''],
      equipment: [''],
      rooms: [''],
      hours_per_day: '',
      max_reservations: '',
    });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Create Membership Plan
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <Label htmlFor="plan-name">Plan Name *</Label>
              <Input
                id="plan-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Pro Maker Plan"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="plan-description">Description *</Label>
              <Textarea
                id="plan-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Full access to all equipment and facilities..."
                className="mt-1"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plan-duration">Duration (days) *</Label>
                <Input
                  id="plan-duration"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => handleInputChange('duration_days', e.target.value)}
                  placeholder="365"
                  className="mt-1"
                  min="1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="plan-price">Price ($) *</Label>
                <Input
                  id="plan-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="99.99"
                  className="mt-1"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Features</h3>
            
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={feature}
                  onChange={(e) => handleArrayChange('features', index, e.target.value)}
                  placeholder="Unlimited 3D printing"
                  className="flex-1"
                />
                {formData.features.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('features', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('features')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </div>

          {/* Access Level */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Access Level</h3>
            
            {/* Equipment Access */}
            <div>
              <Label className="text-base font-medium">Equipment Access</Label>
              {formData.equipment.map((equipment, index) => (
                <div key={index} className="flex items-center gap-2 mt-2">
                  <Input
                    value={equipment}
                    onChange={(e) => handleArrayChange('equipment', index, e.target.value)}
                    placeholder="3D Printer"
                    className="flex-1"
                  />
                  {formData.equipment.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('equipment', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('equipment')}
                className="w-full mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </div>

            {/* Room Access */}
            <div>
              <Label className="text-base font-medium">Room Access</Label>
              {formData.rooms.map((room, index) => (
                <div key={index} className="flex items-center gap-2 mt-2">
                  <Input
                    value={room}
                    onChange={(e) => handleArrayChange('rooms', index, e.target.value)}
                    placeholder="Workshop"
                    className="flex-1"
                  />
                  {formData.rooms.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('rooms', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('rooms')}
                className="w-full mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours-per-day">Hours per Day (optional)</Label>
                <Input
                  id="hours-per-day"
                  type="number"
                  value={formData.hours_per_day}
                  onChange={(e) => handleInputChange('hours_per_day', e.target.value)}
                  placeholder="8"
                  className="mt-1"
                  min="1"
                  max="24"
                />
              </div>
              <div>
                <Label htmlFor="max-reservations">Max Reservations (optional)</Label>
                <Input
                  id="max-reservations"
                  type="number"
                  value={formData.max_reservations}
                  onChange={(e) => handleInputChange('max_reservations', e.target.value)}
                  placeholder="5"
                  className="mt-1"
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipPlanModal;
