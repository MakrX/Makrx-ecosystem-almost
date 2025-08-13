import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Member {
  id: string;
  keycloak_user_id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'maker' | 'service_provider' | 'admin' | 'makerspace_admin';
  membership_plan_id: string;
  membership_plan_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status: 'active' | 'expired' | 'pending' | 'suspended';
  last_login?: string;
  join_date: string;
  skills: string[];
  projects_count: number;
  reservations_count: number;
  credits_used: number;
  credits_remaining: number;
  profile_image?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price: number;
  features: string[];
  access_level: {
    equipment: string[];
    rooms: string[];
    hours_per_day?: number;
    max_reservations?: number;
  };
  is_active: boolean;
  makerspace_id: string;
}

export interface MemberInvite {
  id: string;
  email: string;
  role: string;
  membership_plan_id: string;
  invited_by: string;
  invite_token: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
}

interface MemberContextType {
  // Members
  members: Member[];
  memberStats: {
    total: number;
    active: number;
    expired: number;
    pending: number;
    byRole: Record<string, number>;
  };
  loading: boolean;
  error: string | null;

  // Membership Plans
  membershipPlans: MembershipPlan[];
  plansLoading: boolean;

  // Invites
  invites: MemberInvite[];
  invitesLoading: boolean;

  // Member Actions
  fetchMembers: () => Promise<void>;
  addMember: (memberData: Partial<Member>) => Promise<Member>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<Member>;
  removeMember: (id: string) => Promise<void>;
  suspendMember: (id: string, reason?: string) => Promise<void>;
  reactivateMember: (id: string) => Promise<void>;

  // Membership Plan Actions
  fetchMembershipPlans: () => Promise<void>;
  createMembershipPlan: (planData: Partial<MembershipPlan>) => Promise<MembershipPlan>;
  updateMembershipPlan: (id: string, updates: Partial<MembershipPlan>) => Promise<MembershipPlan>;
  deleteMembershipPlan: (id: string) => Promise<void>;

  // Invite Actions
  fetchInvites: () => Promise<void>;
  sendInvite: (inviteData: { email: string; role: string; membership_plan_id: string }) => Promise<MemberInvite>;
  resendInvite: (id: string) => Promise<void>;
  cancelInvite: (id: string) => Promise<void>;

  // Search and Filter
  searchMembers: (query: string) => Member[];
  filterMembers: (filters: { status?: string; role?: string; plan?: string }) => Member[];
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const useMember = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  return context;
};

interface MemberProviderProps {
  children: ReactNode;
}

export const MemberProvider: React.FC<MemberProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [invites, setInvites] = useState<MemberInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockMembers: Member[] = [
    {
      id: '1',
      keycloak_user_id: 'kc_001',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'maker',
      membership_plan_id: 'plan_1',
      membership_plan_name: 'Pro Maker',
      start_date: '2024-01-15',
      end_date: '2024-12-15',
      is_active: true,
      status: 'active',
      last_login: '2024-01-20T10:30:00Z',
      join_date: '2024-01-15',
      skills: ['3D Printing', 'Laser Cutting', 'Electronics'],
      projects_count: 5,
      reservations_count: 12,
      credits_used: 45,
      credits_remaining: 55,
    },
    {
      id: '2',
      keycloak_user_id: 'kc_002',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'service_provider',
      membership_plan_id: 'plan_2',
      membership_plan_name: 'Service Provider',
      start_date: '2024-01-10',
      end_date: '2024-12-10',
      is_active: true,
      status: 'active',
      last_login: '2024-01-19T15:45:00Z',
      join_date: '2024-01-10',
      skills: ['3D Printing', 'Design', 'CAD'],
      projects_count: 8,
      reservations_count: 20,
      credits_used: 120,
      credits_remaining: 30,
    },
    {
      id: '3',
      keycloak_user_id: 'kc_003',
      email: 'alex.expired@example.com',
      firstName: 'Alex',
      lastName: 'Johnson',
      role: 'maker',
      membership_plan_id: 'plan_1',
      membership_plan_name: 'Pro Maker',
      start_date: '2023-06-01',
      end_date: '2024-01-01',
      is_active: false,
      status: 'expired',
      last_login: '2023-12-28T09:15:00Z',
      join_date: '2023-06-01',
      skills: ['Woodworking', 'Metal Fabrication'],
      projects_count: 3,
      reservations_count: 8,
      credits_used: 100,
      credits_remaining: 0,
    }
  ];

  const mockPlans: MembershipPlan[] = [
    {
      id: 'plan_1',
      name: 'Pro Maker',
      description: 'Full access to all equipment and unlimited hours',
      duration_days: 365,
      price: 99.99,
      features: ['Unlimited access', '24/7 facility access', 'All equipment', 'Free materials'],
      access_level: {
        equipment: ['3d_printer', 'laser_cutter', 'cnc_mill', 'electronics_lab'],
        rooms: ['workshop', 'electronics_lab', 'meeting_room'],
        max_reservations: 10
      },
      is_active: true,
      makerspace_id: 'makerspace_1',
    },
    {
      id: 'plan_2',
      name: 'Basic Maker',
      description: 'Access to basic equipment with 40 hours per month',
      duration_days: 30,
      price: 29.99,
      features: ['40 hours/month', 'Basic equipment', 'Workshop access'],
      access_level: {
        equipment: ['3d_printer', 'basic_tools'],
        rooms: ['workshop'],
        hours_per_day: 8,
        max_reservations: 3
      },
      is_active: true,
      makerspace_id: 'makerspace_1',
    },
    {
      id: 'plan_3',
      name: 'Service Provider',
      description: 'Commercial access for service providers',
      duration_days: 365,
      price: 199.99,
      features: ['Commercial license', 'Priority booking', 'All equipment', 'Storage space'],
      access_level: {
        equipment: ['3d_printer', 'laser_cutter', 'cnc_mill', 'electronics_lab', 'storage'],
        rooms: ['workshop', 'electronics_lab', 'meeting_room', 'storage'],
        max_reservations: 20
      },
      is_active: true,
      makerspace_id: 'makerspace_1',
    }
  ];

  const mockInvites: MemberInvite[] = [
    {
      id: 'inv_1',
      email: 'newmember@example.com',
      role: 'maker',
      membership_plan_id: 'plan_1',
      invited_by: 'admin@makrcave.com',
      invite_token: 'token_123',
      expires_at: '2024-02-15T23:59:59Z',
      status: 'pending',
      created_at: '2024-01-15T10:00:00Z',
    }
  ];

  // Calculate member statistics
  const memberStats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    expired: members.filter(m => m.status === 'expired').length,
    pending: members.filter(m => m.status === 'pending').length,
    byRole: members.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  // Fetch functions
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      // In real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setMembers(mockMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipPlans = async () => {
    setPlansLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMembershipPlans(mockPlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch membership plans');
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchInvites = async () => {
    setInvitesLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setInvites(mockInvites);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invites');
    } finally {
      setInvitesLoading(false);
    }
  };

  // Member CRUD operations
  const addMember = async (memberData: Partial<Member>): Promise<Member> => {
    const newMember: Member = {
      id: Date.now().toString(),
      keycloak_user_id: `kc_${Date.now()}`,
      email: memberData.email || '',
      firstName: memberData.firstName || '',
      lastName: memberData.lastName || '',
      phone: memberData.phone,
      role: memberData.role || 'maker',
      membership_plan_id: memberData.membership_plan_id || 'plan_1',
      membership_plan_name: membershipPlans.find(p => p.id === memberData.membership_plan_id)?.name || 'Basic Maker',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
      status: 'active',
      join_date: new Date().toISOString().split('T')[0],
      skills: memberData.skills || [],
      projects_count: 0,
      reservations_count: 0,
      credits_used: 0,
      credits_remaining: 100,
    };

    setMembers(prev => [...prev, newMember]);
    return newMember;
  };

  const updateMember = async (id: string, updates: Partial<Member>): Promise<Member> => {
    const updatedMember = members.find(m => m.id === id);
    if (!updatedMember) throw new Error('Member not found');

    const updated = { ...updatedMember, ...updates };
    setMembers(prev => prev.map(m => m.id === id ? updated : m));
    return updated;
  };

  const removeMember = async (id: string): Promise<void> => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const suspendMember = async (id: string, reason?: string): Promise<void> => {
    setMembers(prev => prev.map(m => 
      m.id === id ? { ...m, status: 'suspended' as const, is_active: false } : m
    ));
  };

  const reactivateMember = async (id: string): Promise<void> => {
    setMembers(prev => prev.map(m => 
      m.id === id ? { ...m, status: 'active' as const, is_active: true } : m
    ));
  };

  // Membership Plan operations
  const createMembershipPlan = async (planData: Partial<MembershipPlan>): Promise<MembershipPlan> => {
    const newPlan: MembershipPlan = {
      id: Date.now().toString(),
      name: planData.name || '',
      description: planData.description || '',
      duration_days: planData.duration_days || 30,
      price: planData.price || 0,
      features: planData.features || [],
      access_level: planData.access_level || { equipment: [], rooms: [] },
      is_active: true,
      makerspace_id: 'makerspace_1',
    };

    setMembershipPlans(prev => [...prev, newPlan]);
    return newPlan;
  };

  const updateMembershipPlan = async (id: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan> => {
    const updated = membershipPlans.find(p => p.id === id);
    if (!updated) throw new Error('Plan not found');

    const updatedPlan = { ...updated, ...updates };
    setMembershipPlans(prev => prev.map(p => p.id === id ? updatedPlan : p));
    return updatedPlan;
  };

  const deleteMembershipPlan = async (id: string): Promise<void> => {
    setMembershipPlans(prev => prev.filter(p => p.id !== id));
  };

  // Invite operations
  const sendInvite = async (inviteData: { email: string; role: string; membership_plan_id: string }): Promise<MemberInvite> => {
    const newInvite: MemberInvite = {
      id: Date.now().toString(),
      email: inviteData.email,
      role: inviteData.role,
      membership_plan_id: inviteData.membership_plan_id,
      invited_by: user?.email || 'admin',
      invite_token: `token_${Date.now()}`,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setInvites(prev => [...prev, newInvite]);
    return newInvite;
  };

  const resendInvite = async (id: string): Promise<void> => {
    // Implementation would resend the invite email
  };

  const cancelInvite = async (id: string): Promise<void> => {
    setInvites(prev => prev.filter(i => i.id !== id));
  };

  // Search and filter functions
  const searchMembers = (query: string): Member[] => {
    if (!query) return members;
    
    const lowercaseQuery = query.toLowerCase();
    return members.filter(member =>
      member.firstName.toLowerCase().includes(lowercaseQuery) ||
      member.lastName.toLowerCase().includes(lowercaseQuery) ||
      member.email.toLowerCase().includes(lowercaseQuery) ||
      member.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery))
    );
  };

  const filterMembers = (filters: { status?: string; role?: string; plan?: string }): Member[] => {
    return members.filter(member => {
      if (filters.status && member.status !== filters.status) return false;
      if (filters.role && member.role !== filters.role) return false;
      if (filters.plan && member.membership_plan_id !== filters.plan) return false;
      return true;
    });
  };

  // Load initial data
  useEffect(() => {
    if (user && (user.role === 'makerspace_admin' || user.role === 'super_admin')) {
      fetchMembers();
      fetchMembershipPlans();
      fetchInvites();
    }
  }, [user]);

  const value: MemberContextType = {
    members,
    memberStats,
    loading,
    error,
    membershipPlans,
    plansLoading,
    invites,
    invitesLoading,
    fetchMembers,
    addMember,
    updateMember,
    removeMember,
    suspendMember,
    reactivateMember,
    fetchMembershipPlans,
    createMembershipPlan,
    updateMembershipPlan,
    deleteMembershipPlan,
    fetchInvites,
    sendInvite,
    resendInvite,
    cancelInvite,
    searchMembers,
    filterMembers,
  };

  return (
    <MemberContext.Provider value={value}>
      {children}
    </MemberContext.Provider>
  );
};
