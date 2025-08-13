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
  Plus, Edit, Trash2, Copy, Users, DollarSign, Clock, Settings, 
  Star, Eye, EyeOff, Crown, MoreVertical, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  plan_type: string;
  price: number;
  currency: string;
  billing_cycle: string;
  setup_fee: number;
  access_type: string;
  max_hours_per_cycle?: number;
  features: string[];
  guest_passes_per_cycle: number;
  storage_space_gb: number;
  priority_booking: boolean;
  is_active: boolean;
  is_public: boolean;
  requires_approval: boolean;
  current_members: number;
  max_members?: number;
  highlight_plan: boolean;
  badge_text?: string;
  display_order: number;
  effective_price: number;
  trial_period_days: number;
  discount_percent: number;
  created_at: string;
  updated_at: string;
}

const MembershipPlans: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<MembershipPlan>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/membership-plans/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load membership plans",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load membership plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      const response = await fetch('/api/v1/membership-plans/initialize-defaults', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Default membership plans created successfully",
        });
        fetchPlans();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to create default plans",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initializing defaults:', error);
      toast({
        title: "Error",
        description: "Failed to create default plans",
        variant: "destructive",
      });
    }
  };

  const savePlan = async () => {
    setSaving(true);
    try {
      const url = selectedPlan ? 
        `/api/v1/membership-plans/${selectedPlan.id}` : 
        '/api/v1/membership-plans/';
      const method = selectedPlan ? 'PUT' : 'POST';

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
          description: `Membership plan ${selectedPlan ? 'updated' : 'created'} successfully`,
        });
        fetchPlans();
        setShowCreateDialog(false);
        setShowEditDialog(false);
        setSelectedPlan(null);
        setFormData({});
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to save plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: "Failed to save plan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this membership plan?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/membership-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Membership plan deleted successfully",
        });
        fetchPlans();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to delete plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive",
      });
    }
  };

  const duplicatePlan = async (plan: MembershipPlan) => {
    const newName = prompt('Enter name for duplicated plan:', `${plan.name} (Copy)`);
    if (!newName) return;

    try {
      const response = await fetch(`/api/v1/membership-plans/${plan.id}/duplicate?new_name=${encodeURIComponent(newName)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Membership plan duplicated successfully",
        });
        fetchPlans();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to duplicate plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error duplicating plan:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate plan",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      plan_type: plan.plan_type,
      price: plan.price,
      billing_cycle: plan.billing_cycle,
      access_type: plan.access_type,
      max_hours_per_cycle: plan.max_hours_per_cycle,
      features: plan.features,
      guest_passes_per_cycle: plan.guest_passes_per_cycle,
      storage_space_gb: plan.storage_space_gb,
      priority_booking: plan.priority_booking,
      is_active: plan.is_active,
      is_public: plan.is_public,
      requires_approval: plan.requires_approval,
      max_members: plan.max_members,
      highlight_plan: plan.highlight_plan,
      badge_text: plan.badge_text,
      trial_period_days: plan.trial_period_days
    });
    setShowEditDialog(true);
  };

  const openCreateDialog = () => {
    setSelectedPlan(null);
    setFormData({
      name: '',
      description: '',
      plan_type: 'basic',
      price: 0,
      billing_cycle: 'monthly',
      access_type: 'unlimited',
      features: [],
      guest_passes_per_cycle: 0,
      storage_space_gb: 0,
      priority_booking: false,
      is_active: true,
      is_public: true,
      requires_approval: false,
      highlight_plan: false,
      trial_period_days: 0
    });
    setShowCreateDialog(true);
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getBillingCycleText = (cycle: string) => {
    const cycles = {
      hourly: 'per hour',
      daily: 'per day',
      weekly: 'per week',
      monthly: 'per month',
      quarterly: 'per quarter',
      yearly: 'per year',
      lifetime: 'one-time'
    };
    return cycles[cycle as keyof typeof cycles] || cycle;
  };

  const getPlanTypeColor = (type: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      standard: 'bg-green-100 text-green-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800',
      custom: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderPlanForm = () => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Plan Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter plan name"
          />
        </div>
        <div>
          <Label htmlFor="plan_type">Plan Type</Label>
          <select
            id="plan_type"
            value={formData.plan_type || 'basic'}
            onChange={(e) => setFormData(prev => ({ ...prev, plan_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe this membership plan"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="billing_cycle">Billing Cycle</Label>
          <select
            id="billing_cycle"
            value={formData.billing_cycle || 'monthly'}
            onChange={(e) => setFormData(prev => ({ ...prev, billing_cycle: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="lifetime">Lifetime</option>
          </select>
        </div>
        <div>
          <Label htmlFor="trial_period_days">Trial Days</Label>
          <Input
            id="trial_period_days"
            type="number"
            min="0"
            value={formData.trial_period_days || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, trial_period_days: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="access_type">Access Type</Label>
          <select
            id="access_type"
            value={formData.access_type || 'unlimited'}
            onChange={(e) => setFormData(prev => ({ ...prev, access_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="unlimited">Unlimited</option>
            <option value="time_limited">Time Limited</option>
            <option value="specific_hours">Specific Hours</option>
            <option value="weekdays_only">Weekdays Only</option>
            <option value="weekends_only">Weekends Only</option>
          </select>
        </div>
        {formData.access_type === 'time_limited' && (
          <div>
            <Label htmlFor="max_hours_per_cycle">Max Hours per Cycle</Label>
            <Input
              id="max_hours_per_cycle"
              type="number"
              min="1"
              value={formData.max_hours_per_cycle || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, max_hours_per_cycle: parseInt(e.target.value) || undefined }))}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="guest_passes_per_cycle">Guest Passes</Label>
          <Input
            id="guest_passes_per_cycle"
            type="number"
            min="0"
            value={formData.guest_passes_per_cycle || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, guest_passes_per_cycle: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="storage_space_gb">Storage (GB)</Label>
          <Input
            id="storage_space_gb"
            type="number"
            min="0"
            step="0.1"
            value={formData.storage_space_gb || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, storage_space_gb: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="max_members">Max Members</Label>
          <Input
            id="max_members"
            type="number"
            min="1"
            value={formData.max_members || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, max_members: parseInt(e.target.value) || undefined }))}
            placeholder="Unlimited"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.priority_booking || false}
            onChange={(e) => setFormData(prev => ({ ...prev, priority_booking: e.target.checked }))}
          />
          <span>Priority Booking</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_active || false}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          />
          <span>Active</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_public || false}
            onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
          />
          <span>Public</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.requires_approval || false}
            onChange={(e) => setFormData(prev => ({ ...prev, requires_approval: e.target.checked }))}
          />
          <span>Requires Approval</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.highlight_plan || false}
            onChange={(e) => setFormData(prev => ({ ...prev, highlight_plan: e.target.checked }))}
          />
          <span>Highlight Plan</span>
        </label>
      </div>

      {formData.highlight_plan && (
        <div>
          <Label htmlFor="badge_text">Badge Text</Label>
          <Input
            id="badge_text"
            value={formData.badge_text || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
            placeholder="e.g., Most Popular, Best Value"
          />
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading membership plans...</p>
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
            <Crown className="h-6 w-6" />
            Membership Plans
          </h1>
          <p className="text-gray-600">Manage membership plans and pricing for your makerspace</p>
        </div>
        <div className="flex items-center gap-3">
          {plans.length === 0 && (
            <Button onClick={initializeDefaults} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Initialize Defaults
            </Button>
          )}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Membership Plan</DialogTitle>
                <DialogDescription>
                  Create a new membership plan for your makerspace
                </DialogDescription>
              </DialogHeader>
              {renderPlanForm()}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={savePlan} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Plan'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Membership Plans</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first membership plan or initializing default plans.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={initializeDefaults} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Initialize Defaults
              </Button>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.sort((a, b) => a.display_order - b.display_order).map((plan) => (
            <Card key={plan.id} className={`relative ${plan.highlight_plan ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
              {plan.badge_text && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    {plan.badge_text}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getPlanTypeColor(plan.plan_type)}>
                      {plan.plan_type}
                    </Badge>
                    {!plan.is_active && (
                      <Badge variant="outline" className="text-gray-500">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                    {!plan.is_public && (
                      <Badge variant="outline" className="text-orange-600">
                        Private
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicatePlan(plan)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => deletePlan(plan.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                {plan.description && (
                  <p className="text-sm text-gray-600">{plan.description}</p>
                )}
                
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {formatPrice(plan.effective_price, plan.currency)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {getBillingCycleText(plan.billing_cycle)}
                  </span>
                </div>
                
                {plan.discount_percent > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-gray-500">
                      {formatPrice(plan.price, plan.currency)}
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      {plan.discount_percent}% off
                    </Badge>
                  </div>
                )}
                
                {plan.trial_period_days > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 w-fit">
                    <Star className="h-3 w-3 mr-1" />
                    {plan.trial_period_days} day free trial
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Access Type:</span>
                    <span className="font-medium capitalize">{plan.access_type.replace('_', ' ')}</span>
                  </div>
                  
                  {plan.max_hours_per_cycle && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Hours per cycle:</span>
                      <span className="font-medium">{plan.max_hours_per_cycle}h</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Members:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {plan.current_members}{plan.max_members ? `/${plan.max_members}` : ''}
                    </span>
                  </div>
                  
                  {plan.features && plan.features.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {plan.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-gray-500">+{plan.features.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 pt-2">
                    {plan.priority_booking && (
                      <Badge variant="outline" className="text-xs">Priority</Badge>
                    )}
                    {plan.guest_passes_per_cycle > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {plan.guest_passes_per_cycle} Guest Passes
                      </Badge>
                    )}
                    {plan.storage_space_gb > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {plan.storage_space_gb}GB Storage
                      </Badge>
                    )}
                    {plan.requires_approval && (
                      <Badge variant="outline" className="text-xs text-orange-600">
                        Requires Approval
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Membership Plan</DialogTitle>
            <DialogDescription>
              Update the membership plan details
            </DialogDescription>
          </DialogHeader>
          {renderPlanForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={savePlan} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembershipPlans;
