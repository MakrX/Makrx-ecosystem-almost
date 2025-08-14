import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useMember, MembershipPlan } from '../../contexts/MemberContext';
import { Mail, AlertCircle, Send } from 'lucide-react';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membershipPlans: MembershipPlan[];
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  open,
  onOpenChange,
  membershipPlans
}) => {
  const { sendInvite } = useMember();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'user',
    membership_plan_id: '',
    message: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.membership_plan_id) {
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
      await sendInvite({
        email: formData.email,
        role: formData.role,
        membership_plan_id: formData.membership_plan_id,
      });
      
      setSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          email: '',
          role: 'user',
          membership_plan_id: '',
          message: '',
        });
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: '',
      role: 'user',
      membership_plan_id: '',
      message: '',
    });
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  const selectedPlan = membershipPlans.find(p => p.id === formData.membership_plan_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Member Invite
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

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center">
                <Send className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-green-800 text-sm">Invite sent successfully!</span>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="invite-email">Email Address *</Label>
            <Input
              id="invite-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="newmember@example.com"
              className="mt-1"
              required
              disabled={isLoading || success}
            />
            <p className="text-xs text-gray-500 mt-1">
              An invitation link will be sent to this email address
            </p>
          </div>

          <div>
            <Label htmlFor="invite-role">Role *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => handleInputChange('role', value)}
              disabled={isLoading || success}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="service_provider">Service Provider</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="makerspace_admin">Makerspace Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="invite-plan">Membership Plan *</Label>
            <Select 
              value={formData.membership_plan_id} 
              onValueChange={(value) => handleInputChange('membership_plan_id', value)}
              disabled={isLoading || success}
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

          {/* Plan Preview */}
          {selectedPlan && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="font-medium text-blue-900 mb-1">{selectedPlan.name}</h4>
              <p className="text-sm text-blue-700 mb-2">{selectedPlan.description}</p>
              <div className="text-xs text-blue-600">
                <p>Duration: {selectedPlan.duration_days} days</p>
                <p>Price: ${selectedPlan.price}</p>
                <p>Features: {selectedPlan.features.slice(0, 2).join(', ')}{selectedPlan.features.length > 2 ? '...' : ''}</p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="invite-message">Custom Message (optional)</Label>
            <Textarea
              id="invite-message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Welcome to our makerspace! We're excited to have you join us..."
              className="mt-1"
              rows={3}
              disabled={isLoading || success}
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be included in the invitation email
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || success}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : success ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Sent!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberModal;
