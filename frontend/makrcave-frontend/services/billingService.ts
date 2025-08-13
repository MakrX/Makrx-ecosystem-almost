import { EquipmentAccessPolicy, CostEstimate, AccessCheckResult, ReservationBilling, BillingBreakdown, UserSubscription, UserWallet } from '../types/equipment-access';

export class EquipmentBillingService {
  
  /**
   * Check if user has access to equipment based on policy
   */
  static checkAccess(
    policy: EquipmentAccessPolicy, 
    userSubscription?: UserSubscription,
    userWallet?: UserWallet,
    estimatedCost?: number
  ): AccessCheckResult {
    const result: AccessCheckResult = {
      allowed: false,
      access_type: policy.access_type,
      estimated_cost: estimatedCost
    };

    switch (policy.access_type) {
      case 'free':
        result.allowed = true;
        break;

      case 'subscription_only':
        if (!policy.membership_required) {
          result.allowed = true;
        } else if (!userSubscription || userSubscription.status !== 'active') {
          result.reason = 'Active subscription required';
          result.required_action = 'upgrade_subscription';
          result.subscription_required = true;
        } else {
          result.allowed = true;
        }
        break;

      case 'pay_per_use':
        if (policy.membership_required && (!userSubscription || userSubscription.status !== 'active')) {
          result.reason = 'Membership required for this equipment';
          result.required_action = 'upgrade_subscription';
          result.subscription_required = true;
        } else if (estimatedCost && userWallet && userWallet.balance < estimatedCost) {
          result.reason = `Insufficient balance. Need ₹${estimatedCost.toFixed(2)}, have ₹${userWallet.balance.toFixed(2)}`;
          result.required_action = 'add_funds';
        } else {
          result.allowed = true;
        }
        break;
    }

    return result;
  }

  /**
   * Calculate cost estimate for a reservation
   */
  static calculateCost(
    policy: EquipmentAccessPolicy,
    durationMinutes: number,
    dailyUsageSoFar: number = 0
  ): CostEstimate | null {
    if (policy.access_type !== 'pay_per_use') {
      return null;
    }

    const gracePeriod = policy.grace_period_minutes || 0;
    const minimumBilling = policy.minimum_billing_time || 0;
    
    // Calculate chargeable time
    const chargeableMinutes = Math.max(0, durationMinutes - gracePeriod);
    const actualChargeableMinutes = Math.max(chargeableMinutes, minimumBilling);
    
    // Calculate base cost
    let baseCost = 0;
    if (policy.cost_unit === 'hour') {
      baseCost = (actualChargeableMinutes / 60) * (policy.price_per_unit || 0);
    } else {
      baseCost = actualChargeableMinutes * (policy.price_per_unit || 0);
    }

    // Check daily cap
    const totalDailyCost = dailyUsageSoFar + baseCost;
    let finalCost = baseCost;
    let dailyCapReached = false;
    
    if (policy.max_daily_cap && totalDailyCost > policy.max_daily_cap) {
      finalCost = Math.max(0, policy.max_daily_cap - dailyUsageSoFar);
      dailyCapReached = true;
    }

    const breakdown = [
      `Duration: ${durationMinutes} minutes`,
      `Grace period: ${gracePeriod} minutes (free)`,
      `Chargeable: ${chargeableMinutes} minutes`,
      ...(minimumBilling > chargeableMinutes ? [`Minimum billing: ${minimumBilling} minutes`] : []),
      `Rate: ₹${policy.price_per_unit}/${policy.cost_unit}`,
      ...(dailyCapReached ? [`Daily cap applied: ₹${policy.max_daily_cap}`] : [])
    ];

    return {
      equipment_name: '', // Will be set by caller
      duration_minutes: durationMinutes,
      base_cost: baseCost,
      grace_period_applied: gracePeriod > 0,
      estimated_total: finalCost,
      currency: 'INR',
      breakdown,
      daily_usage_so_far: dailyUsageSoFar,
      daily_cap_reached: dailyCapReached
    };
  }

  /**
   * Calculate final billing for completed reservation
   */
  static calculateFinalBilling(
    policy: EquipmentAccessPolicy,
    plannedDurationMinutes: number,
    actualDurationMinutes: number,
    dailyUsageSoFar: number = 0
  ): ReservationBilling {
    if (policy.access_type !== 'pay_per_use') {
      return {
        is_billed: false,
        duration_charged_minutes: actualDurationMinutes
      };
    }

    const gracePeriod = policy.grace_period_minutes || 0;
    const minimumBilling = policy.minimum_billing_time || 0;
    
    // Calculate chargeable time
    const chargeableMinutes = Math.max(0, actualDurationMinutes - gracePeriod);
    const actualChargeableMinutes = Math.max(chargeableMinutes, minimumBilling);
    
    // Calculate base cost
    let baseCost = 0;
    if (policy.cost_unit === 'hour') {
      baseCost = (actualChargeableMinutes / 60) * (policy.price_per_unit || 0);
    } else {
      baseCost = actualChargeableMinutes * (policy.price_per_unit || 0);
    }

    // Calculate overuse penalty if applicable
    let overusePenalty = 0;
    const overuseMinutes = Math.max(0, actualDurationMinutes - plannedDurationMinutes);
    
    if (overuseMinutes > 0) {
      if (policy.overuse_penalty_flat) {
        overusePenalty += policy.overuse_penalty_flat;
      }
      if (policy.overuse_penalty_percent) {
        overusePenalty += baseCost * (policy.overuse_penalty_percent / 100);
      }
    }

    let totalCost = baseCost + overusePenalty;

    // Apply daily cap
    const totalDailyCost = dailyUsageSoFar + totalCost;
    if (policy.max_daily_cap && totalDailyCost > policy.max_daily_cap) {
      totalCost = Math.max(0, policy.max_daily_cap - dailyUsageSoFar);
    }

    const breakdown: BillingBreakdown = {
      base_duration_minutes: actualDurationMinutes,
      base_cost: baseCost,
      grace_period_minutes: gracePeriod,
      overuse_minutes: overuseMinutes > 0 ? overuseMinutes : undefined,
      overuse_penalty: overusePenalty > 0 ? overusePenalty : undefined,
      total_cost: totalCost,
      currency: 'INR'
    };

    return {
      is_billed: true,
      billed_amount: totalCost,
      duration_charged_minutes: actualChargeableMinutes,
      billing_breakdown: breakdown,
      actual_cost: totalCost
    };
  }

  /**
   * Mock payment processing
   */
  static async processPayment(
    userId: string,
    amount: number,
    reservationId: string,
    equipmentName: string
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      // Mock API call to MakrX Store backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment success/failure
      if (amount > 1000) {
        throw new Error('Payment amount too high for demo');
      }

      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      return {
        success: true,
        paymentId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  /**
   * Get user's daily usage for an equipment
   */
  static async getDailyUsage(userId: string, equipmentId: string, date: Date): Promise<number> {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock daily usage
    return Math.random() * 200; // Random amount between 0-200 INR
  }

  /**
   * Get user's wallet balance
   */
  static async getUserWallet(userId: string): Promise<UserWallet> {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      user_id: userId,
      balance: 500 + Math.random() * 1000, // Random balance between 500-1500 INR
      currency: 'INR',
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Get user's subscription status
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate some users having subscriptions
    if (Math.random() > 0.5) {
      return {
        id: `sub_${userId}`,
        user_id: userId,
        plan_name: 'Pro Maker Plan',
        status: 'active',
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        included_equipment_types: ['printer_3d', 'workstation']
      };
    }
    
    return null;
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string = 'INR'): string {
    if (currency === 'INR') {
      return `₹${amount.toFixed(2)}`;
    }
    return `${amount.toFixed(2)} ${currency}`;
  }

  /**
   * Get pricing display for equipment
   */
  static getPricingDisplay(policy: EquipmentAccessPolicy): string {
    switch (policy.access_type) {
      case 'free':
        return 'Free to use';
      case 'subscription_only':
        return 'Included with membership';
      case 'pay_per_use':
        return `₹${policy.price_per_unit}/${policy.cost_unit}`;
      default:
        return 'Contact admin';
    }
  }
}
