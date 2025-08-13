import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  X,
  CreditCard,
  DollarSign,
  Zap,
  Shield,
  CheckCircle
} from 'lucide-react';

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'credits' | 'subscription';
  onSubmit: (paymentData: any) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  isOpen,
  onClose,
  type,
  onSubmit
}) => {
  const [paymentData, setPaymentData] = useState({
    amount: type === 'credits' ? '50' : '',
    credits: type === 'credits' ? '100' : '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    billingAddress: ''
  });

  const [loading, setLoading] = useState(false);

  // Credit packages for quick selection
  const creditPackages = [
    { credits: 50, price: 25, bonus: 0 },
    { credits: 100, price: 50, bonus: 10 },
    { credits: 250, price: 125, bonus: 25 },
    { credits: 500, price: 250, bonus: 75 },
    { credits: 1000, price: 500, bonus: 200 }
  ];

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackageSelect = (pkg: any) => {
    setPaymentData(prev => ({
      ...prev,
      credits: (pkg.credits + pkg.bonus).toString(),
      amount: pkg.price.toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const submitData = {
        ...paymentData,
        amount: parseFloat(paymentData.amount),
        credits: parseInt(paymentData.credits),
        transactionId: `tx-${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      onSubmit(submitData);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">
              {type === 'credits' ? 'Add Credits' : 'Payment Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Credit Packages (only for credits) */}
          {type === 'credits' && (
            <div className="space-y-4">
              <Label>Select Credit Package</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {creditPackages.map((pkg, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      parseInt(paymentData.credits) === pkg.credits + pkg.bonus
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePackageSelect(pkg)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{pkg.credits} Credits</p>
                        {pkg.bonus > 0 && (
                          <p className="text-sm text-green-600">+{pkg.bonus} bonus</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${pkg.price}</p>
                        {pkg.bonus > 0 && (
                          <p className="text-xs text-green-600">Best Value</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="pl-10"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {type === 'credits' && (
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="credits"
                    type="number"
                    value={paymentData.credits}
                    onChange={(e) => handleInputChange('credits', e.target.value)}
                    className="pl-10"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="razorpay">Razorpay (India)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Details (if card payment) */}
          {paymentData.paymentMethod === 'card' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="cardNumber"
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    className="pl-10"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="holderName">Cardholder Name</Label>
                <Input
                  id="holderName"
                  type="text"
                  value={paymentData.holderName}
                  onChange={(e) => handleInputChange('holderName', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Secure Payment</p>
                <p className="text-green-700">Your payment information is encrypted and secure. We never store your card details.</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {type === 'credits' && (
                <div className="flex justify-between">
                  <span>Credits:</span>
                  <span>{paymentData.credits}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>${paymentData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${paymentData.amount}</span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>SSL Encrypted</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={!paymentData.amount || loading}
            >
              {loading ? 'Processing...' : `Pay $${paymentData.amount}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
