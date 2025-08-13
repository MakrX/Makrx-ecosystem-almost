import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Crown,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';

interface Subscription {
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  nextBilling: string;
  amount: number;
  currency: string;
  features: string[];
}

interface MembershipCardProps {
  subscription: Subscription;
  onUpgrade: () => void;
  detailed?: boolean;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ 
  subscription, 
  onUpgrade, 
  detailed = false 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'professional':
      case 'pro': 
        return <Crown className="h-5 w-5 text-yellow-500" />;
      default: 
        return <Crown className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className={detailed ? 'border-2 border-blue-200' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPlanIcon(subscription.plan)}
            Current Plan
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {getStatusIcon(subscription.status)}
            {subscription.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {subscription.plan} Plan
          </h3>
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-600 mt-1">
            <DollarSign className="h-6 w-6" />
            {subscription.amount}
            <span className="text-sm text-gray-600 font-normal">/{subscription.currency}/month</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}
        </div>

        {detailed && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Plan Features:</h4>
            <div className="space-y-1">
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={onUpgrade} className="flex-1">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
          <Button variant="outline" className="flex-1">
            Manage Billing
          </Button>
        </div>

        {subscription.status === 'expired' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Plan Expired</p>
                <p className="text-red-700">Renew your subscription to continue accessing premium features.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MembershipCard;
