import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Award, 
  Wrench, 
  BookOpen, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  User,
  Settings
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  prerequisites: string[];
  equipment: string[];
  status: 'active' | 'disabled' | 'draft';
  createdAt?: string;
  updatedAt?: string;
  learningObjectives?: string;
  assessmentCriteria?: string;
  expirationPeriod?: number;
  requiresPracticalTest?: boolean;
  requiresTheoryTest?: boolean;
  requiresSafetyTest?: boolean;
  minimumPassingScore?: number;
  instructorRequired?: boolean;
  maxRetakes?: number;
}

interface UserSkill {
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'certified' | 'expired' | 'revoked';
  certifiedAt?: string;
  expiresAt?: string;
  certifiedBy: string;
  notes?: string;
}

interface SkillDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: Skill;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SkillDetailsModal: React.FC<SkillDetailsModalProps> = ({
  open,
  onOpenChange,
  skill,
  onEdit,
  onDelete
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [certifiedUsers, setCertifiedUsers] = useState<UserSkill[]>([]);
  const [stats, setStats] = useState({
    totalCertified: 0,
    pendingCertifications: 0,
    expiredCertifications: 0,
    averageScore: 0
  });

  // Mock data for certified users
  const mockCertifiedUsers: UserSkill[] = [
    {
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john.smith@makrcave.local',
      status: 'certified',
      certifiedAt: '2024-01-15T10:00:00Z',
      expiresAt: '2025-01-15T10:00:00Z',
      certifiedBy: 'Sarah Martinez',
      notes: 'Completed practical test successfully'
    },
    {
      userId: 'user-2',
      userName: 'Emily Davis',
      userEmail: 'emily.davis@makrcave.local',
      status: 'pending',
      certifiedBy: '',
      notes: 'Awaiting practical assessment'
    },
    {
      userId: 'user-3',
      userName: 'Mike Johnson',
      userEmail: 'mike.johnson@makrcave.local',
      status: 'expired',
      certifiedAt: '2023-06-01T10:00:00Z',
      expiresAt: '2024-06-01T10:00:00Z',
      certifiedBy: 'Tech Lead',
      notes: 'Needs recertification'
    }
  ];

  useEffect(() => {
    if (open) {
      setCertifiedUsers(mockCertifiedUsers);
      setStats({
        totalCertified: mockCertifiedUsers.filter(u => u.status === 'certified').length,
        pendingCertifications: mockCertifiedUsers.filter(u => u.status === 'pending').length,
        expiredCertifications: mockCertifiedUsers.filter(u => u.status === 'expired').length,
        averageScore: 87
      });
    }
  }, [open]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'certified':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Certified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case 'revoked':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            Revoked
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
      onDelete?.();
      toast({
        title: "Skill Deleted",
        description: `${skill.name} has been removed from the system`,
        variant: "destructive",
      });
      onOpenChange(false);
    }
  };

  const handleStatusToggle = () => {
    const newStatus = skill.status === 'active' ? 'disabled' : 'active';
    toast({
      title: "Status Updated",
      description: `${skill.name} is now ${newStatus}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6" />
              <div>
                <DialogTitle className="text-xl">{skill.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{skill.category}</Badge>
                  {getLevelBadge(skill.level)}
                  <Badge variant={skill.status === 'active' ? 'default' : 'secondary'}>
                    {skill.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleStatusToggle}
                className={skill.status === 'active' ? 'text-orange-600' : 'text-green-600'}
              >
                {skill.status === 'active' ? 'Disable' : 'Enable'}
              </Button>
              {onDelete && (
                <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Certified Users
              </TabsTrigger>
              <TabsTrigger value="requirements" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Requirements
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Assessment
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Certified Users</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalCertified}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats.pendingCertifications}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Expired</p>
                      <p className="text-2xl font-bold text-red-900">{stats.expiredCertifications}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Avg Score</p>
                      <p className="text-2xl font-bold text-green-900">{stats.averageScore}%</p>
                    </div>
                    <Star className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700">{skill.description}</p>
              </div>

              {skill.learningObjectives && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">Learning Objectives</h3>
                  <p className="text-blue-800">{skill.learningObjectives}</p>
                </div>
              )}

              {skill.assessmentCriteria && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-purple-900 mb-4">Assessment Criteria</h3>
                  <p className="text-purple-800">{skill.assessmentCriteria}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Prerequisites</h4>
                  {skill.prerequisites.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skill.prerequisites.map((prereq, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No prerequisites required</p>
                  )}
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Equipment Access</h4>
                  {skill.equipment.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skill.equipment.map((equip, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                          <Wrench className="h-3 w-3 mr-1" />
                          {equip}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No equipment access granted</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Certified Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Certified Users</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Certified Date</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Expires</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Certified By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {certifiedUsers.map((userSkill, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <User className="h-8 w-8 bg-gray-200 rounded-full p-1.5 mr-3" />
                              <div>
                                <div className="font-medium text-gray-900">{userSkill.userName}</div>
                                <div className="text-sm text-gray-600">{userSkill.userEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(userSkill.status)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-900">
                              {userSkill.certifiedAt ? new Date(userSkill.certifiedAt).toLocaleDateString() : '-'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-900">
                              {userSkill.expiresAt ? new Date(userSkill.expiresAt).toLocaleDateString() : '-'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-900">
                              {userSkill.certifiedBy || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Requirements Tab */}
            <TabsContent value="requirements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Requirements</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Level</span>
                      <span className="font-medium">{getLevelBadge(skill.level)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Instructor Required</span>
                      <span className="font-medium">{skill.instructorRequired ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Expiration Period</span>
                      <span className="font-medium">{skill.expirationPeriod || 365} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Max Retakes</span>
                      <span className="font-medium">{skill.maxRetakes || 3}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Prerequisites</h3>
                  {skill.prerequisites.length > 0 ? (
                    <div className="space-y-2">
                      {skill.prerequisites.map((prereq, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm">{prereq}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No prerequisites required</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Access</h3>
                {skill.equipment.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {skill.equipment.map((equip, index) => (
                      <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <Wrench className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="text-sm font-medium">{equip}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No equipment access granted</p>
                )}
              </div>
            </TabsContent>

            {/* Assessment Tab */}
            <TabsContent value="assessment" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Required Tests</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Safety Test</span>
                      <div className="flex items-center">
                        {skill.requiresSafetyTest ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-gray-400">Not required</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Theory Test</span>
                      <div className="flex items-center">
                        {skill.requiresTheoryTest ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-gray-400">Not required</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Practical Test</span>
                      <div className="flex items-center">
                        {skill.requiresPracticalTest ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-gray-400">Not required</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Scoring</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Minimum Passing Score</span>
                      <span className="font-medium">{skill.minimumPassingScore || 80}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Score</span>
                      <span className="font-medium text-green-600">{stats.averageScore}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pass Rate</span>
                      <span className="font-medium text-green-600">
                        {Math.round((stats.totalCertified / (stats.totalCertified + stats.expiredCertifications)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {skill.assessmentCriteria && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Criteria</h3>
                  <p className="text-gray-700">{skill.assessmentCriteria}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillDetailsModal;
