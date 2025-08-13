import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  DollarSign, 
  Clock, 
  Shield, 
  Users, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  Save,
  Eye,
  Calculator,
  Wallet,
  Crown,
  Lock,
  Unlock
} from 'lucide-react';
import { useMakerspace } from '../contexts/MakerspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { EquipmentAccessPolicy, CostEstimate, AccessCheckResult } from '../types/equipment-access';

interface EquipmentAccessPricingManagerProps {
  className?: string;
}

const EquipmentAccessPricingManager: React.FC<EquipmentAccessPricingManagerProps> = ({ className = '' }) => {
  const { equipment } = useMakerspace();
  const { user } = useAuth();
  const [policies, setPolicies] = useState<EquipmentAccessPolicy[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [currentPolicy, setCurrentPolicy] = useState<EquipmentAccessPolicy | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);

  // Mock data initialization
  const initializePolicies = () => {
    const mockPolicies: EquipmentAccessPolicy[] = equipment.map(eq => ({
      id: `policy-${eq.id}`,
      equipment_id: eq.id,
      access_type: eq.type === 'workstation' ? 'free' : eq.type === 'printer_3d' ? 'subscription_only' : 'pay_per_use',
      membership_required: eq.type !== 'workstation',
      price_per_unit: eq.type === 'laser_cutter' ? 150 : eq.type === 'cnc_machine' ? 200 : undefined,
      cost_unit: eq.type === 'laser_cutter' || eq.type === 'cnc_machine' ? 'hour' : undefined,
      minimum_billing_time: eq.type === 'laser_cutter' ? 15 : eq.type === 'cnc_machine' ? 30 : undefined,
      grace_period_minutes: 5,
      max_daily_cap: eq.type === 'laser_cutter' ? 500 : eq.type === 'cnc_machine' ? 800 : undefined,
      overuse_penalty_flat: 50,
      overuse_penalty_percent: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user?.id || 'admin'
    }));
    setPolicies(mockPolicies);
    
    if (mockPolicies.length > 0) {
      setSelectedEquipment(mockPolicies[0].equipment_id);
      setCurrentPolicy(mockPolicies[0]);
    }
  };

  useEffect(() => {
    initializePolicies();
  }, [equipment]);

  useEffect(() => {
    if (selectedEquipment) {
      const policy = policies.find(p => p.equipment_id === selectedEquipment);
      setCurrentPolicy(policy || null);
      setHasUnsavedChanges(false);
    }
  }, [selectedEquipment, policies]);

  const updatePolicy = (updates: Partial<EquipmentAccessPolicy>) => {
    if (!currentPolicy) return;
    
    const updatedPolicy = { ...currentPolicy, ...updates };
    setCurrentPolicy(updatedPolicy);
    setHasUnsavedChanges(true);
  };

  const savePolicy = async () => {
    if (!currentPolicy) return;
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPolicies(prev => prev.map(p => 
        p.equipment_id === currentPolicy.equipment_id ? currentPolicy : p
      ));
      setHasUnsavedChanges(false);
      alert('Access policy saved successfully!');
    } catch (error) {
      alert('Failed to save policy. Please try again.');
    }
  };

  const calculateCostEstimate = (durationMinutes: number) => {
    if (!currentPolicy || currentPolicy.access_type !== 'pay_per_use') return null;

    const gracePeriod = currentPolicy.grace_period_minutes || 0;
    const chargeableMinutes = Math.max(0, durationMinutes - gracePeriod);
    const minimumBilling = currentPolicy.minimum_billing_time || 0;
    const actualChargeableMinutes = Math.max(chargeableMinutes, minimumBilling);
    
    let baseCost = 0;
    if (currentPolicy.cost_unit === 'hour') {
      baseCost = (actualChargeableMinutes / 60) * (currentPolicy.price_per_unit || 0);
    } else {
      baseCost = actualChargeableMinutes * (currentPolicy.price_per_unit || 0);
    }

    const breakdown = [
      `Duration: ${durationMinutes} minutes`,
      `Grace period: ${gracePeriod} minutes (free)`,
      `Chargeable: ${chargeableMinutes} minutes`,
      `Minimum billing: ${minimumBilling} minutes`,
      `Rate: ₹${currentPolicy.price_per_unit}/${currentPolicy.cost_unit}`
    ];

    const estimate: CostEstimate = {
      equipment_name: equipment.find(e => e.id === currentPolicy.equipment_id)?.name || 'Unknown',
      duration_minutes: durationMinutes,
      base_cost: baseCost,
      grace_period_applied: gracePeriod > 0,
      estimated_total: baseCost,
      currency: 'INR',
      breakdown,
      daily_usage_so_far: 0,
      daily_cap_reached: false
    };

    return estimate;
  };

  const getAccessTypeColor = (type: string) => {
    switch (type) {
      case 'free': return 'bg-green-100 text-green-800 border-green-200';
      case 'subscription_only': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pay_per_use': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAccessTypeIcon = (type: string) => {
    switch (type) {
      case 'free': return <Unlock className="h-4 w-4" />;
      case 'subscription_only': return <Crown className="h-4 w-4" />;
      case 'pay_per_use': return <CreditCard className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  if (!currentPolicy) {
    return (
      <div className={`p-6 ${className}`}>
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Equipment Selected</h3>
            <p className="text-gray-600">Select equipment to configure access and pricing policy</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipment Access & Pricing</h2>
          <p className="text-gray-600">Configure access control and billing policies</p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unsaved changes
            </Badge>
          )}
          <Button onClick={savePolicy} disabled={!hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Policy
          </Button>
        </div>
      </div>

      {/* Equipment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Equipment Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Select Equipment</Label>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose equipment to configure" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map(eq => (
                    <SelectItem key={eq.id} value={eq.id}>
                      <div className="flex items-center gap-2">
                        {getAccessTypeIcon(policies.find(p => p.equipment_id === eq.id)?.access_type || 'free')}
                        {eq.name} ({eq.type.replace('_', ' ')})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col items-center">
              <Label className="text-sm text-gray-600">Current Access</Label>
              <Badge className={getAccessTypeColor(currentPolicy.access_type)}>
                {getAccessTypeIcon(currentPolicy.access_type)}
                <span className="ml-1 capitalize">{currentPolicy.access_type.replace('_', ' ')}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Policy Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Access & Pricing Policy Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="access" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="access">Access Control</TabsTrigger>
              <TabsTrigger value="pricing">Pricing Settings</TabsTrigger>
              <TabsTrigger value="preview">Cost Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="access" className="space-y-6">
              {/* Access Type Selection */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">Access Type</Label>
                <div className="space-y-3">
                  {(['free', 'subscription_only', 'pay_per_use'] as const).map((type) => (
                    <div
                      key={type}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        currentPolicy.access_type === type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updatePolicy({ access_type: type })}
                    >
                      <div className="flex items-center space-x-3">
                        {getAccessTypeIcon(type)}
                        <div className="flex-1">
                          <div className="font-medium text-sm capitalize">
                            {type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {type === 'free' && 'Any logged-in user can reserve and use without cost'}
                            {type === 'subscription_only' && 'Only users with active paid subscription can reserve'}
                            {type === 'pay_per_use' && 'Users pay based on actual usage time'}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          currentPolicy.access_type === type
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {currentPolicy.access_type === type && (
                            <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Membership Required */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-medium">Membership Required</Label>
                  <p className="text-sm text-gray-600">Require any form of membership to access</p>
                </div>
                <Switch 
                  checked={currentPolicy.membership_required}
                  onCheckedChange={(checked) => updatePolicy({ membership_required: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              {currentPolicy.access_type === 'pay_per_use' ? (
                <div className="space-y-6">
                  {/* Basic Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Cost Unit</Label>
                      <Select 
                        value={currentPolicy.cost_unit || 'minute'}
                        onValueChange={(value: 'minute' | 'hour') => updatePolicy({ cost_unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minute">Per Minute</SelectItem>
                          <SelectItem value="hour">Per Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Price per {currentPolicy.cost_unit || 'minute'} (₹)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={currentPolicy.price_per_unit || 0}
                        onChange={(e) => updatePolicy({ price_per_unit: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Billing Rules */}
                  <Separator />
                  <h3 className="text-lg font-semibold">Billing Rules</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Minimum Billing Time (minutes)</Label>
                      <Input 
                        type="number"
                        value={currentPolicy.minimum_billing_time || 0}
                        onChange={(e) => updatePolicy({ minimum_billing_time: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum duration charged even if used less
                      </p>
                    </div>

                    <div>
                      <Label>Grace Period (minutes)</Label>
                      <Input 
                        type="number"
                        value={currentPolicy.grace_period_minutes || 0}
                        onChange={(e) => updatePolicy({ grace_period_minutes: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Free time buffer before billing starts
                      </p>
                    </div>
                  </div>

                  {/* Daily Caps and Penalties */}
                  <Separator />
                  <h3 className="text-lg font-semibold">Caps & Penalties</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>Max Daily Cap (₹)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={currentPolicy.max_daily_cap || ''}
                        onChange={(e) => updatePolicy({ max_daily_cap: parseFloat(e.target.value) || undefined })}
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <Label>Overuse Penalty - Flat (₹)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={currentPolicy.overuse_penalty_flat || ''}
                        onChange={(e) => updatePolicy({ overuse_penalty_flat: parseFloat(e.target.value) || undefined })}
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <Label>Overuse Penalty - % Extra</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={currentPolicy.overuse_penalty_percent || ''}
                        onChange={(e) => updatePolicy({ overuse_penalty_percent: parseFloat(e.target.value) || undefined })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pricing Configuration</h3>
                  <p>
                    {currentPolicy.access_type === 'free' && 'This equipment is free to use'}
                    {currentPolicy.access_type === 'subscription_only' && 'This equipment is included with membership plans'}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Cost Calculator</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <Label>Duration (minutes)</Label>
                    <Input 
                      type="number"
                      placeholder="60"
                      onChange={(e) => {
                        const duration = parseInt(e.target.value) || 0;
                        if (duration > 0) {
                          setCostEstimate(calculateCostEstimate(duration));
                        } else {
                          setCostEstimate(null);
                        }
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    {costEstimate ? (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold">{costEstimate.equipment_name}</h4>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                ₹{costEstimate.estimated_total.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">Estimated Cost</div>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {costEstimate.breakdown.map((line, index) => (
                              <div key={index}>{line}</div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Wallet className="h-8 w-8 mx-auto mb-2" />
                        <p>Enter duration to see cost estimate</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Policy Summary */}
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Policy Summary</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold mb-2">Access Configuration</h5>
                        <div className="space-y-1 text-sm">
                          <div>Access Type: <Badge className={getAccessTypeColor(currentPolicy.access_type)}>
                            {currentPolicy.access_type.replace('_', ' ')}
                          </Badge></div>
                          <div>Membership Required: {currentPolicy.membership_required ? 'Yes' : 'No'}</div>
                        </div>
                      </div>
                      
                      {currentPolicy.access_type === 'pay_per_use' && (
                        <div>
                          <h5 className="font-semibold mb-2">Pricing Configuration</h5>
                          <div className="space-y-1 text-sm">
                            <div>Rate: ₹{currentPolicy.price_per_unit}/{currentPolicy.cost_unit}</div>
                            <div>Minimum billing: {currentPolicy.minimum_billing_time} minutes</div>
                            <div>Grace period: {currentPolicy.grace_period_minutes} minutes</div>
                            {currentPolicy.max_daily_cap && (
                              <div>Daily cap: ₹{currentPolicy.max_daily_cap}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentAccessPricingManager;
