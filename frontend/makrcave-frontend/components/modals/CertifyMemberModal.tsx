import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Award, AlertCircle, User, Calendar, CheckCircle } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  prerequisites: string[];
  equipment: string[];
}

interface CertifyMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members?: Member[];
  skills?: Skill[];
  existingCertification?: {
    userId: string;
    skillId: string;
    userName: string;
    skillName: string;
    status: 'pending' | 'certified' | 'expired' | 'revoked';
  };
}

const CertifyMemberModal: React.FC<CertifyMemberModalProps> = ({
  open,
  onOpenChange,
  members = [],
  skills = [],
  existingCertification
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    userId: existingCertification?.userId || '',
    skillId: existingCertification?.skillId || '',
    expirationDate: '',
    notes: '',
    certificationType: 'full', // full, provisional, renewal
    assessmentScore: '',
    practicalTestPassed: false,
    theoryTestPassed: false,
    safetyTestPassed: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const getSelectedMember = () => {
    return members.find(m => m.id === formData.userId);
  };

  const getSelectedSkill = () => {
    return skills.find(s => s.id === formData.skillId);
  };

  const validateForm = (): boolean => {
    if (!formData.userId) {
      setError('Please select a member');
      return false;
    }
    if (!formData.skillId) {
      setError('Please select a skill');
      return false;
    }
    const selectedSkill = getSelectedSkill();
    if (selectedSkill?.level === 'advanced' || selectedSkill?.level === 'expert') {
      if (!formData.practicalTestPassed || !formData.theoryTestPassed || !formData.safetyTestPassed) {
        setError('All tests must be passed for advanced/expert level skills');
        return false;
      }
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const member = getSelectedMember();
      const skill = getSelectedSkill();
      
      toast({
        title: "Certification Approved",
        description: `${member?.name} has been certified for ${skill?.name}`,
      });
      
      // Reset form
      setFormData({
        userId: '',
        skillId: '',
        expirationDate: '',
        notes: '',
        certificationType: 'full',
        assessmentScore: '',
        practicalTestPassed: false,
        theoryTestPassed: false,
        safetyTestPassed: false,
      });
      
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to certify member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      userId: '',
      skillId: '',
      expirationDate: '',
      notes: '',
      certificationType: 'full',
      assessmentScore: '',
      practicalTestPassed: false,
      theoryTestPassed: false,
      safetyTestPassed: false,
    });
    setError(null);
    onOpenChange(false);
  };

  const selectedSkill = getSelectedSkill();
  const selectedMember = getSelectedMember();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {existingCertification ? 'Review Certification Request' : 'Certify Member'}
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

          {existingCertification && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Pending Review</span>
              </div>
              <p className="text-sm text-blue-800">
                <strong>{existingCertification.userName}</strong> is requesting certification for{' '}
                <strong>{existingCertification.skillName}</strong>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="member">Member *</Label>
              <Select 
                value={formData.userId} 
                onValueChange={(value) => handleInputChange('userId', value)}
                disabled={!!existingCertification}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="skill">Skill *</Label>
              <Select 
                value={formData.skillId} 
                onValueChange={(value) => handleInputChange('skillId', value)}
                disabled={!!existingCertification}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  {skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      <div>
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-sm text-gray-600">{skill.category} - {skill.level}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSkill && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-2">Skill Information</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Category:</strong> {selectedSkill.category}</div>
                <div><strong>Level:</strong> 
                  <Badge variant="outline" className="ml-2">
                    {selectedSkill.level}
                  </Badge>
                </div>
                <div><strong>Description:</strong> {selectedSkill.description}</div>
                {selectedSkill.prerequisites.length > 0 && (
                  <div>
                    <strong>Prerequisites:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSkill.prerequisites.map((prereq, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedSkill.equipment.length > 0 && (
                  <div>
                    <strong>Equipment Access:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSkill.equipment.map((equip, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                          {equip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="certificationType">Certification Type</Label>
              <Select 
                value={formData.certificationType} 
                onValueChange={(value) => handleInputChange('certificationType', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Certification</SelectItem>
                  <SelectItem value="provisional">Provisional</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                className="mt-1"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assessmentScore">Assessment Score (optional)</Label>
            <Input
              id="assessmentScore"
              type="number"
              min="0"
              max="100"
              value={formData.assessmentScore}
              onChange={(e) => handleInputChange('assessmentScore', e.target.value)}
              placeholder="Score out of 100"
              className="mt-1"
            />
          </div>

          {/* Assessment Checklist */}
          <div>
            <Label className="text-base font-medium">Assessment Checklist</Label>
            <div className="mt-2 space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.safetyTestPassed}
                  onChange={(e) => handleInputChange('safetyTestPassed', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Safety Test Passed</span>
                <CheckCircle className={`h-4 w-4 ${formData.safetyTestPassed ? 'text-green-600' : 'text-gray-300'}`} />
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.theoryTestPassed}
                  onChange={(e) => handleInputChange('theoryTestPassed', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Theory Test Passed</span>
                <CheckCircle className={`h-4 w-4 ${formData.theoryTestPassed ? 'text-green-600' : 'text-gray-300'}`} />
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.practicalTestPassed}
                  onChange={(e) => handleInputChange('practicalTestPassed', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Practical Test Passed</span>
                <CheckCircle className={`h-4 w-4 ${formData.practicalTestPassed ? 'text-green-600' : 'text-gray-300'}`} />
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about the certification..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Certifying...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Certify Member
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CertifyMemberModal;
