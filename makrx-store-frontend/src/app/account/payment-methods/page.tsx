"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Shield,
  ArrowLeft,
  Check,
  AlertTriangle,
  Lock,
  Star
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  nickname?: string;
  card_last_four?: string;
  card_brand?: 'visa' | 'mastercard' | 'amex' | 'rupay';
  card_expiry?: string;
  upi_id?: string;
  bank_name?: string;
  wallet_type?: 'paytm' | 'phonepe' | 'googlepay' | 'amazonpay';
  is_default: boolean;
  created_at: string;
  last_used?: string;
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/account/payment-methods');
      return;
    }
    loadPaymentMethods();
  }, [isAuthenticated, router]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: "pm_1",
          type: "card",
          nickname: "Personal Visa",
          card_last_four: "4242",
          card_brand: "visa",
          card_expiry: "12/26",
          is_default: true,
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          last_used: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: "pm_2",
          type: "upi",
          nickname: "Main UPI",
          upi_id: "user@paytm",
          is_default: false,
          created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
          last_used: new Date(Date.now() - 86400000 * 5).toISOString()
        },
        {
          id: "pm_3",
          type: "card",
          card_last_four: "8765",
          card_brand: "mastercard",
          card_expiry: "09/25",
          is_default: false,
          created_at: new Date(Date.now() - 86400000 * 60).toISOString()
        }
      ];
      
      setTimeout(() => {
        setPaymentMethods(mockPaymentMethods);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      addNotification('Failed to load payment methods', 'error');
      setLoading(false);
    }
  };

  const deletePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    
    setDeleting(prev => ({ ...prev, [methodId]: true }));
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      addNotification('Payment method removed', 'success');
    } catch (error) {
      addNotification('Failed to remove payment method', 'error');
    } finally {
      setDeleting(prev => ({ ...prev, [methodId]: false }));
    }
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setPaymentMethods(prev => prev.map(method => ({
        ...method,
        is_default: method.id === methodId
      })));
      addNotification('Default payment method updated', 'success');
    } catch (error) {
      addNotification('Failed to update default payment method', 'error');
    }
  };

  const getCardIcon = (brand?: string) => {
    switch (brand) {
      case 'visa':
        return <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>;
      case 'mastercard':
        return <div className="w-8 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>;
      case 'amex':
        return <div className="w-8 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">AMEX</div>;
      case 'rupay':
        return <div className="w-8 h-6 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">RP</div>;
      default:
        return <CreditCard className="h-6 w-6 text-gray-400" />;
    }
  };

  const getMethodIcon = (type: string, subtype?: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-6 w-6 text-blue-500" />;
      case 'upi':
        return <div className="w-6 h-6 bg-purple-500 rounded text-white text-xs flex items-center justify-center font-bold">UPI</div>;
      case 'netbanking':
        return <div className="w-6 h-6 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">NB</div>;
      case 'wallet':
        return <div className="w-6 h-6 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">W</div>;
      default:
        return <CreditCard className="h-6 w-6 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Account
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-blue-500" />
                Payment Methods
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your saved payment methods for faster checkout
              </p>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Your payment information is secure
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                We use industry-standard encryption to protect your payment details. 
                Your full card numbers are never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No payment methods saved
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Add a payment method to make checkout faster and more convenient.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Method Icon */}
                      <div className="flex items-center gap-2">
                        {getMethodIcon(method.type)}
                        {method.type === 'card' && method.card_brand && getCardIcon(method.card_brand)}
                      </div>
                      
                      {/* Method Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {method.nickname || 
                             (method.type === 'card' ? `•••• •••• •••• ${method.card_last_four}` :
                              method.type === 'upi' ? method.upi_id :
                              method.type === 'netbanking' ? method.bank_name :
                              'Wallet')}
                          </h3>
                          
                          {method.is_default && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                              <Star className="h-3 w-3" />
                              Default
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {method.type === 'card' && method.card_expiry && (
                            <span>Expires {method.card_expiry}</span>
                          )}
                          <span>Added {formatDate(method.created_at)}</span>
                          {method.last_used && (
                            <span>Last used {formatDate(method.last_used)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <button
                          onClick={() => setDefaultPaymentMethod(method.id)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          Set as Default
                        </button>
                      )}
                      
                      <button
                        onClick={() => deletePaymentMethod(method.id)}
                        disabled={deleting[method.id]}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        {deleting[method.id] ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Features */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Security & Privacy
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  256-bit SSL Encryption
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All payment data is encrypted using bank-level security standards.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  PCI DSS Compliant
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We follow strict security standards for handling payment information.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  Fraud Protection
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced fraud detection monitors all transactions for suspicious activity.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  No Storage Policy
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We never store your complete card numbers or CVV codes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
