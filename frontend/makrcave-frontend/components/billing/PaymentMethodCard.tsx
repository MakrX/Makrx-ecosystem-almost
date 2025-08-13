import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit,
  Star,
  AlertCircle,
  CheckCircle,
  Calendar,
  Shield,
  MoreHorizontal
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'upi';
  provider: 'razorpay' | 'stripe';
  last_four: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  holder_name: string;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
  bank_name?: string;
  account_type?: string;
  upi_id?: string;
}

interface PaymentMethodCardProps {
  paymentMethods?: PaymentMethod[];
  onAddPaymentMethod?: () => void;
  onEditPaymentMethod?: (method: PaymentMethod) => void;
  onDeletePaymentMethod?: (methodId: string) => void;
  onSetDefaultMethod?: (methodId: string) => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethods = [],
  onAddPaymentMethod,
  onEditPaymentMethod,
  onDeletePaymentMethod,
  onSetDefaultMethod
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'card' | 'bank_account' | 'upi'>('card');
  const [formData, setFormData] = useState({
    holder_name: '',
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_type: 'savings',
    upi_id: ''
  });

  // Mock data if no payment methods provided
  const mockMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      provider: 'razorpay',
      last_four: '4242',
      brand: 'Visa',
      expiry_month: 12,
      expiry_year: 2025,
      holder_name: 'John Doe',
      is_default: true,
      is_verified: true,
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'upi',
      provider: 'razorpay',
      last_four: '1234',
      holder_name: 'John Doe',
      upi_id: 'john.doe@paytm',
      is_default: false,
      is_verified: true,
      created_at: '2024-01-10T14:20:00Z'
    },
    {
      id: '3',
      type: 'bank_account',
      provider: 'razorpay',
      last_four: '5678',
      bank_name: 'HDFC Bank',
      account_type: 'savings',
      holder_name: 'John Doe',
      is_default: false,
      is_verified: false,
      created_at: '2024-01-08T09:15:00Z'
    }
  ];

  const methods = paymentMethods.length > 0 ? paymentMethods : mockMethods;

  const getMethodIcon = (type: string, brand?: string) => {
    if (type === 'card') {
      return <CreditCard className="h-5 w-5 text-blue-600" />;
    } else if (type === 'upi') {
      return <div className="h-5 w-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">₹</div>;
    } else {
      return <div className="h-5 w-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">B</div>;
    }
  };

  const getMethodDisplay = (method: PaymentMethod) => {
    if (method.type === 'card') {
      return {
        title: `${method.brand} •••• ${method.last_four}`,
        subtitle: `Expires ${method.expiry_month}/${method.expiry_year}`,
        description: method.holder_name
      };
    } else if (method.type === 'upi') {
      return {
        title: method.upi_id || `UPI •••• ${method.last_four}`,
        subtitle: 'UPI ID',
        description: method.holder_name
      };
    } else {
      return {
        title: `${method.bank_name} •••• ${method.last_four}`,
        subtitle: `${method.account_type?.charAt(0).toUpperCase()}${method.account_type?.slice(1)} Account`,
        description: method.holder_name
      };
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMethod = () => {
    console.log('Adding payment method:', { type: newMethodType, ...formData });
    setShowAddModal(false);
    setFormData({
      holder_name: '',
      card_number: '',
      expiry_month: '',
      expiry_year: '',
      cvv: '',
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      account_type: 'savings',
      upi_id: ''
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Methods
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No payment methods added</p>
              <p className="text-sm">Add a payment method to get started</p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {methods.map((method) => {
                const display = getMethodDisplay(method);
                return (
                  <div key={method.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getMethodIcon(method.type, method.brand)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{display.title}</h3>
                            {method.is_default && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {method.is_verified ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{display.subtitle}</p>
                          <p className="text-xs text-gray-500">{display.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right text-xs text-gray-500">
                          <p>Added {formatDate(method.created_at)}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Shield className="h-3 w-3" />
                            <span className="capitalize">{method.provider}</span>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!method.is_default && (
                              <DropdownMenuItem onClick={() => onSetDefaultMethod?.(method.id)}>
                                <Star className="h-4 w-4 mr-2" />
                                Set as Default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEditPaymentMethod?.(method)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDeletePaymentMethod?.(method.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {!method.is_verified && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center gap-2 text-yellow-800 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>Verification pending</span>
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                          This payment method needs to be verified before use
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Method Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Add Payment Method
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="method-type">Payment Method Type</Label>
              <Select value={newMethodType} onValueChange={(value: 'card' | 'bank_account' | 'upi') => setNewMethodType(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_account">Bank Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="holder-name">Account Holder Name</Label>
              <Input
                id="holder-name"
                value={formData.holder_name}
                onChange={(e) => handleInputChange('holder_name', e.target.value)}
                placeholder="Enter full name"
                className="mt-1"
              />
            </div>

            {newMethodType === 'card' && (
              <>
                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    value={formData.card_number}
                    onChange={(e) => handleInputChange('card_number', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="expiry-month">Month</Label>
                    <Select value={formData.expiry_month} onValueChange={(value) => handleInputChange('expiry_month', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                            {(i + 1).toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="expiry-year">Year</Label>
                    <Select value={formData.expiry_year} onValueChange={(value) => handleInputChange('expiry_year', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              </>
            )}

            {newMethodType === 'upi' && (
              <div>
                <Label htmlFor="upi-id">UPI ID</Label>
                <Input
                  id="upi-id"
                  value={formData.upi_id}
                  onChange={(e) => handleInputChange('upi_id', e.target.value)}
                  placeholder="username@paytm"
                  className="mt-1"
                />
              </div>
            )}

            {newMethodType === 'bank_account' && (
              <>
                <div>
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={formData.bank_name}
                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                    placeholder="Enter bank name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    value={formData.account_number}
                    onChange={(e) => handleInputChange('account_number', e.target.value)}
                    placeholder="Enter account number"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ifsc-code">IFSC Code</Label>
                  <Input
                    id="ifsc-code"
                    value={formData.ifsc_code}
                    onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
                    placeholder="HDFC0000123"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="account-type">Account Type</Label>
                  <Select value={formData.account_type} onValueChange={(value) => handleInputChange('account_type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-xs mt-1">
                    Your payment information is encrypted and secure. We never store sensitive payment details.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMethod}>
                Add Payment Method
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentMethodCard;
