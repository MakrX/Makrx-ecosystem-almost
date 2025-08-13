import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { AlertTriangle, Shield, User, Calendar, AlertCircle } from 'lucide-react';

interface UserSkill {
  userId: string;
  userName: string;
  userEmail: string;
  skillId: string;
  skillName: string;
  status: 'pending' | 'certified' | 'expired' | 'revoked';
  certifiedAt?: string;
  expiresAt?: string;
  certifiedBy: string;
  notes?: string;
}

interface RevokeSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userSkill: UserSkill;
}

const RevokeSkillModal: React.FC<RevokeSkillModalProps> = ({
  open,
  onOpenChange,
  userSkill
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    reason: '',
    revokeReason: 'safety_violation', // safety_violation, skill_expired, policy_violation, request, other
    immediateRevocation: true,
    notifyUser: true,
    blockReapplication: false,
    blockReapplicationDays: '30',
    adminNotes: '',
  });

  const revocationReasons = [
    { value: 'safety_violation', label: 'Safety Violation', color: 'text-red-600' },
    { value: 'skill_expired', label: 'Skill/Certification Expired', color: 'text-yellow-600' },
    { value: 'policy_violation', label: 'Policy Violation', color: 'text-red-600' },
    { value: 'equipment_damage', label: 'Equipment Damage', color: 'text-red-600' },
    { value: 'insufficient_knowledge', label: 'Insufficient Knowledge Demonstrated', color: 'text-orange-600' },
    { value: 'request', label: 'User/Admin Request', color: 'text-blue-600' },
    { value: 'other', label: 'Other', color: 'text-gray-600' }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.reason.trim()) {
      setError('Please provide a reason for revocation');
      return false;
    }
    if (formData.blockReapplication && (!formData.blockReapplicationDays || parseInt(formData.blockReapplicationDays) < 1)) {
      setError('Please specify valid number of days for reapplication block');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Certification Revoked",
        description: `${userSkill.skillName} certification has been revoked for ${userSkill.userName}`,
        variant: "destructive",
      });
      
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke certification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      reason: '',
      revokeReason: 'safety_violation',
      immediateRevocation: true,
      notifyUser: true,
      blockReapplication: false,
      blockReapplicationDays: '30',
      adminNotes: '',
    });
    setError(null);
    onOpenChange(false);
  };

  const getReasonData = () => {
    return revocationReasons.find(r => r.value === formData.revokeReason);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'certified':
        return <Badge className="bg-green-100 text-green-800">Certified</Badge>;
      case 'expired':
        return <Badge className="bg-yellow-100 text-yellow-800">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Revoke Skill Certification
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

          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Warning: Certification Revocation</h4>
                <p className="text-sm text-red-700 mt-1">
                  This action will immediately remove the user's access to equipment that requires this skill.
                  This action can be undone, but may require re-certification.
                </p>
              </div>
            </div>
          </div>

          {/* User and Skill Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="font-medium text-gray-900 mb-3">Certification Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Member</span>
                </div>
                <div className="ml-6">
                  <div className="font-medium">{userSkill.userName}</div>
                  <div className="text-gray-600">{userSkill.userEmail}</div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Skill</span>
                </div>
                <div className="ml-6">
                  <div className="font-medium">{userSkill.skillName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(userSkill.status)}
                  </div>
                </div>
              </div>

              {userSkill.certifiedAt && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Certified</span>
                  </div>
                  <div className="ml-6">
                    <div>{new Date(userSkill.certifiedAt).toLocaleDateString()}</div>
                    <div className="text-gray-600">by {userSkill.certifiedBy}</div>
                  </div>
                </div>
              )}

              {userSkill.expiresAt && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Expires</span>
                  </div>
                  <div className="ml-6">
                    <div>{new Date(userSkill.expiresAt).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Revocation Reason */}
          <div>
            <Label htmlFor="revokeReason">Revocation Category *</Label>
            <Select 
              value={formData.revokeReason} 
              onValueChange={(value) => handleInputChange('revokeReason', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {revocationReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    <span className={reason.color}>{reason.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getReasonData() && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <span className={`font-medium ${getReasonData()?.color}`}>
                  {getReasonData()?.label}
                </span>
              </div>
            )}
          </div>

          {/* Detailed Reason */}
          <div>
            <Label htmlFor="reason">Detailed Reason *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Provide specific details about why this certification is being revoked..."
              rows={4}
              className="mt-1"
              required
            />
          </div>

          {/* Revocation Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Revocation Options</h4>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.immediateRevocation}
                  onChange={(e) => handleInputChange('immediateRevocation', e.target.checked)}
                  className="mt-1 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Immediate Revocation</span>
                  <p className="text-xs text-gray-600">Remove access immediately (recommended)</p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.notifyUser}
                  onChange={(e) => handleInputChange('notifyUser', e.target.checked)}
                  className="mt-1 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Notify User</span>
                  <p className="text-xs text-gray-600">Send email notification to the user</p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.blockReapplication}
                  onChange={(e) => handleInputChange('blockReapplication', e.target.checked)}
                  className="mt-1 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Block Reapplication</span>
                  <p className="text-xs text-gray-600">Prevent user from reapplying for a period</p>
                </div>
              </label>
            </div>

            {formData.blockReapplication && (
              <div className="ml-6 mt-2">
                <Label htmlFor="blockDays">Block Period (days)</Label>
                <Select 
                  value={formData.blockReapplicationDays} 
                  onValueChange={(value) => handleInputChange('blockReapplicationDays', value)}
                >
                  <SelectTrigger className="mt-1 w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Administrative Notes */}
          <div>
            <Label htmlFor="adminNotes">Administrative Notes (internal)</Label>
            <Textarea
              id="adminNotes"
              value={formData.adminNotes}
              onChange={(e) => handleInputChange('adminNotes', e.target.value)}
              placeholder="Internal notes for administrative records..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Revoking...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Revoke Certification
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RevokeSkillModal;
