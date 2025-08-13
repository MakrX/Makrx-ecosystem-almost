import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import {
  Settings,
  DollarSign,
  Save,
  RefreshCw,
  Crown,
  Zap,
  Wrench,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const PricingConfigForm: React.FC = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [pricingConfig, setPricingConfig] = useState({
    // Subscription Plans
    basicPlan: {
      monthlyPrice: 29,
      annualPrice: 290,
      enabled: true
    },
    professionalPlan: {
      monthlyPrice: 99,
      annualPrice: 990,
      enabled: true
    },
    teamPlan: {
      monthlyPrice: 199,
      annualPrice: 1990,
      enabled: true
    },
    
    // Credit System
    creditConversionRate: 41.50, // 1 credit = ₹41.50
    minimumCreditPurchase: 10,
    creditBonusThresholds: [
      { amount: 100, bonus: 10 },
      { amount: 250, bonus: 25 },
      { amount: 500, bonus: 75 },
      { amount: 1000, bonus: 200 }
    ],
    
    // Equipment Usage (Future)
    equipmentPricing: {
      '3d_printer': { pricePerHour: 5.00, enabled: false },
      'laser_cutter': { pricePerHour: 8.00, enabled: false },
      'cnc_mill': { pricePerHour: 12.00, enabled: false },
      'vinyl_cutter': { pricePerHour: 3.00, enabled: false }
    },
    
    // Service Pricing
    servicePricing: {
      '3d_printing': { basePrice: 10.00, pricePerGram: 0.20, enabled: true },
      'laser_cutting': { basePrice: 15.00, pricePerMinute: 0.50, enabled: true },
      'consulting': { pricePerHour: 75.00, enabled: true }
    },
    
    // Global Settings
    taxRate: 0.18, // 18% default
    currency: 'USD',
    paymentGateways: {
      stripe: { enabled: true, feeRate: 0.029 },
      razorpay: { enabled: true, feeRate: 0.025 },
      paypal: { enabled: false, feeRate: 0.035 }
    },
    
    // Discounts & Promotions
    studentDiscount: { rate: 0.20, enabled: true },
    annualDiscount: { rate: 0.20, enabled: true },
    bulkCreditDiscount: { threshold: 500, rate: 0.15, enabled: true }
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setPricingConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section: string, subsection: string, field: string, value: any) => {
    setPricingConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...(prev[section as keyof typeof prev] as any)[subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Pricing configuration updated",
        description: "All pricing changes have been applied successfully"
      });
    } catch (error) {
      toast({
        title: "Error updating pricing",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const validatePricing = () => {
    const warnings = [];
    
    // Check for extremely low prices
    if (pricingConfig.creditConversionRate < 0.10) {
      warnings.push('Credit conversion rate is very low');
    }
    
    // Check for reasonable subscription pricing
    if (pricingConfig.basicPlan.monthlyPrice > pricingConfig.professionalPlan.monthlyPrice) {
      warnings.push('Basic plan is more expensive than Professional plan');
    }
    
    return warnings;
  };

  const warnings = validatePricing();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Pricing Configuration
          </h2>
          <p className="text-gray-600">Manage global pricing settings across all makerspaces</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Configuration Warnings</p>
                <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Plan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div>
              <Label className="text-base font-semibold">Basic Plan</Label>
              <div className="flex items-center gap-2 mt-1">
                <Switch
                  checked={pricingConfig.basicPlan.enabled}
                  onCheckedChange={(checked) => handleInputChange('basicPlan', 'enabled', checked)}
                />
                <span className="text-sm text-gray-600">
                  {pricingConfig.basicPlan.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="basic-monthly">Monthly Price ($)</Label>
              <Input
                id="basic-monthly"
                type="number"
                step="0.01"
                value={pricingConfig.basicPlan.monthlyPrice}
                onChange={(e) => handleInputChange('basicPlan', 'monthlyPrice', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="basic-annual">Annual Price ($)</Label>
              <Input
                id="basic-annual"
                type="number"
                step="0.01"
                value={pricingConfig.basicPlan.annualPrice}
                onChange={(e) => handleInputChange('basicPlan', 'annualPrice', parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Professional Plan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div>
              <Label className="text-base font-semibold">Professional Plan</Label>
              <div className="flex items-center gap-2 mt-1">
                <Switch
                  checked={pricingConfig.professionalPlan.enabled}
                  onCheckedChange={(checked) => handleInputChange('professionalPlan', 'enabled', checked)}
                />
                <span className="text-sm text-gray-600">
                  {pricingConfig.professionalPlan.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <Badge className="bg-yellow-100 text-yellow-800">Popular</Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="pro-monthly">Monthly Price ($)</Label>
              <Input
                id="pro-monthly"
                type="number"
                step="0.01"
                value={pricingConfig.professionalPlan.monthlyPrice}
                onChange={(e) => handleInputChange('professionalPlan', 'monthlyPrice', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="pro-annual">Annual Price ($)</Label>
              <Input
                id="pro-annual"
                type="number"
                step="0.01"
                value={pricingConfig.professionalPlan.annualPrice}
                onChange={(e) => handleInputChange('professionalPlan', 'annualPrice', parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Team Plan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div>
              <Label className="text-base font-semibold">Team Plan</Label>
              <div className="flex items-center gap-2 mt-1">
                <Switch
                  checked={pricingConfig.teamPlan.enabled}
                  onCheckedChange={(checked) => handleInputChange('teamPlan', 'enabled', checked)}
                />
                <span className="text-sm text-gray-600">
                  {pricingConfig.teamPlan.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="team-monthly">Monthly Price ($)</Label>
              <Input
                id="team-monthly"
                type="number"
                step="0.01"
                value={pricingConfig.teamPlan.monthlyPrice}
                onChange={(e) => handleInputChange('teamPlan', 'monthlyPrice', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="team-annual">Annual Price ($)</Label>
              <Input
                id="team-annual"
                type="number"
                step="0.01"
                value={pricingConfig.teamPlan.annualPrice}
                onChange={(e) => handleInputChange('teamPlan', 'annualPrice', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Credit System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="credit-rate">Credit Conversion Rate ($/credit)</Label>
              <Input
                id="credit-rate"
                type="number"
                step="0.01"
                value={pricingConfig.creditConversionRate}
                onChange={(e) => setPricingConfig(prev => ({ ...prev, creditConversionRate: parseFloat(e.target.value) }))}
              />
              <p className="text-sm text-gray-600 mt-1">
                1 credit = ${pricingConfig.creditConversionRate}
              </p>
            </div>
            <div>
              <Label htmlFor="min-purchase">Minimum Credit Purchase</Label>
              <Input
                id="min-purchase"
                type="number"
                value={pricingConfig.minimumCreditPurchase}
                onChange={(e) => setPricingConfig(prev => ({ ...prev, minimumCreditPurchase: parseInt(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Pricing (Future) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Equipment Usage Pricing
            <Badge variant="outline">Future Feature</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(pricingConfig.equipmentPricing).map(([equipment, config]) => (
              <div key={equipment} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded-lg">
                <div>
                  <Label className="capitalize">{equipment.replace('_', ' ')}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) => handleNestedChange('equipmentPricing', equipment, 'enabled', checked)}
                    />
                    <span className="text-sm text-gray-600">
                      {config.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Price per Hour ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.pricePerHour}
                    onChange={(e) => handleNestedChange('equipmentPricing', equipment, 'pricePerHour', parseFloat(e.target.value))}
                    disabled={!config.enabled}
                  />
                </div>
                <div className="flex items-end">
                  <p className="text-sm text-gray-600">
                    Revenue per 8hr day: ${(config.pricePerHour * 8).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.01"
                value={pricingConfig.taxRate * 100}
                onChange={(e) => setPricingConfig(prev => ({ ...prev, taxRate: parseFloat(e.target.value) / 100 }))}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={pricingConfig.currency} onValueChange={(value) => setPricingConfig(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="student-discount">Student Discount (%)</Label>
              <Input
                id="student-discount"
                type="number"
                step="0.01"
                value={pricingConfig.studentDiscount.rate * 100}
                onChange={(e) => handleNestedChange('studentDiscount', 'rate', 'rate', parseFloat(e.target.value) / 100)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Gateways */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(pricingConfig.paymentGateways).map(([gateway, config]) => (
              <div key={gateway} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded-lg">
                <div>
                  <Label className="capitalize">{gateway}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) => handleNestedChange('paymentGateways', gateway, 'enabled', checked)}
                    />
                    <span className="text-sm text-gray-600">
                      {config.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Transaction Fee Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={config.feeRate * 100}
                    onChange={(e) => handleNestedChange('paymentGateways', gateway, 'feeRate', parseFloat(e.target.value) / 100)}
                    disabled={!config.enabled}
                  />
                </div>
                <div className="flex items-end">
                  <p className="text-sm text-gray-600">
                    Fee on ₹8,300: ₹{(config.feeRate * 8300).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Saving Configuration...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
};

export default PricingConfigForm;
