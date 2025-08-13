import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Crown,
  Unlock,
  Loader2,
  Calculator,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useMakerspace } from '../contexts/MakerspaceContext';
import { EquipmentAccessPolicy, CostEstimate, AccessCheckResult, UserSubscription, UserWallet } from '../types/equipment-access';
import { EquipmentBillingService } from '../services/billingService';
import { api } from '../services/apiService';

interface ReservationWithBillingProps {
  isOpen: boolean;
  onClose: () => void;
  onReservationCreated: () => void;
  policies: EquipmentAccessPolicy[];
}

interface ReservationFormData {
  equipment_id: string;
  date: Date;
  start_time: string;
  end_time: string;
  purpose: string;
  notes: string;
  linked_project_id?: string;
}

const ReservationWithBilling: React.FC<ReservationWithBillingProps> = ({ 
  isOpen, 
  onClose, 
  onReservationCreated,
  policies 
}) => {
  const { user } = useAuth();
  const { equipment } = useMakerspace();
  
  const [formData, setFormData] = useState<ReservationFormData>({
    equipment_id: '',
    date: new Date(),
    start_time: '09:00',
    end_time: '10:00',
    purpose: '',
    notes: ''
  });
  
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [accessCheck, setAccessCheck] = useState<AccessCheckResult | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [userWallet, setUserWallet] = useState<UserWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Calculate cost when form changes
  useEffect(() => {
    if (formData.equipment_id && formData.start_time && formData.end_time) {
      calculateCost();
    }
  }, [formData]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const [subscription, wallet] = await Promise.all([
        EquipmentBillingService.getUserSubscription(user.id),
        EquipmentBillingService.getUserWallet(user.id)
      ]);
      
      setUserSubscription(subscription);
      setUserWallet(wallet);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const calculateCost = async () => {
    const policy = policies.find(p => p.equipment_id === formData.equipment_id);
    if (!policy) return;

    const durationMinutes = calculateDurationMinutes();
    if (durationMinutes <= 0) return;

    try {
      const dailyUsage = await EquipmentBillingService.getDailyUsage(
        user?.id || '',
        formData.equipment_id,
        formData.date
      );

      const estimate = EquipmentBillingService.calculateCost(policy, durationMinutes, dailyUsage);
      if (estimate) {
        const equipmentName = equipment.find(e => e.id === formData.equipment_id)?.name || 'Unknown';
        estimate.equipment_name = equipmentName;
        setCostEstimate(estimate);
      } else {
        setCostEstimate(null);
      }

      // Check access
      const accessResult = EquipmentBillingService.checkAccess(
        policy,
        userSubscription || undefined,
        userWallet || undefined,
        estimate?.estimated_total
      );
      setAccessCheck(accessResult);

    } catch (error) {
      console.error('Failed to calculate cost:', error);
    }
  };

  const calculateDurationMinutes = (): number => {
    if (!formData.start_time || !formData.end_time) return 0;
    
    const [startHour, startMinute] = formData.start_time.split(':').map(Number);
    const [endHour, endMinute] = formData.end_time.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return Math.max(0, endMinutes - startMinutes);
  };

  const getAccessTypeDisplay = (policy: EquipmentAccessPolicy) => {
    const icons = {
      free: <Unlock className="h-4 w-4" />,
      subscription_only: <Crown className="h-4 w-4" />,
      pay_per_use: <CreditCard className="h-4 w-4" />
    };

    const colors = {
      free: 'bg-green-100 text-green-800',
      subscription_only: 'bg-blue-100 text-blue-800',
      pay_per_use: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={colors[policy.access_type]}>
        {icons[policy.access_type]}
        <span className="ml-1">{EquipmentBillingService.getPricingDisplay(policy)}</span>
      </Badge>
    );
  };

  const handleSubmit = async () => {
    if (!accessCheck?.allowed) {
      setError('Access not allowed. Please check requirements.');
      return;
    }

    if (!formData.equipment_id || !formData.purpose.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If payment required, process payment first
      if (costEstimate && costEstimate.estimated_total > 0) {
        setPaymentProcessing(true);
        
        const paymentResult = await EquipmentBillingService.processPayment(
          user?.id || '',
          costEstimate.estimated_total,
          `temp_reservation_${Date.now()}`,
          costEstimate.equipment_name
        );

        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment failed');
        }
      }

      // Create reservation using real API
      const startDateTime = new Date(formData.date);
      const [startHour, startMinute] = formData.start_time.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(formData.date);
      const [endHour, endMinute] = formData.end_time.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      const reservationData = {
        equipment_id: formData.equipment_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        purpose: formData.purpose,
        notes: formData.notes,
        linked_project_id: formData.linked_project_id
      };

      const response = await api.reservations.createReservation(reservationData);

      if (response.error) {
        throw new Error(response.error);
      }

      onReservationCreated();
      onClose();
      resetForm();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create reservation');
    } finally {
      setIsLoading(false);
      setPaymentProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      equipment_id: '',
      date: new Date(),
      start_time: '09:00',
      end_time: '10:00',
      purpose: '',
      notes: ''
    });
    setCostEstimate(null);
    setAccessCheck(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto m-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Create Equipment Reservation
            <Button variant="ghost" onClick={handleClose}>
              <XCircle className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Reservation Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reservation Details</h3>
              
              {/* Equipment Selection */}
              <div>
                <Label>Equipment *</Label>
                <Select 
                  value={formData.equipment_id} 
                  onValueChange={(value) => setFormData({...formData, equipment_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.filter(e => e.status === 'available').map(eq => {
                      const policy = policies.find(p => p.equipment_id === eq.id);
                      return (
                        <SelectItem key={eq.id} value={eq.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{eq.name}</span>
                            {policy && getAccessTypeDisplay(policy)}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div>
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({...formData, date})}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time *</Label>
                  <Input 
                    type="time" 
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Time *</Label>
                  <Input 
                    type="time" 
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <Label>Purpose *</Label>
                <Input 
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  placeholder="Brief description of what you're working on"
                />
              </div>

              {/* Notes */}
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional details, materials, special requirements..."
                  rows={3}
                />
              </div>
            </div>

            {/* Right Column - Cost & Access Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cost & Access Information</h3>

              {/* User Account Info */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Account Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subscription:</span>
                      {userSubscription?.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Crown className="h-3 w-3 mr-1" />
                          {userSubscription.plan_name}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No active plan</Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span>Wallet Balance:</span>
                      <div className="flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        <span className="font-medium">
                          {userWallet ? `₹${userWallet.balance.toFixed(2)}` : 'Loading...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Access Check */}
              {accessCheck && (
                <Alert className={accessCheck.allowed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-center gap-2">
                    {accessCheck.allowed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={accessCheck.allowed ? 'text-green-800' : 'text-red-800'}>
                      {accessCheck.allowed ? 'Access approved' : accessCheck.reason}
                    </AlertDescription>
                  </div>
                  {!accessCheck.allowed && accessCheck.required_action && (
                    <div className="mt-2">
                      <Button size="sm" variant="outline">
                        {accessCheck.required_action === 'upgrade_subscription' && 'Upgrade Plan'}
                        {accessCheck.required_action === 'add_funds' && 'Add Funds'}
                        {accessCheck.required_action === 'get_approval' && 'Request Approval'}
                      </Button>
                    </div>
                  )}
                </Alert>
              )}

              {/* Cost Estimate */}
              {costEstimate && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Cost Estimate
                      </h4>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          ₹{costEstimate.estimated_total.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {calculateDurationMinutes()} minutes
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {costEstimate.breakdown.map((line, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{line.split(':')[0]}:</span>
                          <span>{line.split(':')[1]}</span>
                        </div>
                      ))}
                    </div>

                    {costEstimate.daily_cap_reached && (
                      <Alert className="mt-3">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Daily spending cap has been applied to this reservation.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Duration Info */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Summary
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{calculateDurationMinutes()} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{format(formData.date, "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{formData.start_time} - {formData.end_time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!accessCheck?.allowed || isLoading}
              className="min-w-[120px]"
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  {costEstimate && costEstimate.estimated_total > 0 ? (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay & Reserve (₹{costEstimate.estimated_total.toFixed(2)})
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Reservation
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservationWithBilling;
