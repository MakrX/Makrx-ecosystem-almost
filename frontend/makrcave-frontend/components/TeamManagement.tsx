import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { 
  Plus, 
  UserPlus, 
  Crown, 
  Edit, 
  Eye, 
  X, 
  Mail, 
  Calendar,
  MoreHorizontal,
  Shield,
  UserMinus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface Collaborator {
  id: number;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  invited_by: string;
  invited_at: string;
  accepted_at?: string;
}

interface TeamManagementProps {
  projectId: string;
  collaborators: Collaborator[];
  canEdit: boolean;
  onUpdate: () => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ 
  projectId, 
  collaborators, 
  canEdit, 
  onUpdate 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'editor' | 'viewer'>('viewer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'editor': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'editor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'owner': return 'Full project control, can delete project';
      case 'editor': return 'Can edit project, manage BOM, reserve equipment';
      case 'viewer': return 'Can view project details and files';
      default: return 'Unknown role';
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: newMemberEmail, // In real app, this would be resolved from email
          role: newMemberRole,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add team member';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      onUpdate();
      setShowAddModal(false);
      setNewMemberEmail('');
      setNewMemberRole('viewer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'editor' | 'viewer') => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/collaborators/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
    } catch (err) {
      console.error('Error updating role:', err);
      // Show error notification
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token';
      const response = await fetch(`/api/v1/projects/${projectId}/collaborators/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onUpdate();
    } catch (err) {
      console.error('Error removing member:', err);
      // Show error notification
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  const pendingInvitations = collaborators.filter(c => !c.accepted_at);
  const activeMembers = collaborators.filter(c => c.accepted_at);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Management</h3>
          <p className="text-sm text-gray-600">
            Manage project collaborators and their permissions
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{collaborators.filter(c => c.role === 'owner').length}</p>
                <p className="text-xs text-gray-600">Owners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{collaborators.filter(c => c.role === 'editor').length}</p>
                <p className="text-xs text-gray-600">Editors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{collaborators.filter(c => c.role === 'viewer').length}</p>
                <p className="text-xs text-gray-600">Viewers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{pendingInvitations.length}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Pending Invitations ({pendingInvitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvitations.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{collaborator.user_id}</p>
                      <p className="text-sm text-gray-600">
                        Invited {formatDate(collaborator.invited_at)} by {collaborator.invited_by}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(collaborator.role)}>
                      {getRoleIcon(collaborator.role)}
                      {collaborator.role}
                    </Badge>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(collaborator.user_id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Active Team Members ({activeMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeMembers.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {collaborator.user_id.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{collaborator.user_id}</p>
                    <p className="text-sm text-gray-600">
                      Joined {formatDate(collaborator.accepted_at)} • Invited by {collaborator.invited_by}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getRoleDescription(collaborator.role)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(collaborator.role)}>
                    {getRoleIcon(collaborator.role)}
                    {collaborator.role}
                  </Badge>
                  
                  {canEdit && collaborator.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {collaborator.role !== 'editor' && (
                          <DropdownMenuItem onClick={() => handleUpdateRole(collaborator.user_id, 'editor')}>
                            <Edit className="h-4 w-4 mr-2" />
                            Make Editor
                          </DropdownMenuItem>
                        )}
                        {collaborator.role !== 'viewer' && (
                          <DropdownMenuItem onClick={() => handleUpdateRole(collaborator.user_id, 'viewer')}>
                            <Eye className="h-4 w-4 mr-2" />
                            Make Viewer
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleRemoveMember(collaborator.user_id)}
                          className="text-red-600"
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
            
            {activeMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active team members yet</p>
                <p className="text-sm">Invite collaborators to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Owner</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• Full project control</li>
                <li>• Can delete project</li>
                <li>• Manage all team members</li>
                <li>• Edit all content</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Editor</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• Edit project details</li>
                <li>• Manage BOM items</li>
                <li>• Reserve equipment</li>
                <li>• Upload files</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Viewer</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-6">
                <li>• View project details</li>
                <li>• Download files</li>
                <li>• View activity log</li>
                <li>• Read-only access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newMemberRole} onValueChange={(value: 'editor' | 'viewer') => setNewMemberRole(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Viewer</div>
                        <div className="text-xs text-gray-500">Read-only access</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Editor</div>
                        <div className="text-xs text-gray-500">Can edit project content</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
