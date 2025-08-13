import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { uploadProfileImage } from '../../services/fileUploadService';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Upload,
  Save,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

interface OperatingHours {
  open: string;
  close: string;
  closed: boolean;
}

interface MakerspaceSettings {
  makerspace_name?: string;
  logo_url?: string;
  description?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  operating_hours?: {
    monday: OperatingHours;
    tuesday: OperatingHours;
    wednesday: OperatingHours;
    thursday: OperatingHours;
    friday: OperatingHours;
    saturday: OperatingHours;
    sunday: OperatingHours;
  };
}

interface GeneralSettingsFormProps {
  settings: MakerspaceSettings;
  onUpdate: (data: Partial<MakerspaceSettings>) => void;
  onSave: (data: any) => void;
  saving: boolean;
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

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({
  settings,
  onUpdate,
  onSave,
  saving
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultOperatingHours: OperatingHours = {
    open: '09:00',
    close: '18:00',
    closed: false
  };

  const getOperatingHours = () => {
    if (!settings.operating_hours) {
      const defaultHours: any = {};
      days.forEach(day => {
        defaultHours[day] = { ...defaultOperatingHours };
      });
      defaultHours.sunday.closed = true;
      return defaultHours;
    }
    return settings.operating_hours;
  };

  const handleInputChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleOperatingHoursChange = (day: string, field: string, value: any) => {
    const currentHours = getOperatingHours();
    const updatedHours = {
      ...currentHours,
      [day]: {
        ...currentHours[day],
        [field]: value
      }
    };
    onUpdate({ operating_hours: updatedHours });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload file using the file upload service
      const uploadResult = await uploadProfileImage(file, (progress) => {
        // Could add progress indicator here if needed
        console.log(`Upload progress: ${progress}%`);
      });

      if (uploadResult.success && uploadResult.url) {
        handleInputChange('logo_url', uploadResult.url);
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    const generalData = {
      makerspace_name: settings.makerspace_name,
      logo_url: settings.logo_url,
      description: settings.description,
      address: settings.address,
      contact_email: settings.contact_email,
      contact_phone: settings.contact_phone,
      timezone: settings.timezone,
      latitude: settings.latitude,
      longitude: settings.longitude,
      operating_hours: getOperatingHours()
    };
    onSave(generalData);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="makerspace_name">Makerspace Name *</Label>
              <Input
                id="makerspace_name"
                value={settings.makerspace_name || ''}
                onChange={(e) => handleInputChange('makerspace_name', e.target.value)}
                placeholder="Enter makerspace name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone || 'Asia/Kolkata'} onValueChange={(value) => handleInputChange('timezone', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={settings.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your makerspace, its mission, and what makes it special..."
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <Label>Logo</Label>
            <div className="mt-1 flex items-center gap-4">
              {settings.logo_url && (
                <div className="w-16 h-16 border rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={settings.logo_url} 
                    alt="Makerspace Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {settings.logo_url ? 'Change Logo' : 'Upload Logo'}
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended size: 200x200px. Supports JPG, PNG, or SVG files.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Textarea
              id="address"
              value={settings.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Full address including city, state, and postal code..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Email
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="contact@makerspace.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="contact_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Phone
              </Label>
              <Input
                id="contact_phone"
                value={settings.contact_phone || ''}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-1"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={settings.latitude || ''}
                onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || null)}
                placeholder="28.6139"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={settings.longitude || ''}
                onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || null)}
                placeholder="77.2090"
                className="mt-1"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Coordinates are used for job auto-assignment and location-based services.
          </p>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {days.map((day, index) => {
              const dayHours = getOperatingHours()[day] || defaultOperatingHours;
              return (
                <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-20 font-medium text-sm">
                    {dayLabels[index]}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!dayHours.closed}
                      onChange={(e) => handleOperatingHoursChange(day, 'closed', !e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Open</span>
                  </div>

                  {!dayHours.closed && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">From:</Label>
                        <Input
                          type="time"
                          value={dayHours.open}
                          onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                          className="w-32"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">To:</Label>
                        <Input
                          type="time"
                          value={dayHours.close}
                          onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </>
                  )}
                  
                  {dayHours.closed && (
                    <span className="text-sm text-gray-500 italic">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-32">
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save General Settings
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettingsForm;
