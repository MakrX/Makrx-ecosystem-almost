import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Wallet,
  Plus,
  TrendingUp,
  Zap
} from 'lucide-react';

interface CreditBalanceDisplayProps {
  balance: number;
  totalSpent: number;
  onAddCredits: () => void;
}

const CreditBalanceDisplay: React.FC<CreditBalanceDisplayProps> = ({ 
  balance, 
  totalSpent, 
  onAddCredits 
}) => {
  const getBalanceColor = (balance: number) => {
    if (balance < 50) return 'text-red-600';
    if (balance < 100) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance < 50) return '⚠️';
    if (balance < 100) return '⚡';
    return '💚';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-gray-900">Credit Wallet</span>
          </div>
          <span className="text-xl">{getBalanceIcon(balance)}</span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Available Credits</p>
            <p className={`text-2xl font-bold ${getBalanceColor(balance)}`}>
              {balance}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Total Spent</p>
            <div className="flex items-center gap-1">
              <p className="text-lg font-semibold text-gray-900">{totalSpent}</p>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {balance < 50 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-xs text-red-700 font-medium">Low balance</p>
              <p className="text-xs text-red-600">Add credits to continue using services</p>
            </div>
          )}

          <Button 
            onClick={onAddCredits}
            variant={balance < 50 ? "default" : "outline"}
            size="sm" 
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Credits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditBalanceDisplay;
