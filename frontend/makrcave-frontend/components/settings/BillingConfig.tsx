import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import {
  CreditCard,
  DollarSign,
  Wallet,
  Eye,
  EyeOff,
  Calculator,
  Save,
  RefreshCw,
  Info,
  AlertTriangle,
  Users,
  Receipt
} from 'lucide-react';

interface MakerspaceSettings {
  credit_system_enabled?: boolean;
  show_job_cost_estimates?: boolean;
  default_tax_percent?: number;
  default_currency?: string;
  razorpay_key_override?: string;
  stripe_key_override?: string;
  enable_membership_billing?: boolean;
}

interface BillingConfigProps {
  settings: MakerspaceSettings;
  onUpdate: (data: Partial<MakerspaceSettings>) => void;
  onSave: (data: any) => void;
  saving: boolean;
}

const currencies = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' }
];

const BillingConfig: React.FC<BillingConfigProps> = ({
  settings,
  onUpdate,
  onSave,
  saving
}) => {
  const [showRazorpayKey, setShowRazorpayKey] = useState(false);
  const [showStripeKey, setShowStripeKey] = useState(false);

  const handleToggle = (field: string, value: boolean) => {
    onUpdate({ [field]: value });
  };

  const handleInputChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleSave = () => {
    const billingData = {
      credit_system_enabled: settings.credit_system_enabled,
      show_job_cost_estimates: settings.show_job_cost_estimates,
      default_tax_percent: settings.default_tax_percent,
      default_currency: settings.default_currency,
      razorpay_key_override: settings.razorpay_key_override,
      stripe_key_override: settings.stripe_key_override,
      enable_membership_billing: settings.enable_membership_billing
    };
    onSave(billingData);
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || '$';
  };

  return (
    <div className="space-y-6">
      {/* Billing Configuration Overview */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="text-sm text-purple-800">
              <p className="font-medium">Billing Configuration</p>
              <p className="text-purple-700 mt-1">
                Configure payment processing, tax rates, and billing features for your makerspace. 
                These settings affect pricing, invoicing, and payment collection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Credit System */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="credit_system_enabled" className="font-medium">
                  Credit System Enabled
                </Label>
                {settings.credit_system_enabled && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <Wallet className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Enable credit-based payments allowing members to pre-purchase credits
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Members can buy credits and use them for services, jobs, and purchases
              </p>
            </div>
            <Switch
              id="credit_system_enabled"
              checked={settings.credit_system_enabled || false}
              onCheckedChange={(checked) => handleToggle('credit_system_enabled', checked)}
            />
          </div>

          {/* Membership Billing */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="enable_membership_billing" className="font-medium">
                  Membership Billing Enabled
                </Label>
                {settings.enable_membership_billing && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    <Users className="h-3 w-3 mr-1" />
                    Recurring
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Enable recurring membership billing and subscription management
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports monthly, quarterly, and annual membership billing cycles
              </p>
            </div>
            <Switch
              id="enable_membership_billing"
              checked={settings.enable_membership_billing || false}
              onCheckedChange={(checked) => handleToggle('enable_membership_billing', checked)}
            />
          </div>

          {/* Job Cost Estimates */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="show_job_cost_estimates" className="font-medium">
                  Show Job Cost Estimates to Users
                </Label>
                {settings.show_job_cost_estimates && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                    <Calculator className="h-3 w-3 mr-1" />
                    Transparent
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Display estimated costs to users before they submit jobs
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Helps users make informed decisions about their projects
              </p>
            </div>
            <Switch
              id="show_job_cost_estimates"
              checked={settings.show_job_cost_estimates || false}
              onCheckedChange={(checked) => handleToggle('show_job_cost_estimates', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tax & Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Tax & Currency Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Currency */}
          <div className="space-y-2">
            <Label htmlFor="default_currency">Default Currency</Label>
            <Select 
              value={settings.default_currency || 'INR'} 
              onValueChange={(value) => handleInputChange('default_currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span>{currency.symbol}</span>
                      <span>{currency.code}</span>
                      <span className="text-gray-500">- {currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Tax Percentage */}
          <div className="space-y-2">
            <Label htmlFor="default_tax_percent">Default Tax/GST Percentage</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Input
                  id="default_tax_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.default_tax_percent || 18}
                  onChange={(e) => handleInputChange('default_tax_percent', parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
              <div className="text-sm text-gray-500">
                Example: {getCurrencySymbol(settings.default_currency || 'INR')}100 + {settings.default_tax_percent || 18}% tax = {getCurrencySymbol(settings.default_currency || 'INR')}{(100 * (1 + (settings.default_tax_percent || 18) / 100)).toFixed(2)}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              This tax rate will be applied to all invoices and transactions by default
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Centralized Payment Processing</p>
                <p className="text-blue-700 mt-1">
                  All payments are processed through our secure payment gateway. You receive monthly payouts for all transactions in your makerspace. No additional setup required.
                </p>
                <div className="mt-3 space-y-1 text-blue-600">
                  <p>✓ Secure payment processing</p>
                  <p>✓ Monthly revenue payouts</p>
                  <p>✓ Automatic transaction reporting</p>
                  <p>✓ No payment gateway fees for you</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Billing Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Payment Features</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>Credit System:</span>
                  <Badge variant={settings.credit_system_enabled ? "default" : "outline"}>
                    {settings.credit_system_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Membership Billing:</span>
                  <Badge variant={settings.enable_membership_billing ? "default" : "outline"}>
                    {settings.enable_membership_billing ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cost Estimates:</span>
                  <Badge variant={settings.show_job_cost_estimates ? "default" : "outline"}>
                    {settings.show_job_cost_estimates ? 'Shown' : 'Hidden'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Currency & Tax</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>Default Currency:</span>
                  <Badge variant="outline">
                    {getCurrencySymbol(settings.default_currency || 'INR')} {settings.default_currency || 'INR'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax Rate:</span>
                  <Badge variant="outline">
                    {settings.default_tax_percent || 18}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Gateway Override:</span>
                  <Badge variant="outline">
                    {(settings.razorpay_key_override || settings.stripe_key_override) ? 'Custom' : 'Default'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Impact */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2">Configuration Impact</h5>
            <div className="text-xs text-gray-600 space-y-1">
              {settings.credit_system_enabled && (
                <p>• Members can purchase and use credits for all makerspace services</p>
              )}
              {settings.enable_membership_billing && (
                <p>• Recurring membership billing will be available for subscription plans</p>
              )}
              {settings.show_job_cost_estimates && (
                <p>• Cost estimates will be displayed before job submission</p>
              )}
              <p>• All prices will be displayed in {getCurrencySymbol(settings.default_currency || 'INR')} {settings.default_currency || 'INR'} with {settings.default_tax_percent || 18}% tax</p>
            </div>
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
          Save Billing Settings
        </Button>
      </div>
    </div>
  );
};

export default BillingConfig;
