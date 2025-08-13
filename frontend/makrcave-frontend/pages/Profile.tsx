import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Upload,
  Bell,
  Shield,
  Key,
  Eye,
  EyeOff,
  Calendar,
  Building2,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  address?: string;
  timezone?: string;
  language?: string;
  notification_preferences?: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    marketing_emails: boolean;
  };
  privacy_settings?: {
    profile_visibility: 'public' | 'members_only' | 'private';
    show_activity: boolean;
    show_projects: boolean;
  };
}

const timezones = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Australia/Sydney',
  'Asia/Tokyo'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' }
];

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock profile data - in real app this would come from API
  const [profile, setProfile] = useState<UserProfile>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    bio: 'Passionate maker and engineer with experience in 3D printing, electronics, and woodworking.',
    avatar_url: '',
    address: '123 Tech Park, Bangalore, Karnataka 560001',
    timezone: 'Asia/Kolkata',
    language: 'en',
    notification_preferences: {
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      marketing_emails: false
    },
    privacy_settings: {
      profile_visibility: 'members_only',
      show_activity: true,
      show_projects: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof UserProfile],
        [field]: value
      }
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Mock upload - in real app this would upload to your storage service
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockUrl = URL.createObjectURL(file);
      handleInputChange('avatar_url', mockUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully"
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully"
      });
    } catch (error) {
      toast({
        title: "Password update failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Administrator';
      case 'admin': return 'Administrator';
      case 'makerspace_admin': return 'Makerspace Manager';
      case 'service_provider': return 'Service Provider';
      case 'maker': return 'Maker';
      default: return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'default';
      case 'admin': return 'secondary';
      case 'makerspace_admin': return 'outline';
      case 'service_provider': return 'outline';
      case 'maker': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile Settings
          </h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getRoleBadgeVariant(user?.role || 'maker')}>
                  {getRoleDisplayName(user?.role || 'maker')}
                </Badge>
                {user?.assignedMakerspaces && user.assignedMakerspaces.length > 0 && (
                  <Badge variant="outline">
                    <Building2 className="h-3 w-3 mr-1" />
                    {user.assignedMakerspaces.length} Makerspace{user.assignedMakerspaces.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* General Information Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself and your interests"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profile.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={profile.timezone || 'Asia/Kolkata'} onValueChange={(value) => handleInputChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={profile.language || 'en'} onValueChange={(value) => handleInputChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Enter your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Password Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Include at least one number</li>
                  <li>• Include at least one special character</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handlePasswordUpdate} 
                  disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-600 mt-1">Receive important updates via email</p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={profile.notification_preferences?.email_notifications || false}
                    onCheckedChange={(checked) => handleNestedChange('notification_preferences', 'email_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms_notifications" className="font-medium">SMS Notifications</Label>
                    <p className="text-sm text-gray-600 mt-1">Receive urgent alerts via SMS</p>
                  </div>
                  <Switch
                    id="sms_notifications"
                    checked={profile.notification_preferences?.sms_notifications || false}
                    onCheckedChange={(checked) => handleNestedChange('notification_preferences', 'sms_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push_notifications" className="font-medium">Push Notifications</Label>
                    <p className="text-sm text-gray-600 mt-1">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="push_notifications"
                    checked={profile.notification_preferences?.push_notifications || false}
                    onCheckedChange={(checked) => handleNestedChange('notification_preferences', 'push_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing_emails" className="font-medium">Marketing Emails</Label>
                    <p className="text-sm text-gray-600 mt-1">Receive updates about new features and promotions</p>
                  </div>
                  <Switch
                    id="marketing_emails"
                    checked={profile.notification_preferences?.marketing_emails || false}
                    onCheckedChange={(checked) => handleNestedChange('notification_preferences', 'marketing_emails', checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profile_visibility">Profile Visibility</Label>
                  <Select 
                    value={profile.privacy_settings?.profile_visibility || 'members_only'} 
                    onValueChange={(value) => handleNestedChange('privacy_settings', 'profile_visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                      <SelectItem value="members_only">Members Only - Only makerspace members can see your profile</SelectItem>
                      <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_activity" className="font-medium">Show Activity</Label>
                    <p className="text-sm text-gray-600 mt-1">Allow others to see your recent activity and equipment usage</p>
                  </div>
                  <Switch
                    id="show_activity"
                    checked={profile.privacy_settings?.show_activity || false}
                    onCheckedChange={(checked) => handleNestedChange('privacy_settings', 'show_activity', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_projects" className="font-medium">Show Projects</Label>
                    <p className="text-sm text-gray-600 mt-1">Allow others to see your projects and contributions</p>
                  </div>
                  <Switch
                    id="show_projects"
                    checked={profile.privacy_settings?.show_projects || false}
                    onCheckedChange={(checked) => handleNestedChange('privacy_settings', 'show_projects', checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
