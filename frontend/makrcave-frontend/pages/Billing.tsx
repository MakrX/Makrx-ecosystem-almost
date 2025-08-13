import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  CreditCard,
  DollarSign,
  Download,
  Plus,
  TrendingUp,
  Calendar,
  Wallet,
  CheckCircle,
  Users,
  AlertTriangle,
  Eye,
  Settings,
  ShoppingCart,
  FileText,
  BarChart3,
  Crown,
  Zap,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';

// Import new billing components
import MembershipCard from '../components/billing/MembershipCard';
import SubscriptionStatus from '../components/billing/SubscriptionStatus';
import UpgradePlanModal from '../components/billing/UpgradePlanModal';
import CreditBalanceDisplay from '../components/billing/CreditBalanceDisplay';
import AddCreditsButton from '../components/billing/AddCreditsButton';
import TransactionHistoryList from '../components/billing/TransactionHistoryList';
import InvoiceCard from '../components/billing/InvoiceCard';
import InventoryReorderModal from '../components/billing/InventoryReorderModal';
import ReorderHistoryTable from '../components/billing/ReorderHistoryTable';
import PaymentForm from '../components/billing/PaymentForm';
import PricingConfigForm from '../components/billing/PricingConfigForm';
import BillingOverview from '../components/billing/BillingOverview';
import RevenueGraph from '../components/billing/RevenueGraph';
import UsageByCategoryPieChart from '../components/billing/UsageByCategoryPieChart';

import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

const Billing: React.FC = () => {
  const { user, hasPermission, isSuperAdmin, isMakerspaceAdmin } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false);
  const [showInventoryReorderModal, setShowInventoryReorderModal] = useState(false);
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app this would come from API
  const [billingData, setBillingData] = useState({
    subscription: {
      plan: 'Professional',
      status: 'active',
      nextBilling: '2024-02-15',
      amount: 99,
      currency: 'USD',
      features: ['Unlimited Projects', '100 Hours/Month', 'Priority Support', 'Advanced Analytics']
    },
    credits: {
      balance: 250,
      totalSpent: 1850,
      totalPurchased: 2100
    },
    recentTransactions: [
      {
        id: 'tx-001',
        type: 'subscription',
        description: 'Professional Plan - Monthly',
        amount: 99,
        status: 'completed',
        date: '2024-01-15',
        invoiceId: 'inv-001'
      },
      {
        id: 'tx-002',
        type: 'credits',
        description: 'Credit Purchase - 100 Credits',
        amount: 50,
        status: 'completed',
        date: '2024-01-12',
        invoiceId: 'inv-002'
      }
    ],
    invoices: [
      {
        id: 'inv-001',
        date: '2024-01-15',
        amount: 99,
        status: 'paid',
        description: 'Professional Plan - Monthly',
        downloadUrl: '#'
      },
      {
        id: 'inv-002',
        date: '2024-01-12',
        amount: 50,
        status: 'paid',
        description: 'Credit Purchase',
        downloadUrl: '#'
      }
    ],
    analytics: {
      monthlyRevenue: 12500,
      totalUsers: 156,
      creditUsage: 75,
      refundRate: 2.1
    }
  });

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Data is already set in state above for demo
    } catch (error) {
      toast({
        title: "Error loading billing data",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = (planData: any) => {
    console.log('Upgrading to plan:', planData);
    toast({
      title: "Plan upgrade initiated",
      description: "You will be redirected to payment processing"
    });
    setShowUpgradePlanModal(false);
  };

  const handleAddCredits = (amount: number) => {
    console.log('Adding credits:', amount);
    toast({
      title: "Credits purchase initiated",
      description: `Processing purchase of ${amount} credits`
    });
    setShowAddCreditsModal(false);
  };

  const handleReorder = (orderData: any) => {
    console.log('Creating reorder:', orderData);
    toast({
      title: "Reorder submitted",
      description: "Your inventory reorder has been submitted for approval"
    });
    setShowInventoryReorderModal(false);
  };

  // Determine user access level
  const canViewGlobalAnalytics = isSuperAdmin;
  const canManagePricing = isSuperAdmin;
  const canViewMakerspaceAnalytics = isSuperAdmin || isMakerspaceAdmin;
  const canReorderInventory = isSuperAdmin || isMakerspaceAdmin;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading billing data...</span>
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
            <CreditCard className="h-6 w-6" />
            Billing & Payments
          </h1>
          <p className="text-gray-600">
            {isSuperAdmin 
              ? "Manage billing across all makerspaces and users" 
              : isMakerspaceAdmin 
                ? "Manage billing for your makerspace and approve purchases"
                : "Manage your subscriptions, payments, and credits"
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canReorderInventory && (
            <Button variant="outline" onClick={() => setShowInventoryReorderModal(true)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Reorder Inventory
            </Button>
          )}
          <AddCreditsButton onAddCredits={() => setShowAddCreditsModal(true)} />
        </div>
      </div>

      {/* Quick Stats Overview */}
      {!isSuperAdmin && !isMakerspaceAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subscription Status */}
          <SubscriptionStatus 
            subscription={billingData.subscription}
            onUpgrade={() => setShowUpgradePlanModal(true)}
          />
          
          {/* Credit Balance */}
          <CreditBalanceDisplay 
            balance={billingData.credits.balance}
            totalSpent={billingData.credits.totalSpent}
            onAddCredits={() => setShowAddCreditsModal(true)}
          />
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">₹12,367</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    On track
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Analytics Overview */}
      {(isSuperAdmin || isMakerspaceAdmin) && (
        <BillingOverview 
          analytics={billingData.analytics}
          userRole={user?.role || 'maker'}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${getTabGridCols()}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {!isSuperAdmin && !isMakerspaceAdmin && (
            <TabsTrigger value="membership">Membership</TabsTrigger>
          )}
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          {canReorderInventory && (
            <TabsTrigger value="reorders">Reorders</TabsTrigger>
          )}
          {canViewGlobalAnalytics && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
          {canManagePricing && (
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {!isSuperAdmin && !isMakerspaceAdmin ? (
            // User Overview
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MembershipCard 
                subscription={billingData.subscription}
                onUpgrade={() => setShowUpgradePlanModal(true)}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billingData.recentTransactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-600">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${transaction.amount}</p>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Admin Overview
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueGraph data={getMockRevenueData()} />
              <UsageByCategoryPieChart data={getMockUsageData()} />
            </div>
          )}
        </TabsContent>

        {/* Membership Tab (Users only) */}
        {!isSuperAdmin && !isMakerspaceAdmin && (
          <TabsContent value="membership" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MembershipCard 
                  subscription={billingData.subscription}
                  onUpgrade={() => setShowUpgradePlanModal(true)}
                  detailed={true}
                />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plan Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {billingData.subscription.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => setShowUpgradePlanModal(true)}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <TransactionHistoryList transactions={billingData.recentTransactions} />
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {billingData.invoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        </TabsContent>

        {/* Reorders Tab (Admins only) */}
        {canReorderInventory && (
          <TabsContent value="reorders" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Inventory Reorders</h3>
              <Button onClick={() => setShowInventoryReorderModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Reorder
              </Button>
            </div>
            <ReorderHistoryTable />
          </TabsContent>
        )}

        {/* Analytics Tab (Super Admin only) */}
        {canViewGlobalAnalytics && (
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueGraph data={getMockRevenueData()} />
              <UsageByCategoryPieChart data={getMockUsageData()} />
            </div>
            <BillingOverview 
              analytics={billingData.analytics}
              userRole={user?.role || 'maker'}
              detailed={true}
            />
          </TabsContent>
        )}

        {/* Pricing Tab (Super Admin only) */}
        {canManagePricing && (
          <TabsContent value="pricing" className="space-y-6">
            <PricingConfigForm />
          </TabsContent>
        )}
      </Tabs>

      {/* Modals */}
      {showUpgradePlanModal && (
        <UpgradePlanModal
          isOpen={showUpgradePlanModal}
          onClose={() => setShowUpgradePlanModal(false)}
          currentPlan={billingData.subscription.plan}
          onUpgrade={handleUpgradePlan}
        />
      )}

      {showInventoryReorderModal && (
        <InventoryReorderModal
          isOpen={showInventoryReorderModal}
          onClose={() => setShowInventoryReorderModal(false)}
          onSubmit={handleReorder}
        />
      )}

      {showAddCreditsModal && (
        <PaymentForm
          isOpen={showAddCreditsModal}
          onClose={() => setShowAddCreditsModal(false)}
          type="credits"
          onSubmit={handleAddCredits}
        />
      )}
    </div>
  );

  function getTabGridCols() {
    let cols = 4; // Overview, Transactions, Invoices
    if (!isSuperAdmin && !isMakerspaceAdmin) cols += 1; // Membership
    if (canReorderInventory) cols += 1; // Reorders
    if (canViewGlobalAnalytics) cols += 1; // Analytics
    if (canManagePricing) cols += 1; // Pricing
    return `grid-cols-${Math.min(cols, 7)}`;
  }

  function getMockRevenueData() {
    return [
      { month: 'Jan', revenue: 12000 },
      { month: 'Feb', revenue: 15000 },
      { month: 'Mar', revenue: 13500 },
      { month: 'Apr', revenue: 18000 },
      { month: 'May', revenue: 16500 },
      { month: 'Jun', revenue: 19000 }
    ];
  }

  function getMockUsageData() {
    return [
      { name: 'Subscriptions', value: 60, color: '#3B82F6' },
      { name: 'Credits', value: 25, color: '#10B981' },
      { name: 'Reorders', value: 10, color: '#F59E0B' },
      { name: 'Services', value: 5, color: '#EF4444' }
    ];
  }
};

export default Billing;
