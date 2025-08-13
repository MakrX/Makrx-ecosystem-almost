import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Wrench, Plus, X, AlertCircle, Search, Settings } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  category: string;
  model?: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
}

interface SkillRequirement {
  id: string;
  equipmentId: string;
  skillId: string;
  skillName: string;
  skillLevel: string;
  required: boolean;
  alternative: boolean;
}

interface SkillRequirementsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment[];
  skills?: Skill[];
  selectedEquipmentId?: string;
}

const SkillRequirementsModal: React.FC<SkillRequirementsModalProps> = ({
  open,
  onOpenChange,
  equipment = [],
  skills = [],
  selectedEquipmentId
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'view' | 'manage'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedEquipment, setSelectedEquipment] = useState(selectedEquipmentId || '');
  const [requirements, setRequirements] = useState<SkillRequirement[]>([]);
  const [newRequirement, setNewRequirement] = useState({
    skillId: '',
    required: true,
    alternative: false
  });

  // Mock data for skill requirements
  const mockRequirements: SkillRequirement[] = [
    {
      id: 'req-1',
      equipmentId: 'eq-1',
      skillId: 'skill-1',
      skillName: '3D Printer Operation',
      skillLevel: 'beginner',
      required: true,
      alternative: false
    },
    {
      id: 'req-2',
      equipmentId: 'eq-1',
      skillId: 'skill-2',
      skillName: 'Safety Training',
      skillLevel: 'beginner',
      required: true,
      alternative: false
    },
    {
      id: 'req-3',
      equipmentId: 'eq-2',
      skillId: 'skill-3',
      skillName: 'Laser Safety',
      skillLevel: 'intermediate',
      required: true,
      alternative: false
    }
  ];

  useEffect(() => {
    if (open) {
      setRequirements(mockRequirements);
      if (selectedEquipmentId) {
        setSelectedEquipment(selectedEquipmentId);
      }
    }
  }, [open, selectedEquipmentId]);

  const getSelectedEquipmentData = () => {
    return equipment.find(eq => eq.id === selectedEquipment);
  };

  const getEquipmentRequirements = () => {
    return requirements.filter(req => req.equipmentId === selectedEquipment);
  };

  const filteredEquipment = equipment.filter(eq => 
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRequirement = () => {
    if (!newRequirement.skillId || !selectedEquipment) {
      setError('Please select equipment and skill');
      return;
    }

    const skill = skills.find(s => s.id === newRequirement.skillId);
    if (!skill) {
      setError('Selected skill not found');
      return;
    }

    // Check if requirement already exists
    const exists = requirements.some(
      req => req.equipmentId === selectedEquipment && req.skillId === newRequirement.skillId
    );

    if (exists) {
      setError('This skill requirement already exists for this equipment');
      return;
    }

    const newReq: SkillRequirement = {
      id: `req-${Date.now()}`,
      equipmentId: selectedEquipment,
      skillId: newRequirement.skillId,
      skillName: skill.name,
      skillLevel: skill.level,
      required: newRequirement.required,
      alternative: newRequirement.alternative
    };

    setRequirements(prev => [...prev, newReq]);
    setNewRequirement({
      skillId: '',
      required: true,
      alternative: false
    });
    setError(null);

    toast({
      title: "Requirement Added",
      description: `${skill.name} requirement added to ${getSelectedEquipmentData()?.name}`,
    });
  };

  const handleRemoveRequirement = (reqId: string) => {
    setRequirements(prev => prev.filter(req => req.id !== reqId));
    toast({
      title: "Requirement Removed",
      description: "Skill requirement has been removed",
      variant: "destructive",
    });
  };

  const handleUpdateRequirement = (reqId: string, field: keyof SkillRequirement, value: any) => {
    setRequirements(prev => prev.map(req => 
      req.id === reqId ? { ...req, [field]: value } : req
    ));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Requirements Updated",
        description: "Equipment skill requirements have been saved",
      });
      
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save requirements');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEquipmentData = getSelectedEquipmentData();
  const equipmentRequirements = getEquipmentRequirements();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Equipment Skill Requirements
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'view'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              View Requirements
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Requirements
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Equipment Selection */}
          <div className="mb-6">
            <Label htmlFor="equipment">Select Equipment</Label>
            <div className="mt-2 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {filteredEquipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      <div>
                        <div className="font-medium">{eq.name}</div>
                        <div className="text-sm text-gray-600">{eq.category}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEquipmentData && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h3 className="font-medium text-blue-900">{selectedEquipmentData.name}</h3>
              <p className="text-sm text-blue-800">Category: {selectedEquipmentData.category}</p>
              {selectedEquipmentData.model && (
                <p className="text-sm text-blue-800">Model: {selectedEquipmentData.model}</p>
              )}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'view' && selectedEquipment && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Requirements</h3>
              {equipmentRequirements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No skill requirements configured for this equipment</p>
                  <p className="text-sm">Switch to Manage tab to add requirements</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipmentRequirements.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={req.required ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}>
                          {req.required ? 'Required' : 'Recommended'}
                        </Badge>
                        <div>
                          <div className="font-medium">{req.skillName}</div>
                          <div className="text-sm text-gray-600">Level: {req.skillLevel}</div>
                        </div>
                      </div>
                      {req.alternative && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Alternative
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && selectedEquipment && (
            <div className="space-y-6">
              {/* Add New Requirement */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Add New Requirement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="skill">Skill</Label>
                    <Select value={newRequirement.skillId} onValueChange={(value) => setNewRequirement(prev => ({ ...prev, skillId: value }))}>
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

                  <div>
                    <Label>Requirement Type</Label>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={newRequirement.required}
                          onChange={() => setNewRequirement(prev => ({ ...prev, required: true }))}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Required</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={!newRequirement.required}
                          onChange={() => setNewRequirement(prev => ({ ...prev, required: false }))}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Recommended</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label>Options</Label>
                    <div className="mt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newRequirement.alternative}
                          onChange={(e) => setNewRequirement(prev => ({ ...prev, alternative: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm">Alternative option</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button onClick={handleAddRequirement} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Requirement
                  </Button>
                </div>
              </div>

              {/* Current Requirements (Editable) */}
              <div>
                <h3 className="text-lg font-medium mb-4">Current Requirements</h3>
                {equipmentRequirements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No requirements added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {equipmentRequirements.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <div>
                            <div className="font-medium">{req.skillName}</div>
                            <div className="text-sm text-gray-600">Level: {req.skillLevel}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={req.required ? 'required' : 'recommended'}
                            onChange={(e) => handleUpdateRequirement(req.id, 'required', e.target.value === 'required')}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="required">Required</option>
                            <option value="recommended">Recommended</option>
                          </select>

                          <label className="flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={req.alternative}
                              onChange={(e) => handleUpdateRequirement(req.id, 'alternative', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-xs">Alt</span>
                          </label>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveRequirement(req.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {activeTab === 'manage' && (
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillRequirementsModal;
