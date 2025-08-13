import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Crown,
  Calendar,
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
}

interface SubscriptionStatusProps {
  subscription: Subscription;
  onUpgrade: () => void;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ 
  subscription, 
  onUpgrade 
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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span className="font-medium text-gray-900">Subscription</span>
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {getStatusIcon(subscription.status)}
            {subscription.status}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Current Plan</p>
            <p className="text-lg font-bold text-gray-900">{subscription.plan}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Monthly Cost</p>
            <p className="text-lg font-bold text-blue-600">${subscription.amount}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Renews {new Date(subscription.nextBilling).toLocaleDateString()}</span>
          </div>

          <Button 
            onClick={onUpgrade}
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
