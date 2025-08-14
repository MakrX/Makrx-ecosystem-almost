import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Member } from '../../contexts/MemberContext';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Award,
  FolderOpen,
  Wrench,
  CreditCard,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface MemberDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
}

const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  open,
  onOpenChange,
  member
}) => {
  if (!member) return null;

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
      user: 'bg-blue-100 text-blue-800',
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Never';
    }
  };

  const membershipProgress = (member.credits_used / (member.credits_used + member.credits_remaining)) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Member Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-700">
                {member.firstName[0]}{member.lastName[0]}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {member.firstName} {member.lastName}
                </h2>
                {member.role === 'admin' && <Crown className="h-5 w-5 text-yellow-600" />}
                {getStatusIcon(member.status)}
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                {getStatusBadge(member.status)}
                {getRoleBadge(member.role)}
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                  {member.membership_plan_name}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(member.join_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <FolderOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{member.projects_count}</p>
                <p className="text-sm text-gray-600">Projects</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Wrench className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{member.reservations_count}</p>
                <p className="text-sm text-gray-600">Reservations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <CreditCard className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{member.credits_remaining}</p>
                <p className="text-sm text-gray-600">Credits Left</p>
              </CardContent>
            </Card>
          </div>

          {/* Membership Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Membership Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-medium">{member.membership_plan_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(member.status)}
                    <span className="font-medium">{member.status.charAt(0).toUpperCase() + member.status.slice(1)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium">{formatDate(member.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium">{formatDate(member.end_date)}</p>
                </div>
              </div>
              
              {/* Usage Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Credit Usage</p>
                  <p className="text-sm font-medium">{member.credits_used} / {member.credits_used + member.credits_remaining}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${membershipProgress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {member.skills.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills & Expertise
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activity Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-medium">
                    {member.last_login ? formatDateTime(member.last_login) : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">{formatDate(member.join_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="font-medium">{member.projects_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Reservations</p>
                  <p className="font-medium">{member.reservations_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Member ID</p>
                  <p className="font-medium font-mono">{member.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Keycloak ID</p>
                  <p className="font-medium font-mono text-xs">{member.keycloak_user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium">{member.role.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className="font-medium">{member.is_active ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Projects
            </Button>
            <Button>
              Edit Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailsModal;
