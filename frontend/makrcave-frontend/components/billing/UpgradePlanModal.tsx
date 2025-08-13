import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  X,
  Crown,
  Check,
  Star,
  Zap,
  Shield,
  Users,
  Clock
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'annual';
  features: string[];
  popular?: boolean;
  description: string;
}

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  onUpgrade: (planData: any) => void;
}

const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onUpgrade
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: billingPeriod === 'monthly' ? 29 : 290,
      currency: 'USD',
      period: billingPeriod,
      description: 'Perfect for individual makers',
      features: [
        '5 Active Projects',
        '20 Hours/Month',
        'Basic Support',
        'Community Access',
        '1GB Storage'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: billingPeriod === 'monthly' ? 99 : 990,
      currency: 'USD',
      period: billingPeriod,
      description: 'Ideal for serious makers',
      popular: true,
      features: [
        'Unlimited Projects',
        '100 Hours/Month',
        'Priority Support',
        'Advanced Analytics',
        '10GB Storage',
        'API Access',
        'Equipment Reservations'
      ]
    },
    {
      id: 'team',
      name: 'Team',
      price: billingPeriod === 'monthly' ? 199 : 1990,
      currency: 'USD',
      period: billingPeriod,
      description: 'Best for teams and organizations',
      features: [
        'Everything in Professional',
        'Unlimited Hours',
        'Team Management',
        '50GB Storage',
        'Advanced Integrations',
        'Custom Branding',
        'Dedicated Support',
        'Multi-location Access'
      ]
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (plan) {
      onUpgrade({
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        currency: plan.currency,
        period: billingPeriod
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              Upgrade Your Plan
            </h2>
            <p className="text-gray-600">Choose the perfect plan for your needs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Billing Period Toggle */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-center gap-4">
            <span className={billingPeriod === 'monthly' ? 'font-semibold' : 'text-gray-600'}>
              Monthly
            </span>
            <div className="relative">
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  billingPeriod === 'annual' ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <span className={billingPeriod === 'annual' ? 'font-semibold' : 'text-gray-600'}>
              Annual
            </span>
            {billingPeriod === 'annual' && (
              <Badge className="bg-green-100 text-green-800">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-600 bg-blue-50'
                    : plan.popular
                    ? 'border-yellow-400'
                    : 'border-gray-200 hover:border-gray-300'
                } ${currentPlan.toLowerCase() === plan.name.toLowerCase() ? 'opacity-60' : ''}`}
                onClick={() => currentPlan.toLowerCase() !== plan.name.toLowerCase() && handlePlanSelect(plan.id)}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Current Plan Badge */}
                {currentPlan.toLowerCase() === plan.name.toLowerCase() && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500 text-white">
                      <Check className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm text-gray-600 font-normal">
                      /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {billingPeriod === 'annual' && (
                    <p className="text-sm text-green-600 mt-1">
                      ${Math.round(plan.price / 12)}/month when billed annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Selection Indicator */}
                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            <p>✓ 14-day free trial • ✓ Cancel anytime • ✓ Secure payment</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpgrade}
              disabled={!selectedPlan || currentPlan.toLowerCase() === plans.find(p => p.id === selectedPlan)?.name.toLowerCase()}
            >
              <Zap className="h-4 w-4 mr-2" />
              {selectedPlan ? `Upgrade to ${plans.find(p => p.id === selectedPlan)?.name}` : 'Select a Plan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlanModal;
