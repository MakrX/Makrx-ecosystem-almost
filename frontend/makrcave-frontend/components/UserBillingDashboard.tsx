import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Wallet, 
  Crown, 
  CreditCard, 
  TrendingUp,
  Calendar,
  DollarSign,
  Plus,
  ArrowUpRight,
  History,
  Gift,
  Star,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserWallet, UserSubscription } from '../types/equipment-access';
import { EquipmentBillingService } from '../services/billingService';

interface UserBillingDashboardProps {
  className?: string;
}

interface TransactionHistory {
  id: string;
  date: string;
  type: 'equipment_usage' | 'wallet_topup' | 'subscription_payment' | 'refund';
  amount: number;
  description: string;
  equipment_name?: string;
  status: 'completed' | 'pending' | 'failed';
}

const UserBillingDashboard: React.FC<UserBillingDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [topupAmount, setTopupAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserBillingData();
    }
  }, [user]);

  const loadUserBillingData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const [walletData, subscriptionData] = await Promise.all([
        EquipmentBillingService.getUserWallet(user.id),
        EquipmentBillingService.getUserSubscription(user.id)
      ]);
      
      setWallet(walletData);
      setSubscription(subscriptionData);
      
      // Mock transaction history
      const mockTransactions: TransactionHistory[] = [
        {
          id: 'txn-1',
          date: new Date(Date.now() - 86400000).toISOString(),
          type: 'equipment_usage',
          amount: -150.00,
          description: 'Laser cutter usage - 1 hour',
          equipment_name: 'Glowforge Pro',
          status: 'completed'
        },
        {
          id: 'txn-2',
          date: new Date(Date.now() - 172800000).toISOString(),
          type: 'wallet_topup',
          amount: 500.00,
          description: 'Wallet top-up via UPI',
          status: 'completed'
        },
        {
          id: 'txn-3',
          date: new Date(Date.now() - 259200000).toISOString(),
          type: 'equipment_usage',
          amount: -200.00,
          description: 'CNC machine usage - 1 hour',
          equipment_name: 'Shapeoko 4',
          status: 'completed'
        },
        {
          id: 'txn-4',
          date: new Date(Date.now() - 1209600000).toISOString(),
          type: 'subscription_payment',
          amount: -999.00,
          description: 'Pro Maker Plan - Monthly',
          status: 'completed'
        }
      ];
      setTransactions(mockTransactions);
      
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (wallet) {
        setWallet({
          ...wallet,
          balance: wallet.balance + amount,
          last_updated: new Date().toISOString()
        });
      }
      
      setTopupAmount('');
      alert(`Successfully added ₹${amount.toFixed(2)} to your wallet!`);
      
    } catch (error) {
      alert('Top-up failed. Please try again.');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'equipment_usage': return <DollarSign className="h-4 w-4 text-red-500" />;
      case 'wallet_topup': return <Plus className="h-4 w-4 text-green-500" />;
      case 'subscription_payment': return <Crown className="h-4 w-4 text-blue-500" />;
      case 'refund': return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      default: return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Billing Dashboard</h2>
        <p className="text-gray-600">Manage your wallet, subscription, and payment history</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{wallet?.balance.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {wallet ? formatDate(wallet.last_updated) : 'N/A'}
                </p>
              </div>
              <Wallet className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subscription</p>
                {subscription?.status === 'active' ? (
                  <>
                    <p className="text-lg font-bold text-blue-600">{subscription.plan_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Expires: {formatDate(subscription.end_date)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-gray-600">No Active Plan</p>
                    <p className="text-xs text-gray-500 mt-1">Upgrade for benefits</p>
                  </>
                )}
              </div>
              <Crown className={`h-12 w-12 ${subscription?.status === 'active' ? 'text-blue-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spending Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-purple-600">
                  ₹{transactions
                    .filter(t => t.type === 'equipment_usage' && new Date(t.date).getMonth() === new Date().getMonth())
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                    .toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Equipment usage</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wallet" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>

            <TabsContent value="wallet" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top-up Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add Funds</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        min="1"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {[100, 500, 1000].map(amount => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setTopupAmount(amount.toString())}
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>

                    <Button 
                      onClick={handleWalletTopup}
                      disabled={!topupAmount || parseFloat(topupAmount) <= 0}
                      className="w-full"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                  </CardContent>
                </Card>

                {/* Wallet Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Wallet Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Current Balance:</span>
                        <span className="font-medium">₹{wallet?.balance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Currency:</span>
                        <span className="font-medium">{wallet?.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Auto-reload:</span>
                        <Badge variant="outline">Disabled</Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-gray-500">
                        Your wallet balance is used for pay-per-use equipment. 
                        Unused funds never expire and are fully refundable.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              {subscription?.status === 'active' ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-blue-500" />
                      {subscription.plan_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Plan Details</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Start Date:</span>
                            <span>{formatDate(subscription.start_date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>End Date:</span>
                            <span>{formatDate(subscription.end_date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Included Equipment</h4>
                        <div className="space-y-1">
                          {subscription.included_equipment_types.map(type => (
                            <Badge key={type} variant="outline" className="mr-1">
                              {type.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Active Subscription</h3>
                    <p className="text-gray-600 mb-6">
                      Upgrade to a membership plan for unlimited access to equipment and exclusive benefits.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <Card className="border-2 border-blue-200">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Maker Plan</h4>
                          <p className="text-2xl font-bold text-blue-600 mb-2">₹499/month</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Unlimited 3D printing</li>
                            <li>• Workstation access</li>
                            <li>• 10% discount on materials</li>
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-2 border-purple-200">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Pro Plan</h4>
                          <p className="text-2xl font-bold text-purple-600 mb-2">₹999/month</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Everything in Maker</li>
                            <li>• Laser cutter access</li>
                            <li>• CNC machine access</li>
                            <li>• Priority booking</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Button className="mt-6">
                      <Star className="h-4 w-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                {transactions.map(transaction => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(transaction.date)}
                              {transaction.equipment_name && ` • ${transaction.equipment_name}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount >= 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserBillingDashboard;
