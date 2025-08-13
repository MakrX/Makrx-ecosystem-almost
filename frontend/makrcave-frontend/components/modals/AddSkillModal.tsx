import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Plus, X, AlertCircle, GraduationCap, Wrench, Book, Users } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  category: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface AddSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment[];
  existingSkills?: Skill[];
}

const AddSkillModal: React.FC<AddSkillModalProps> = ({
  open,
  onOpenChange,
  equipment = [],
  existingSkills = []
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    description: '',
    learningObjectives: '',
    assessmentCriteria: '',
    prerequisites: [] as string[],
    equipmentAccess: [] as string[],
    expirationPeriod: '365', // days
    requiresPracticalTest: true,
    requiresTheoryTest: true,
    requiresSafetyTest: true,
    minimumPassingScore: '80',
    instructorRequired: false,
    maxRetakes: '3',
    status: 'active' as 'active' | 'draft' | 'disabled'
  });

  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newEquipment, setNewEquipment] = useState('');

  const skillCategories = [
    'Digital Fabrication',
    'Laser Cutting',
    'Machining',
    'Electronics',
    'Woodworking',
    'Metalworking',
    'Safety',
    'Design',
    'Software',
    'General',
    'Textiles',
    'Ceramics',
    'Other'
  ];

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.prerequisites.includes(newPrerequisite.trim())) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addEquipment = () => {
    if (newEquipment && !formData.equipmentAccess.includes(newEquipment)) {
      const equipmentName = equipment.find(eq => eq.id === newEquipment)?.name || newEquipment;
      setFormData(prev => ({
        ...prev,
        equipmentAccess: [...prev.equipmentAccess, equipmentName]
      }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipmentAccess: prev.equipmentAccess.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Skill name is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.learningObjectives.trim()) {
      setError('Learning objectives are required');
      return false;
    }
    if (!formData.assessmentCriteria.trim()) {
      setError('Assessment criteria are required');
      return false;
    }
    if (parseInt(formData.minimumPassingScore) < 0 || parseInt(formData.minimumPassingScore) > 100) {
      setError('Minimum passing score must be between 0 and 100');
      return false;
    }
    if (parseInt(formData.maxRetakes) < 0) {
      setError('Max retakes must be 0 or greater');
      return false;
    }
    if (parseInt(formData.expirationPeriod) < 1) {
      setError('Expiration period must be at least 1 day');
      return false;
    }
    
    // Check if skill name already exists
    const existingSkill = existingSkills.find(
      skill => skill.name.toLowerCase() === formData.name.toLowerCase()
    );
    if (existingSkill) {
      setError('A skill with this name already exists');
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
        title: "Skill Created",
        description: `${formData.name} has been added to the skill system`,
      });
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        level: 'beginner',
        description: '',
        learningObjectives: '',
        assessmentCriteria: '',
        prerequisites: [],
        equipmentAccess: [],
        expirationPeriod: '365',
        requiresPracticalTest: true,
        requiresTheoryTest: true,
        requiresSafetyTest: true,
        minimumPassingScore: '80',
        instructorRequired: false,
        maxRetakes: '3',
        status: 'active'
      });
      
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      category: '',
      level: 'beginner',
      description: '',
      learningObjectives: '',
      assessmentCriteria: '',
      prerequisites: [],
      equipmentAccess: [],
      expirationPeriod: '365',
      requiresPracticalTest: true,
      requiresTheoryTest: true,
      requiresSafetyTest: true,
      minimumPassingScore: '80',
      instructorRequired: false,
      maxRetakes: '3',
      status: 'active'
    });
    setNewPrerequisite('');
    setNewEquipment('');
    setError(null);
    onOpenChange(false);
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      beginner: { color: 'bg-blue-100 text-blue-800', icon: '★' },
      intermediate: { color: 'bg-yellow-100 text-yellow-800', icon: '★★' },
      advanced: { color: 'bg-orange-100 text-orange-800', icon: '★★★' },
      expert: { color: 'bg-red-100 text-red-800', icon: '★★★★' }
    };
    
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.beginner;
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.icon} {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Add New Skill
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Skill Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., 3D Printer Operation"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Skill Level *</Label>
                <Select 
                  value={formData.level} 
                  onValueChange={(value) => handleInputChange('level', value as any)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  {getLevelBadge(formData.level)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value as any)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expirationPeriod">Expiration Period (days)</Label>
                <Input
                  id="expirationPeriod"
                  type="number"
                  min="1"
                  value={formData.expirationPeriod}
                  onChange={(e) => handleInputChange('expirationPeriod', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How long the certification is valid (365 = 1 year)
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.instructorRequired}
                    onChange={(e) => handleInputChange('instructorRequired', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Instructor supervision required</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description and Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the skill..."
                rows={4}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="learningObjectives">Learning Objectives *</Label>
              <Textarea
                id="learningObjectives"
                value={formData.learningObjectives}
                onChange={(e) => handleInputChange('learningObjectives', e.target.value)}
                placeholder="What will students learn and be able to do..."
                rows={4}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assessmentCriteria">Assessment Criteria *</Label>
            <Textarea
              id="assessmentCriteria"
              value={formData.assessmentCriteria}
              onChange={(e) => handleInputChange('assessmentCriteria', e.target.value)}
              placeholder="How will competency be assessed and measured..."
              rows={3}
              className="mt-1"
              required
            />
          </div>

          {/* Prerequisites */}
          <div>
            <Label>Prerequisites</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="Add prerequisite skill..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                />
                <Button type="button" onClick={addPrerequisite} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.prerequisites.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.prerequisites.map((prereq, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {prereq}
                      <button
                        type="button"
                        onClick={() => removePrerequisite(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Equipment Access */}
          <div>
            <Label>Equipment Access Granted</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <Select value={newEquipment} onValueChange={setNewEquipment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name} ({eq.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addEquipment} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.equipmentAccess.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.equipmentAccess.map((equip, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1 bg-blue-50">
                      <Wrench className="h-3 w-3" />
                      {equip}
                      <button
                        type="button"
                        onClick={() => removeEquipment(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Assessment Settings */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Book className="h-4 w-4" />
              Assessment Settings
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">Required Tests</h5>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.requiresSafetyTest}
                      onChange={(e) => handleInputChange('requiresSafetyTest', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Safety Test</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.requiresTheoryTest}
                      onChange={(e) => handleInputChange('requiresTheoryTest', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Theory Test</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.requiresPracticalTest}
                      onChange={(e) => handleInputChange('requiresPracticalTest', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Practical Test</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="minimumPassingScore">Minimum Passing Score (%)</Label>
                  <Input
                    id="minimumPassingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.minimumPassingScore}
                    onChange={(e) => handleInputChange('minimumPassingScore', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxRetakes">Maximum Retakes</Label>
                  <Input
                    id="maxRetakes"
                    type="number"
                    min="0"
                    value={formData.maxRetakes}
                    onChange={(e) => handleInputChange('maxRetakes', e.target.value)}
                    className="mt-1"
                  />
                </div>
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
                  Create Skill
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSkillModal;
