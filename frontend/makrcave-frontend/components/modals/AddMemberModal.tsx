import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useMember, MembershipPlan } from '../../contexts/MemberContext';
import { UserPlus, AlertCircle } from 'lucide-react';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membershipPlans: MembershipPlan[];
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  open,
  onOpenChange,
  membershipPlans
}) => {
  const { addMember } = useMember();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'maker',
    membership_plan_id: '',
    skills: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.membership_plan_id) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addMember({
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'maker',
        membership_plan_id: '',
        skills: '',
      });
      
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'maker',
      membership_plan_id: '',
      skills: '',
    });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Member
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john.doe@example.com"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maker">Maker</SelectItem>
                <SelectItem value="service_provider">Service Provider</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="makerspace_admin">Makerspace Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="membership_plan">Membership Plan *</Label>
            <Select 
              value={formData.membership_plan_id} 
              onValueChange={(value) => handleInputChange('membership_plan_id', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select membership plan" />
              </SelectTrigger>
              <SelectContent>
                {membershipPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="skills">Skills (optional)</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              placeholder="3D Printing, Laser Cutting, Electronics"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple skills with commas
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberModal;
