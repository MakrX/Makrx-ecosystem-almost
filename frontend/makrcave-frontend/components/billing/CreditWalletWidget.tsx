import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Wallet,
  Plus,
  Minus,
  Settings,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  DollarSign
} from 'lucide-react';

interface CreditTransaction {
  id: string;
  type: 'earned' | 'spent' | 'refund' | 'manual_adjustment';
  amount: number;
  description: string;
  created_at: string;
  balance_after: number;
}

interface CreditWalletData {
  id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  conversion_rate: number;
  auto_recharge_enabled: boolean;
  auto_recharge_threshold: number;
  auto_recharge_amount: number;
}

const CreditWalletWidget: React.FC = () => {
  const [walletData, setWalletData] = useState<CreditWalletData>({
    id: 'wallet_1',
    balance: 150,
    total_earned: 500,
    total_spent: 350,
    conversion_rate: 1.0,
    auto_recharge_enabled: false,
    auto_recharge_threshold: 10,
    auto_recharge_amount: 100
  });

  const [recentTransactions] = useState<CreditTransaction[]>([
    {
      id: '1',
      type: 'spent',
      amount: -45,
      description: '3D Print Job #PRT001',
      created_at: '2024-01-20T14:30:00Z',
      balance_after: 150
    },
    {
      id: '2',
      type: 'earned',
      amount: 50,
      description: 'Workshop completion bonus',
      created_at: '2024-01-19T10:15:00Z',
      balance_after: 195
    },
    {
      id: '3',
      type: 'spent',
      amount: -25,
      description: 'Laser cutting service',
      created_at: '2024-01-18T16:45:00Z',
      balance_after: 145
    },
    {
      id: '4',
      type: 'earned',
      amount: 150,
      description: 'Credit purchase',
      created_at: '2024-01-17T11:20:00Z',
      balance_after: 170
    }
  ]);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [settings, setSettings] = useState({
    auto_recharge_enabled: walletData.auto_recharge_enabled,
    auto_recharge_threshold: walletData.auto_recharge_threshold.toString(),
    auto_recharge_amount: walletData.auto_recharge_amount.toString()
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <ArrowDownRight className="h-4 w-4 text-green-600" />;
    } else {
      return <ArrowUpRight className="h-4 w-4 text-red-600" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleBuyCredits = () => {
    const amount = parseInt(buyAmount);
    if (amount > 0) {
      // Here you would typically create a checkout session
      console.log(`Buying ${amount} credits`);
      setShowBuyCreditsModal(false);
      setBuyAmount('');
    }
  };

  const handleSaveSettings = () => {
    setWalletData(prev => ({
      ...prev,
      auto_recharge_enabled: settings.auto_recharge_enabled,
      auto_recharge_threshold: parseInt(settings.auto_recharge_threshold),
      auto_recharge_amount: parseInt(settings.auto_recharge_amount)
    }));
    setShowSettingsModal(false);
  };

  const creditValue = walletData.balance * walletData.conversion_rate;
  const isLowBalance = walletData.balance < 20;

  return (
    <>
      <Card className={`${isLowBalance ? 'border-orange-200 bg-orange-50' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              Credit Wallet
              {isLowBalance && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Low Balance
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowSettingsModal(true)}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => setShowBuyCreditsModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Buy Credits
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance Section */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-purple-600">{walletData.balance}</p>
                  <span className="text-sm text-gray-500">credits</span>
                </div>
                <p className="text-sm text-gray-500">≈ ₹{creditValue.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Earned</p>
                  <p className="font-semibold text-green-600">{walletData.total_earned}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="font-semibold text-red-600">{walletData.total_spent}</p>
                </div>
              </div>

              {walletData.auto_recharge_enabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center gap-2 text-blue-800 text-sm">
                    <RefreshCw className="h-4 w-4" />
                    <span className="font-medium">Auto-recharge enabled</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Will add {walletData.auto_recharge_amount} credits when balance falls below {walletData.auto_recharge_threshold}
                  </p>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Recent Transactions</h3>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-3">
                {recentTransactions.slice(0, 4).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type, transaction.amount)}
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getTransactionColor(transaction.amount)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </p>
                      <p className="text-xs text-gray-500">Balance: {transaction.balance_after}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buy Credits Modal */}
      <Dialog open={showBuyCreditsModal} onOpenChange={setShowBuyCreditsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Buy Credits
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="credit-amount">Number of Credits</Label>
              <Input
                id="credit-amount"
                type="number"
                placeholder="Enter amount"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="mt-1"
                min="1"
              />
              {buyAmount && (
                <p className="text-sm text-gray-500 mt-1">
                  Total cost: ₹{(parseInt(buyAmount || '0') * walletData.conversion_rate).toFixed(2)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 200].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setBuyAmount(amount.toString())}
                >
                  {amount} credits
                </Button>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Credit Benefits</p>
                  <ul className="text-xs mt-1 space-y-1">
                    <li>• Instant payment for services</li>
                    <li>• No transaction fees</li>
                    <li>• Auto-recharge available</li>
                    <li>• 1 credit = ₹1</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowBuyCreditsModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleBuyCredits} disabled={!buyAmount || parseInt(buyAmount) <= 0}>
                Buy Credits
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Wallet Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-recharge">Auto-recharge</Label>
                <p className="text-sm text-gray-500">Automatically add credits when balance is low</p>
              </div>
              <Switch
                id="auto-recharge"
                checked={settings.auto_recharge_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, auto_recharge_enabled: checked }))
                }
              />
            </div>

            {settings.auto_recharge_enabled && (
              <>
                <div>
                  <Label htmlFor="threshold">Threshold (credits)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={settings.auto_recharge_threshold}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, auto_recharge_threshold: e.target.value }))
                    }
                    className="mt-1"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Trigger auto-recharge when balance falls below this amount
                  </p>
                </div>

                <div>
                  <Label htmlFor="recharge-amount">Recharge Amount (credits)</Label>
                  <Input
                    id="recharge-amount"
                    type="number"
                    value={settings.auto_recharge_amount}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, auto_recharge_amount: e.target.value }))
                    }
                    className="mt-1"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Amount of credits to add during auto-recharge
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreditWalletWidget;
