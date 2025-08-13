import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface UserSkill {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status: 'pending' | 'certified' | 'expired' | 'revoked';
  certifiedAt?: string;
  expiresAt?: string;
  certifiedBy: string;
  equipment: string[]; // Equipment IDs this skill grants access to
  notes?: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  prerequisites: string[];
  equipment: string[];
  status: 'active' | 'disabled';
  requiredForEquipment: string[]; // Equipment that requires this skill
}

interface SkillRequest {
  id: string;
  userId: string;
  userName: string;
  skillId: string;
  skillName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  notes?: string;
}

interface SkillContextType {
  userSkills: UserSkill[];
  availableSkills: Skill[];
  skillRequests: SkillRequest[];
  loading: boolean;
  
  // User skill checks
  hasSkill: (skillId: string) => boolean;
  hasSkillForEquipment: (equipmentId: string) => boolean;
  canAccessEquipment: (equipmentId: string, requiredSkills?: string[]) => {
    canAccess: boolean;
    missingSkills: string[];
    reason?: string;
  };
  
  // Skill management actions
  requestSkill: (skillId: string, notes?: string) => Promise<void>;
  approveSkillRequest: (requestId: string, notes?: string) => Promise<void>;
  rejectSkillRequest: (requestId: string, reason?: string) => Promise<void>;
  revokeSkill: (userSkillId: string, reason?: string) => Promise<void>;
  grantSkill: (userId: string, skillId: string, notes?: string) => Promise<void>;
  
  // Equipment integration
  getRequiredSkillsForEquipment: (equipmentId: string) => Skill[];
  getUserSkillsForEquipment: (equipmentId: string) => UserSkill[];
  
  // Refresh data
  refreshUserSkills: () => Promise<void>;
  refreshSkillRequests: () => Promise<void>;
}

const SkillContext = createContext<SkillContextType | undefined>(undefined);

export function SkillProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillRequests, setSkillRequests] = useState<SkillRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockSkills: Skill[] = [
    {
      id: 'skill-1',
      name: '3D Printer Operation',
      category: 'Digital Fabrication',
      level: 'beginner',
      description: 'Basic operation of FDM 3D printers',
      prerequisites: [],
      equipment: ['eq-1', 'eq-4'], // Maps to specific equipment IDs
      status: 'active',
      requiredForEquipment: ['eq-1', 'eq-4'] // These equipment require this skill
    },
    {
      id: 'skill-2',
      name: 'Laser Cutter Safety',
      category: 'Laser Cutting',
      level: 'beginner',
      description: 'Safety protocols and basic operation of CO2 laser cutters',
      prerequisites: [],
      equipment: ['eq-2'],
      status: 'active',
      requiredForEquipment: ['eq-2']
    },
    {
      id: 'skill-3',
      name: 'CNC Operation',
      category: 'Machining',
      level: 'advanced',
      description: 'Safe operation of CNC milling machines',
      prerequisites: ['Basic Machining', 'Safety Training'],
      equipment: ['eq-3'],
      status: 'active',
      requiredForEquipment: ['eq-3']
    }
  ];

  const mockUserSkills: UserSkill[] = [
    {
      id: 'us-1',
      skillId: 'skill-1',
      skillName: '3D Printer Operation',
      category: 'Digital Fabrication',
      level: 'beginner',
      status: 'certified',
      certifiedAt: '2024-01-15T10:00:00Z',
      expiresAt: '2025-01-15T10:00:00Z',
      certifiedBy: 'Sarah Martinez',
      equipment: ['eq-1', 'eq-4'],
      notes: 'Completed practical test successfully'
    }
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserSkills();
      loadAvailableSkills();
      loadSkillRequests();
    }
  }, [isAuthenticated, user]);

  const loadUserSkills = async () => {
    try {
      // In real implementation, fetch from API
      setUserSkills(mockUserSkills);
    } catch (error) {
      console.error('Error loading user skills:', error);
    }
  };

  const loadAvailableSkills = async () => {
    try {
      setAvailableSkills(mockSkills);
    } catch (error) {
      console.error('Error loading available skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSkillRequests = async () => {
    try {
      // Mock data for skill requests
      setSkillRequests([]);
    } catch (error) {
      console.error('Error loading skill requests:', error);
    }
  };

  // Check if user has a specific skill
  const hasSkill = (skillId: string): boolean => {
    return userSkills.some(skill => 
      skill.skillId === skillId && 
      skill.status === 'certified' &&
      (!skill.expiresAt || new Date(skill.expiresAt) > new Date())
    );
  };

  // Check if user has skill for specific equipment
  const hasSkillForEquipment = (equipmentId: string): boolean => {
    const requiredSkills = getRequiredSkillsForEquipment(equipmentId);
    
    if (requiredSkills.length === 0) {
      return true; // No skills required
    }

    return requiredSkills.every(skill => hasSkill(skill.id));
  };

  // Comprehensive equipment access check
  const canAccessEquipment = (equipmentId: string, requiredSkills?: string[]) => {
    const equipment = availableSkills.find(s => s.requiredForEquipment.includes(equipmentId));
    const skillsNeeded = requiredSkills || (equipment ? [equipment.id] : []);
    
    if (skillsNeeded.length === 0) {
      return { canAccess: true, missingSkills: [] };
    }

    const missingSkills: string[] = [];
    
    for (const skillId of skillsNeeded) {
      if (!hasSkill(skillId)) {
        const skill = availableSkills.find(s => s.id === skillId);
        if (skill) {
          missingSkills.push(skill.name);
        }
      }
    }

    if (missingSkills.length > 0) {
      return {
        canAccess: false,
        missingSkills,
        reason: `Missing required skills: ${missingSkills.join(', ')}`
      };
    }

    return { canAccess: true, missingSkills: [] };
  };

  // Get required skills for specific equipment
  const getRequiredSkillsForEquipment = (equipmentId: string): Skill[] => {
    return availableSkills.filter(skill => 
      skill.requiredForEquipment.includes(equipmentId) && 
      skill.status === 'active'
    );
  };

  // Get user's skills that apply to specific equipment
  const getUserSkillsForEquipment = (equipmentId: string): UserSkill[] => {
    return userSkills.filter(userSkill => 
      userSkill.equipment.includes(equipmentId) &&
      userSkill.status === 'certified'
    );
  };

  // Request a skill
  const requestSkill = async (skillId: string, notes?: string): Promise<void> => {
    try {
      // In real implementation, make API call
      const newRequest: SkillRequest = {
        id: `req-${Date.now()}`,
        userId: user?.id || '',
        userName: user?.firstName + ' ' + user?.lastName || '',
        skillId,
        skillName: availableSkills.find(s => s.id === skillId)?.name || '',
        status: 'pending',
        requestedAt: new Date().toISOString(),
        notes
      };
      
      setSkillRequests(prev => [...prev, newRequest]);
    } catch (error) {
      console.error('Error requesting skill:', error);
      throw error;
    }
  };

  // Approve skill request (admin only)
  const approveSkillRequest = async (requestId: string, notes?: string): Promise<void> => {
    try {
      const request = skillRequests.find(r => r.id === requestId);
      if (!request) return;

      // Update request status
      setSkillRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: 'approved' as const } : r)
      );

      // Grant the skill to the user
      await grantSkill(request.userId, request.skillId, notes);
    } catch (error) {
      console.error('Error approving skill request:', error);
      throw error;
    }
  };

  // Reject skill request
  const rejectSkillRequest = async (requestId: string, reason?: string): Promise<void> => {
    try {
      setSkillRequests(prev => 
        prev.map(r => r.id === requestId ? { 
          ...r, 
          status: 'rejected' as const,
          notes: reason 
        } : r)
      );
    } catch (error) {
      console.error('Error rejecting skill request:', error);
      throw error;
    }
  };

  // Grant skill to user (admin only)
  const grantSkill = async (userId: string, skillId: string, notes?: string): Promise<void> => {
    try {
      const skill = availableSkills.find(s => s.id === skillId);
      if (!skill) return;

      const newUserSkill: UserSkill = {
        id: `us-${Date.now()}`,
        skillId,
        skillName: skill.name,
        category: skill.category,
        level: skill.level,
        status: 'certified',
        certifiedAt: new Date().toISOString(),
        expiresAt: undefined, // Could be set based on skill requirements
        certifiedBy: user?.firstName + ' ' + user?.lastName || 'Admin',
        equipment: skill.equipment,
        notes
      };

      if (userId === user?.id) {
        setUserSkills(prev => [...prev, newUserSkill]);
      }
    } catch (error) {
      console.error('Error granting skill:', error);
      throw error;
    }
  };

  // Revoke skill
  const revokeSkill = async (userSkillId: string, reason?: string): Promise<void> => {
    try {
      setUserSkills(prev => 
        prev.map(skill => 
          skill.id === userSkillId 
            ? { ...skill, status: 'revoked' as const, notes: reason }
            : skill
        )
      );
    } catch (error) {
      console.error('Error revoking skill:', error);
      throw error;
    }
  };

  // Refresh functions
  const refreshUserSkills = async (): Promise<void> => {
    await loadUserSkills();
  };

  const refreshSkillRequests = async (): Promise<void> => {
    await loadSkillRequests();
  };

  return (
    <SkillContext.Provider value={{
      userSkills,
      availableSkills,
      skillRequests,
      loading,
      hasSkill,
      hasSkillForEquipment,
      canAccessEquipment,
      requestSkill,
      approveSkillRequest,
      rejectSkillRequest,
      revokeSkill,
      grantSkill,
      getRequiredSkillsForEquipment,
      getUserSkillsForEquipment,
      refreshUserSkills,
      refreshSkillRequests
    }}>
      {children}
    </SkillContext.Provider>
  );
}

export function useSkills() {
  const context = useContext(SkillContext);
  if (context === undefined) {
    throw new Error('useSkills must be used within a SkillProvider');
  }
  return context;
}
