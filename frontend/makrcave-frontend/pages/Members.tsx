import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Mail,
  Phone,
  Crown,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Settings,
  TrendingUp,
  DollarSign,
  Award,
  MapPin
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { useMember, Member } from '../contexts/MemberContext';
import AddMemberModal from '../components/modals/AddMemberModal';
import EditMemberModal from '../components/modals/EditMemberModal';
import MembershipPlanModal from '../components/modals/MembershipPlanModal';
import InviteMemberModal from '../components/modals/InviteMemberModal';
import MemberDetailsModal from '../components/modals/MemberDetailsModal';

const Members: React.FC = () => {
  const {
    members,
    memberStats,
    loading,
    error,
    membershipPlans,
    invites,
    removeMember,
    suspendMember,
    reactivateMember,
    searchMembers,
    filterMembers
  } = useMember();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState('members');

  // Apply filters
  const filteredMembers = React.useMemo(() => {
    let result = members;
    
    if (searchQuery) {
      result = searchMembers(searchQuery);
    }
    
    result = filterMembers({
      status: statusFilter === 'all' ? undefined : statusFilter,
      role: roleFilter === 'all' ? undefined : roleFilter,
      plan: planFilter === 'all' ? undefined : planFilter,
    });
    
    return result;
  }, [members, searchQuery, statusFilter, roleFilter, planFilter, searchMembers, filterMembers]);

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  const handleSuspendMember = async (member: Member) => {
    if (window.confirm(`Are you sure you want to suspend ${member.firstName} ${member.lastName}?`)) {
      try {
        await suspendMember(member.id);
      } catch (err) {
        console.error('Failed to suspend member:', err);
      }
    }
  };

  const handleReactivateMember = async (member: Member) => {
    try {
      await reactivateMember(member.id);
    } catch (err) {
      console.error('Failed to reactivate member:', err);
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (window.confirm(`Are you sure you want to permanently remove ${member.firstName} ${member.lastName}? This action cannot be undone.`)) {
      try {
        await removeMember(member.id);
      } catch (err) {
        console.error('Failed to remove member:', err);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-orange-100 text-orange-800',
    };
    
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      maker: 'bg-blue-100 text-blue-800',
      service_provider: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      makerspace_admin: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge variant="outline" className={variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {role === 'service_provider' ? 'Service Provider' :
         role === 'makerspace_admin' ? 'Manager' :
         role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
          <p className="text-gray-600">Manage makerspace members, plans, and access</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowInviteModal(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Send Invite
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{memberStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{memberStats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{memberStats.expired}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{memberStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="plans">Membership Plans</TabsTrigger>
          <TabsTrigger value="invites">Pending Invites</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search members by name, email, or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="maker">Maker</SelectItem>
                      <SelectItem value="service_provider">Service Provider</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="makerspace_admin">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      {membershipPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Members ({filteredMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No members found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-blue-700">
                              {member.firstName[0]}{member.lastName[0]}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {member.firstName} {member.lastName}
                              </h3>
                              {member.role === 'admin' && <Crown className="h-4 w-4 text-yellow-600" />}
                              {getStatusIcon(member.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </span>
                              {member.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {member.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Joined {new Date(member.join_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {getStatusBadge(member.status)}
                              {getRoleBadge(member.role)}
                              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                {member.membership_plan_name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="font-medium text-gray-900">{member.projects_count} projects</p>
                            <p className="text-gray-600">{member.reservations_count} reservations</p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                Edit Member
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {member.status === 'suspended' ? (
                                <DropdownMenuItem onClick={() => handleReactivateMember(member)}>
                                  Reactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleSuspendMember(member)}>
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleRemoveMember(member)}
                                className="text-red-600"
                              >
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Membership Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Membership Plans</h2>
            <Button onClick={() => setShowPlanModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {membershipPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      ${plan.price}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{plan.duration_days} days</span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Features:</p>
                      <ul className="text-sm space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-700">
                            <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-gray-500 text-xs">
                            +{plan.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-600">
                        {members.filter(m => m.membership_plan_id === plan.id).length} members
                      </span>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pending Invites</h2>
            <Button onClick={() => setShowInviteModal(true)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {invites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pending invites</p>
                  <p className="text-sm">Send invites to new members to join your makerspace</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invites.map((invite) => (
                    <div key={invite.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Role: {invite.role}</span>
                            <span>•</span>
                            <span>Plan: {membershipPlans.find(p => p.id === invite.membership_plan_id)?.name}</span>
                            <span>•</span>
                            <span>Expires: {new Date(invite.expires_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            {invite.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Resend Invite</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Cancel Invite
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddMemberModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        membershipPlans={membershipPlans}
      />
      
      <EditMemberModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        member={selectedMember}
        membershipPlans={membershipPlans}
      />
      
      <MembershipPlanModal
        open={showPlanModal}
        onOpenChange={setShowPlanModal}
      />
      
      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        membershipPlans={membershipPlans}
      />
      
      <MemberDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        member={selectedMember}
      />
    </div>
  );
};

export default Members;
