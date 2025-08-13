import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '../../hooks/use-toast';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Settings,
  Mail,
  Phone,
  Clock
} from 'lucide-react';

interface Makerspace {
  id: string;
  name: string;
  slug: string;
  location: string;
  address: string;
  subdomain?: string;
  adminIds: string[];
  modules: string[];
  maxUsers?: number;
  maxEquipment?: number;
  timezone: string;
  country: string;
  status: string;
  description?: string;
  contactEmail?: string;
  phone?: string;
}

interface MakerspaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  makerspace?: Makerspace | null;
}

const AVAILABLE_MODULES = [
  { key: 'inventory', name: 'Inventory Management', description: 'Track and manage materials and supplies' },
  { key: 'projects', name: 'Project Management', description: 'Create and manage member projects' },
  { key: 'reservations', name: 'Equipment Reservations', description: 'Book and schedule equipment usage' },
  { key: 'billing', name: 'Billing & Payments', description: 'Handle memberships and payments' },
  { key: 'analytics', name: 'Analytics & Reports', description: 'Usage statistics and insights' },
  { key: 'maintenance', name: 'Maintenance Tracking', description: 'Equipment maintenance schedules' },
  { key: 'skill_management', name: 'Skill Management', description: 'Member certifications and training' }
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'Australia',
  'Other'
];

const MakerspaceFormModal: React.FC<MakerspaceFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  makerspace
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableAdmins, setAvailableAdmins] = useState<Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }>>([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    location: '',
    address: '',
    subdomain: '',
    description: '',
    contactEmail: '',
    phone: '',
    country: 'United States',
    timezone: 'America/New_York',
    maxUsers: 100,
    maxEquipment: 20,
    modules: ['inventory', 'projects', 'reservations'],
    adminIds: [] as string[]
  });

  useEffect(() => {
    if (makerspace) {
      setFormData({
        name: makerspace.name,
        slug: makerspace.slug,
        location: makerspace.location,
        address: makerspace.address,
        subdomain: makerspace.subdomain || '',
        description: makerspace.description || '',
        contactEmail: makerspace.contactEmail || '',
        phone: makerspace.phone || '',
        country: makerspace.country,
        timezone: makerspace.timezone,
        maxUsers: makerspace.maxUsers || 100,
        maxEquipment: makerspace.maxEquipment || 20,
        modules: makerspace.modules,
        adminIds: makerspace.adminIds
      });
    } else {
      // Reset form for new makerspace
      setFormData({
        name: '',
        slug: '',
        location: '',
        address: '',
        subdomain: '',
        description: '',
        contactEmail: '',
        phone: '',
        country: 'United States',
        timezone: 'America/New_York',
        maxUsers: 100,
        maxEquipment: 20,
        modules: ['inventory', 'projects', 'reservations'],
        adminIds: []
      });
    }
  }, [makerspace]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableAdmins();
    }
  }, [isOpen]);

  const fetchAvailableAdmins = async () => {
    try {
      const response = await fetch('/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableAdmins(data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === '' ? generateSlug(name) : prev.slug
    }));
  };

  const handleModuleToggle = (moduleKey: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      modules: checked 
        ? [...prev.modules, moduleKey]
        : prev.modules.filter(m => m !== moduleKey)
    }));
  };

  const handleAdminToggle = (adminId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      adminIds: checked 
        ? [...prev.adminIds, adminId]
        : prev.adminIds.filter(id => id !== adminId)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Makerspace name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.slug.trim()) {
      toast({
        title: "Validation Error",
        description: "Slug is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.location.trim()) {
      toast({
        title: "Validation Error",
        description: "Location is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.address.trim()) {
      toast({
        title: "Validation Error",
        description: "Address is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const url = makerspace 
        ? `/api/v1/makerspaces/${makerspace.id}`
        : '/api/v1/makerspaces';
      
      const method = makerspace ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: makerspace 
            ? "Makerspace updated successfully"
            : "Makerspace created successfully",
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to save makerspace",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save makerspace",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {makerspace ? 'Edit Makerspace' : 'Create New Makerspace'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Makerspace Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Downtown MakrCave"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="downtown"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="San Francisco, CA"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Full Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Mission St, San Francisco, CA 94105"
              rows={2}
              required
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="info@downtown.makrcave.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1-415-555-0123"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUsers">Max Users</Label>
              <Input
                id="maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 0 }))}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxEquipment">Max Equipment</Label>
              <Input
                id="maxEquipment"
                type="number"
                value={formData.maxEquipment}
                onChange={(e) => setFormData(prev => ({ ...prev, maxEquipment: parseInt(e.target.value) || 0 }))}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="subdomain"
                value={formData.subdomain}
                onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
                placeholder="downtown.makrcave.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="A brief description of the makerspace..."
              rows={3}
            />
          </div>

          {/* Enabled Modules */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Enabled Modules
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map((module) => (
                <div key={module.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={module.key}
                    checked={formData.modules.includes(module.key)}
                    onCheckedChange={(checked) => handleModuleToggle(module.key, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={module.key} className="font-medium cursor-pointer">
                      {module.name}
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assign Admins */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assign Administrators
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
              {availableAdmins.map((admin) => (
                <div key={admin.id} className="flex items-center space-x-3 p-2 border rounded">
                  <Checkbox
                    id={admin.id}
                    checked={formData.adminIds.includes(admin.id)}
                    onCheckedChange={(checked) => handleAdminToggle(admin.id, checked as boolean)}
                  />
                  <div>
                    <Label htmlFor={admin.id} className="font-medium cursor-pointer">
                      {admin.firstName} {admin.lastName}
                    </Label>
                    <p className="text-xs text-gray-600">{admin.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {makerspace ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                makerspace ? 'Update Makerspace' : 'Create Makerspace'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MakerspaceFormModal;
