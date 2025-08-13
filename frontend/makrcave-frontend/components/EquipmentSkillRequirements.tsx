import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  GraduationCap,
  Shield,
  Star,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Wrench,
  Package,
  Zap,
  Settings,
  BookOpen
} from 'lucide-react';
import { useSkills } from '../contexts/SkillContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface SkillRequirement {
  skill_id: string;
  skill_name: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  is_required: boolean;
}

interface EquipmentSkillRequirement {
  equipment_id: string;
  equipment_name: string;
  required_skills: SkillRequirement[];
}

const EquipmentSkillRequirements: React.FC = () => {
  const { user } = useAuth();
  const { userSkills, hasSkill, canAccessEquipment } = useSkills();
  const { toast } = useToast();
  
  const [skillRequirements, setSkillRequirements] = useState<EquipmentSkillRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [showOnlyAccessible, setShowOnlyAccessible] = useState(false);

  useEffect(() => {
    fetchSkillRequirements();
  }, []);

  const fetchSkillRequirements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/equipment/skill-requirements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSkillRequirements(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load equipment skill requirements",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching skill requirements:', error);
      toast({
        title: "Error",
        description: "Failed to load equipment skill requirements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevelBadge = (level: string, isUserLevel: boolean = false) => {
    const levelConfig = {
      beginner: { 
        color: isUserLevel ? 'bg-blue-100 text-blue-800' : 'bg-blue-50 text-blue-700', 
        stars: '★',
        icon: BookOpen
      },
      intermediate: { 
        color: isUserLevel ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-50 text-yellow-700', 
        stars: '★★',
        icon: Settings
      },
      advanced: { 
        color: isUserLevel ? 'bg-orange-100 text-orange-800' : 'bg-orange-50 text-orange-700', 
        stars: '★★★',
        icon: Wrench
      },
      expert: { 
        color: isUserLevel ? 'bg-red-100 text-red-800' : 'bg-red-50 text-red-700', 
        stars: '★★★★',
        icon: GraduationCap
      }
    };
    
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.beginner;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} border-current`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.stars} {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'digital fabrication':
        return <Package className="h-4 w-4" />;
      case 'laser cutting':
        return <Zap className="h-4 w-4" />;
      case 'machining':
        return <Wrench className="h-4 w-4" />;
      case 'safety':
        return <Shield className="h-4 w-4" />;
      case 'programming':
        return <Settings className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getUserSkillStatus = (skillId: string) => {
    const userSkill = userSkills.find(us => us.skillId === skillId && us.status === 'certified');
    if (userSkill) {
      return { hasSkill: true, level: userSkill.level };
    }
    return { hasSkill: false, level: null };
  };

  const getAccessStatus = (equipmentId: string) => {
    const accessCheck = canAccessEquipment(equipmentId);
    return {
      canAccess: accessCheck.canAccess,
      missingSkills: accessCheck.missingSkills
    };
  };

  const filteredRequirements = skillRequirements.filter(equipment => {
    const matchesSearch = equipment.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.required_skills.some(skill => 
                           skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesCategory = selectedCategory === 'all' || 
                           equipment.required_skills.some(skill => skill.category === selectedCategory);
    
    const matchesSkillLevel = selectedSkillLevel === 'all' ||
                             equipment.required_skills.some(skill => skill.required_level === selectedSkillLevel);
    
    const matchesAccessibility = !showOnlyAccessible || getAccessStatus(equipment.equipment_id).canAccess;
    
    return matchesSearch && matchesCategory && matchesSkillLevel && matchesAccessibility;
  });

  const allCategories = [...new Set(skillRequirements.flatMap(eq => eq.required_skills.map(skill => skill.category)))];
  const allLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

  const stats = {
    totalEquipment: skillRequirements.length,
    accessibleEquipment: skillRequirements.filter(eq => getAccessStatus(eq.equipment_id).canAccess).length,
    totalSkills: [...new Set(skillRequirements.flatMap(eq => eq.required_skills.map(skill => skill.skill_id)))].length,
    userCertifiedSkills: userSkills.filter(us => us.status === 'certified').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Loading skill requirements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Equipment Skill Requirements
          </h2>
          <p className="text-gray-600">View skill requirements for each piece of equipment</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold">{stats.totalEquipment}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accessible to You</p>
                <p className="text-2xl font-bold text-green-600">{stats.accessibleEquipment}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Required Skills</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSkills}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Certifications</p>
                <p className="text-2xl font-bold text-orange-600">{stats.userCertifiedSkills}</p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search equipment or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Categories</option>
          {allCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select
          value={selectedSkillLevel}
          onChange={(e) => setSelectedSkillLevel(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Levels</option>
          {allLevels.map(level => (
            <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
          ))}
        </select>
        
        <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
          <input
            type="checkbox"
            checked={showOnlyAccessible}
            onChange={(e) => setShowOnlyAccessible(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Show only accessible</span>
        </label>
      </div>

      {/* Equipment List */}
      <div className="space-y-4">
        {filteredRequirements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequirements.map((equipment) => {
            const accessStatus = getAccessStatus(equipment.equipment_id);
            
            return (
              <Card key={equipment.equipment_id} className={`${accessStatus.canAccess ? 'border-green-200' : 'border-red-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <Wrench className="h-5 w-5" />
                      {equipment.equipment_name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {accessStatus.canAccess ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accessible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                          <XCircle className="h-3 w-3 mr-1" />
                          Skills Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Required Skills</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {equipment.required_skills.map((skill) => {
                          const userSkillStatus = getUserSkillStatus(skill.skill_id);
                          
                          return (
                            <div key={skill.skill_id} className={`border rounded-lg p-4 ${
                              userSkillStatus.hasSkill ? 'border-green-200 bg-green-50' : 'border-gray-200'
                            }`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(skill.category)}
                                  <h5 className="font-medium text-gray-900">{skill.skill_name}</h5>
                                  {skill.is_required && (
                                    <Badge variant="outline" className="bg-red-100 text-red-800">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                                {userSkillStatus.hasSkill ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Required Level:</span>
                                  {getSkillLevelBadge(skill.required_level)}
                                </div>
                                
                                {userSkillStatus.hasSkill && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Your Level:</span>
                                    {getSkillLevelBadge(userSkillStatus.level!, true)}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Category:</span>
                                  <Badge variant="outline" className="text-xs">
                                    {skill.category}
                                  </Badge>
                                </div>
                              </div>
                              
                              {!userSkillStatus.hasSkill && (
                                <div className="mt-3 pt-3 border-t">
                                  <Button size="sm" variant="outline" className="w-full">
                                    Request Skill
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {!accessStatus.canAccess && accessStatus.missingSkills.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-red-800">Missing Skills</h4>
                            <p className="text-sm text-red-700 mt-1">
                              You need the following skills to access this equipment:
                            </p>
                            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                              {accessStatus.missingSkills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EquipmentSkillRequirements;
