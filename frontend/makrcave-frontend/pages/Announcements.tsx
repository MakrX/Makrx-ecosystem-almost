import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import {
  Plus, Edit, Trash2, Eye, Pin, PinOff, Send, Calendar, Clock, 
  Users, BarChart3, Settings, MoreVertical, AlertCircle, CheckCircle,
  Megaphone, Wrench, PartyPopper, Shield, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  summary?: string;
  announcement_type: string;
  priority: string;
  target_audience: string;
  publish_at?: string;
  expires_at?: string;
  is_published: boolean;
  is_pinned: boolean;
  show_on_dashboard: boolean;
  show_in_email: boolean;
  show_as_popup: boolean;
  require_acknowledgment: boolean;
  image_url?: string;
  action_button_text?: string;
  action_button_url?: string;
  background_color?: string;
  text_color?: string;
  icon?: string;
  event_date?: string;
  event_location?: string;
  event_capacity?: number;
  registration_required: boolean;
  registration_url?: string;
  maintenance_start?: string;
  maintenance_end?: string;
  affected_equipment?: string[];
  view_count: number;
  acknowledgment_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
  type_icon: string;
  priority_color: string;
}

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Announcement>>({});
  const [statsData, setStatsData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState({
    type: '',
    priority: '',
    status: 'all'
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [filter]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      let url = '/api/v1/announcements/?';
      const params = new URLSearchParams();
      
      if (filter.status === 'active') {
        params.append('active_only', 'true');
      } else if (filter.status === 'published') {
        params.append('published_only', 'true');
      } else {
        params.append('published_only', 'false');
      }
      
      if (filter.type) {
        params.append('announcement_type', filter.type);
      }
      
      if (filter.priority) {
        params.append('priority', filter.priority);
      }

      const response = await fetch(url + params.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load announcements",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAnnouncement = async () => {
    setSaving(true);
    try {
      const url = selectedAnnouncement ? 
        `/api/v1/announcements/${selectedAnnouncement.id}` : 
        '/api/v1/announcements/';
      const method = selectedAnnouncement ? 'PUT' : 'POST';

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
          description: `Announcement ${selectedAnnouncement ? 'updated' : 'created'} successfully`,
        });
        fetchAnnouncements();
        setShowCreateDialog(false);
        setShowEditDialog(false);
        setSelectedAnnouncement(null);
        setFormData({});
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to save announcement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Announcement deleted successfully",
        });
        fetchAnnouncements();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to delete announcement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const togglePin = async (announcement: Announcement) => {
    try {
      const response = await fetch(`/api/v1/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_pinned: !announcement.is_pinned }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Announcement ${announcement.is_pinned ? 'unpinned' : 'pinned'} successfully`,
        });
        fetchAnnouncements();
      } else {
        toast({
          title: "Error",
          description: "Failed to update announcement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const togglePublish = async (announcement: Announcement) => {
    try {
      const response = await fetch(`/api/v1/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          is_published: !announcement.is_published,
          published_at: !announcement.is_published ? new Date().toISOString() : null
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Announcement ${announcement.is_published ? 'unpublished' : 'published'} successfully`,
        });
        fetchAnnouncements();
      } else {
        toast({
          title: "Error",
          description: "Failed to update announcement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const fetchStats = async (announcementId: string) => {
    try {
      const response = await fetch(`/api/v1/announcements/${announcementId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
        setShowStatsDialog(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to load announcement statistics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to load announcement statistics",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      summary: announcement.summary,
      announcement_type: announcement.announcement_type,
      priority: announcement.priority,
      target_audience: announcement.target_audience,
      is_published: announcement.is_published,
      is_pinned: announcement.is_pinned,
      show_on_dashboard: announcement.show_on_dashboard,
      show_in_email: announcement.show_in_email,
      show_as_popup: announcement.show_as_popup,
      require_acknowledgment: announcement.require_acknowledgment,
      action_button_text: announcement.action_button_text,
      action_button_url: announcement.action_button_url,
      event_date: announcement.event_date,
      event_location: announcement.event_location,
      event_capacity: announcement.event_capacity,
      registration_required: announcement.registration_required,
      registration_url: announcement.registration_url,
      maintenance_start: announcement.maintenance_start,
      maintenance_end: announcement.maintenance_end
    });
    setShowEditDialog(true);
  };

  const openCreateDialog = () => {
    setSelectedAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      summary: '',
      announcement_type: 'general',
      priority: 'normal',
      target_audience: 'all_members',
      is_published: false,
      is_pinned: false,
      show_on_dashboard: true,
      show_in_email: false,
      show_as_popup: false,
      require_acknowledgment: false,
      registration_required: false
    });
    setShowCreateDialog(true);
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      general: <Megaphone className="h-4 w-4" />,
      maintenance: <Wrench className="h-4 w-4" />,
      event: <Calendar className="h-4 w-4" />,
      policy: <Shield className="h-4 w-4" />,
      emergency: <AlertTriangle className="h-4 w-4" />,
      promotion: <PartyPopper className="h-4 w-4" />,
      new_equipment: <Settings className="h-4 w-4" />,
      schedule_change: <Clock className="h-4 w-4" />,
      safety: <AlertCircle className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || icons.general;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600',
      normal: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
      critical: 'text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-orange-100 text-orange-800',
      event: 'bg-green-100 text-green-800',
      policy: 'bg-purple-100 text-purple-800',
      emergency: 'bg-red-100 text-red-800',
      promotion: 'bg-pink-100 text-pink-800',
      new_equipment: 'bg-teal-100 text-teal-800',
      schedule_change: 'bg-yellow-100 text-yellow-800',
      safety: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAnnouncementForm = () => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter announcement title"
        />
      </div>

      <div>
        <Label htmlFor="summary">Summary</Label>
        <Input
          id="summary"
          value={formData.summary || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
          placeholder="Brief summary (optional)"
          maxLength={500}
        />
      </div>

      <div>
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Enter announcement content"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="announcement_type">Type</Label>
          <select
            id="announcement_type"
            value={formData.announcement_type || 'general'}
            onChange={(e) => setFormData(prev => ({ ...prev, announcement_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="general">General</option>
            <option value="maintenance">Maintenance</option>
            <option value="event">Event</option>
            <option value="policy">Policy</option>
            <option value="emergency">Emergency</option>
            <option value="promotion">Promotion</option>
            <option value="new_equipment">New Equipment</option>
            <option value="schedule_change">Schedule Change</option>
            <option value="safety">Safety</option>
          </select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            value={formData.priority || 'normal'}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <Label htmlFor="target_audience">Audience</Label>
          <select
            id="target_audience"
            value={formData.target_audience || 'all_members'}
            onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all_members">All Members</option>
            <option value="active_members">Active Members</option>
            <option value="specific_plans">Specific Plans</option>
            <option value="specific_skills">Specific Skills</option>
            <option value="specific_members">Specific Members</option>
            <option value="admins_only">Admins Only</option>
            <option value="new_members">New Members</option>
          </select>
        </div>
      </div>

      {formData.announcement_type === 'event' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="event_date">Event Date</Label>
            <Input
              id="event_date"
              type="datetime-local"
              value={formData.event_date ? new Date(formData.event_date).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="event_location">Event Location</Label>
            <Input
              id="event_location"
              value={formData.event_location || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, event_location: e.target.value }))}
              placeholder="Event location"
            />
          </div>
          <div>
            <Label htmlFor="event_capacity">Capacity</Label>
            <Input
              id="event_capacity"
              type="number"
              min="1"
              value={formData.event_capacity || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, event_capacity: parseInt(e.target.value) || undefined }))}
              placeholder="Max attendees"
            />
          </div>
          <div>
            <Label htmlFor="registration_url">Registration URL</Label>
            <Input
              id="registration_url"
              value={formData.registration_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, registration_url: e.target.value }))}
              placeholder="Registration link"
            />
          </div>
        </div>
      )}

      {formData.announcement_type === 'maintenance' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maintenance_start">Maintenance Start</Label>
            <Input
              id="maintenance_start"
              type="datetime-local"
              value={formData.maintenance_start ? new Date(formData.maintenance_start).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, maintenance_start: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="maintenance_end">Maintenance End</Label>
            <Input
              id="maintenance_end"
              type="datetime-local"
              value={formData.maintenance_end ? new Date(formData.maintenance_end).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, maintenance_end: e.target.value }))}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="action_button_text">Action Button Text</Label>
          <Input
            id="action_button_text"
            value={formData.action_button_text || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, action_button_text: e.target.value }))}
            placeholder="e.g., Learn More, Register"
          />
        </div>
        <div>
          <Label htmlFor="action_button_url">Action Button URL</Label>
          <Input
            id="action_button_url"
            value={formData.action_button_url || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, action_button_url: e.target.value }))}
            placeholder="Button link URL"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_published || false}
            onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
          />
          <span>Published</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_pinned || false}
            onChange={(e) => setFormData(prev => ({ ...prev, is_pinned: e.target.checked }))}
          />
          <span>Pinned</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.show_on_dashboard || false}
            onChange={(e) => setFormData(prev => ({ ...prev, show_on_dashboard: e.target.checked }))}
          />
          <span>Show on Dashboard</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.show_in_email || false}
            onChange={(e) => setFormData(prev => ({ ...prev, show_in_email: e.target.checked }))}
          />
          <span>Include in Email</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.show_as_popup || false}
            onChange={(e) => setFormData(prev => ({ ...prev, show_as_popup: e.target.checked }))}
          />
          <span>Show as Popup</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.require_acknowledgment || false}
            onChange={(e) => setFormData(prev => ({ ...prev, require_acknowledgment: e.target.checked }))}
          />
          <span>Require Acknowledgment</span>
        </label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Announcements
          </h1>
          <p className="text-gray-600">Manage announcements and communications for your makerspace</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Create a new announcement for your makerspace members
                </DialogDescription>
              </DialogHeader>
              {renderAnnouncementForm()}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveAnnouncement} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Announcement'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label htmlFor="filter-status">Status</Label>
              <select
                id="filter-status"
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="active">Active</option>
              </select>
            </div>
            <div>
              <Label htmlFor="filter-type">Type</Label>
              <select
                id="filter-type"
                value={filter.type}
                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Types</option>
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="event">Event</option>
                <option value="policy">Policy</option>
                <option value="emergency">Emergency</option>
                <option value="promotion">Promotion</option>
                <option value="new_equipment">New Equipment</option>
                <option value="schedule_change">Schedule Change</option>
                <option value="safety">Safety</option>
              </select>
            </div>
            <div>
              <Label htmlFor="filter-priority">Priority</Label>
              <select
                id="filter-priority"
                value={filter.priority}
                onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first announcement.</p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className={`${announcement.is_pinned ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(announcement.announcement_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {announcement.title}
                        </h3>
                        {announcement.is_pinned && (
                          <Pin className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={getTypeColor(announcement.announcement_type)}>
                          {announcement.announcement_type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                        {!announcement.is_published && (
                          <Badge variant="outline" className="text-gray-500">
                            Draft
                          </Badge>
                        )}
                        {announcement.is_published && !announcement.is_active && (
                          <Badge variant="outline" className="text-orange-600">
                            Expired
                          </Badge>
                        )}
                        {announcement.require_acknowledgment && (
                          <Badge variant="outline" className="text-purple-600">
                            Requires Ack
                          </Badge>
                        )}
                      </div>
                      
                      {announcement.summary && (
                        <p className="text-gray-600 text-sm mb-2">{announcement.summary}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {announcement.view_count} views
                        </span>
                        {announcement.require_acknowledgment && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {announcement.acknowledgment_count} acknowledged
                          </span>
                        )}
                        {announcement.action_button_text && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {announcement.click_count} clicks
                          </span>
                        )}
                        <span>{formatDate(announcement.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(announcement)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => fetchStats(announcement.id)}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Stats
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePin(announcement)}>
                        {announcement.is_pinned ? (
                          <>
                            <PinOff className="h-4 w-4 mr-2" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish(announcement)}>
                        <Send className="h-4 w-4 mr-2" />
                        {announcement.is_published ? 'Unpublish' : 'Publish'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>
              Update the announcement details
            </DialogDescription>
          </DialogHeader>
          {renderAnnouncementForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveAnnouncement} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Announcement Statistics</DialogTitle>
            <DialogDescription>
              Performance metrics for this announcement
            </DialogDescription>
          </DialogHeader>
          {statsData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{statsData.total_views}</div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statsData.unique_viewers}</div>
                  <div className="text-sm text-gray-600">Unique Viewers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{statsData.total_acknowledgments}</div>
                  <div className="text-sm text-gray-600">Acknowledgments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{statsData.action_button_clicks}</div>
                  <div className="text-sm text-gray-600">Button Clicks</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{statsData.view_rate}%</div>
                  <div className="text-xs text-gray-600">View Rate</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{statsData.acknowledgment_rate}%</div>
                  <div className="text-xs text-gray-600">Acknowledgment Rate</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{statsData.click_through_rate}%</div>
                  <div className="text-xs text-gray-600">Click Rate</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Announcements;
