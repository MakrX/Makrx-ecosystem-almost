import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Switch } from '../ui/switch';
import {
  CreditCard,
  Wallet,
  DollarSign,
  Shield,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Info,
  Star,
  RefreshCw,
  ArrowRight,
  Lock,
  Smartphone,
  Building
} from 'lucide-react';

interface CheckoutItem {
  id: string;
  type: 'membership' | 'credits' | 'service' | 'product';
  title: string;
  description?: string;
  price: number;
  quantity: number;
  metadata?: Record<string, any>;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'bank_account';
  provider: 'razorpay' | 'stripe';
  display_name: string;
  is_default: boolean;
  last_four?: string;
  brand?: string;
}

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: CheckoutItem[];
  defaultPaymentMethod?: PaymentMethod;
  availablePaymentMethods?: PaymentMethod[];
  creditBalance?: number;
  onProcessPayment?: (paymentData: any) => void;
  onAddPaymentMethod?: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  onOpenChange,
  items = [],
  defaultPaymentMethod,
  availablePaymentMethods = [],
  creditBalance = 0,
  onProcessPayment,
  onAddPaymentMethod
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>(defaultPaymentMethod?.id || '');
  const [useCredits, setUseCredits] = useState(false);
  const [creditsToUse, setCreditsToUse] = useState(0);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst_number: ''
  });
  const [step, setStep] = useState<'items' | 'payment' | 'billing' | 'review'>('items');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Mock data if no items provided
  const mockItems: CheckoutItem[] = [
    {
      id: '1',
      type: 'credits',
      title: 'Credit Purchase',
      description: '100 credits for makerspace services',
      price: 100.00,
      quantity: 1
    }
  ];

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: 'pm_1',
      type: 'card',
      provider: 'razorpay',
      display_name: 'Visa •••• 4242',
      is_default: true,
      last_four: '4242',
      brand: 'visa'
    },
    {
      id: 'pm_2',
      type: 'upi',
      provider: 'razorpay',
      display_name: 'john.doe@paytm',
      is_default: false
    }
  ];

  const checkoutItems = items.length > 0 ? items : mockItems;
  const paymentMethods = availablePaymentMethods.length > 0 ? availablePaymentMethods : mockPaymentMethods;

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const creditDiscount = Math.min(creditsToUse, subtotal);
  const total = subtotal + tax - creditDiscount;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'upi':
        return <Smartphone className="h-4 w-4 text-orange-600" />;
      case 'bank_account':
        return <Building className="h-4 w-4 text-green-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    // In a real app, this would update the items array
    console.log(`Updating item ${itemId} quantity to ${newQuantity}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setBillingDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleProcessPayment = async () => {
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setIsProcessing(true);
    
    try {
      const paymentData = {
        items: checkoutItems,
        payment_method_id: paymentMethod,
        billing_details: billingDetails,
        credits_used: useCredits ? creditsToUse : 0,
        total_amount: total,
        currency: 'INR'
      };

      await onProcessPayment?.(paymentData);
      onOpenChange(false);
    } catch (error) {
      console.error('Payment processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    switch (step) {
      case 'items':
        setStep('payment');
        break;
      case 'payment':
        setStep('billing');
        break;
      case 'billing':
        setStep('review');
        break;
      case 'review':
        handleProcessPayment();
        break;
    }
  };

  const previousStep = () => {
    switch (step) {
      case 'payment':
        setStep('items');
        break;
      case 'billing':
        setStep('payment');
        break;
      case 'review':
        setStep('billing');
        break;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'items':
        return checkoutItems.length > 0;
      case 'payment':
        return paymentMethod || (useCredits && creditsToUse >= total);
      case 'billing':
        return billingDetails.name && billingDetails.email && billingDetails.phone;
      case 'review':
        return agreeToTerms;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Checkout
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {['items', 'payment', 'billing', 'review'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepName ? 'bg-blue-600 text-white' : 
                ['items', 'payment', 'billing', 'review'].indexOf(step) > index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {['items', 'payment', 'billing', 'review'].indexOf(step) > index ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  ['items', 'payment', 'billing', 'review'].indexOf(step) > index ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Items Step */}
          {step === 'items' && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Order Summary</h3>
              <div className="space-y-3">
                {checkoutItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                          <p className="text-sm font-medium text-blue-600 mt-1">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method Step */}
          {step === 'payment' && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Payment Method</h3>
              
              {/* Credit Balance */}
              {creditBalance > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Use Credits</p>
                          <p className="text-sm text-gray-600">Available: {creditBalance} credits</p>
                        </div>
                      </div>
                      <Switch
                        checked={useCredits}
                        onCheckedChange={setUseCredits}
                      />
                    </div>
                    {useCredits && (
                      <div className="mt-3">
                        <Label htmlFor="credits-amount">Credits to use</Label>
                        <Input
                          id="credits-amount"
                          type="number"
                          value={creditsToUse}
                          onChange={(e) => setCreditsToUse(Math.min(creditBalance, Math.max(0, parseInt(e.target.value) || 0)))}
                          max={Math.min(creditBalance, subtotal)}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Methods */}
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className={`cursor-pointer transition-colors ${
                    paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`} onClick={() => setPaymentMethod(method.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPaymentMethodIcon(method)}
                          <div>
                            <p className="font-medium">{method.display_name}</p>
                            <p className="text-sm text-gray-600 capitalize">{method.provider}</p>
                          </div>
                          {method.is_default && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          paymentMethod === method.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {paymentMethod === method.id && (
                            <div className="w-full h-full rounded-full bg-white border-2 border-blue-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Payment Method */}
                <Card className="cursor-pointer border-dashed hover:bg-gray-50" onClick={onAddPaymentMethod}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Plus className="h-4 w-4" />
                      <span>Add New Payment Method</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Billing Details Step */}
          {step === 'billing' && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={billingDetails.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={billingDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={billingDetails.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gst">GST Number (Optional)</Label>
                  <Input
                    id="gst"
                    value={billingDetails.gst_number}
                    onChange={(e) => handleInputChange('gst_number', e.target.value)}
                    placeholder="Enter GST number"
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={billingDetails.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter address"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={billingDetails.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter city"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={billingDetails.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Enter state"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={billingDetails.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="Enter pincode"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="space-y-6">
              <h3 className="font-medium text-lg">Review Order</h3>
              
              {/* Order Summary */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    {checkoutItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.title} × {item.quantity}</span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (18% GST)</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      {useCredits && creditsToUse > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Credit Discount</span>
                          <span>-{formatCurrency(creditDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium text-lg border-t pt-2 mt-2">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3">
                <Switch
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={setAgreeToTerms}
                />
                <div className="text-sm">
                  <Label htmlFor="terms" className="cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </Label>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-xs mt-1">
                      Your payment information is encrypted and secure. All transactions are processed through secure payment gateways.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Total (Sticky) */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                {useCredits && creditsToUse > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Credit Discount</span>
                    <span>-{formatCurrency(creditDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={step === 'items' ? () => onOpenChange(false) : previousStep}
            >
              {step === 'items' ? 'Cancel' : 'Back'}
            </Button>
            
            <Button
              onClick={nextStep}
              disabled={!canProceed() || isProcessing}
              className="min-w-32"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {step === 'review' ? 'Pay Now' : 'Continue'}
                  {step !== 'review' && <ArrowRight className="h-4 w-4 ml-2" />}
                  {step === 'review' && <Lock className="h-4 w-4 ml-2" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
