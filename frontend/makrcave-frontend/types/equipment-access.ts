// Equipment Access and Pricing Types

export interface EquipmentAccessPolicy {
  id: string;
  equipment_id: string;
  access_type: 'free' | 'subscription_only' | 'pay_per_use';
  membership_required: boolean;
  
  // Pricing fields (for pay_per_use)
  price_per_unit?: number;
  cost_unit?: 'minute' | 'hour';
  minimum_billing_time?: number;
  grace_period_minutes?: number;
  max_daily_cap?: number;
  overuse_penalty_flat?: number;
  overuse_penalty_percent?: number;
  
  // Additional settings
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ReservationBilling {
  is_billed: boolean;
  billed_amount?: number;
  duration_charged_minutes: number;
  linked_payment_id?: string;
  estimated_cost?: number;
  actual_cost?: number;
  billing_breakdown?: BillingBreakdown;
}

export interface BillingBreakdown {
  base_duration_minutes: number;
  base_cost: number;
  grace_period_minutes: number;
  overuse_minutes?: number;
  overuse_penalty?: number;
  total_cost: number;
  currency: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  included_equipment_types: string[];
}

export interface UserWallet {
  user_id: string;
  balance: number;
  currency: string;
  last_updated: string;
}

export interface CostEstimate {
  equipment_name: string;
  duration_minutes: number;
  base_cost: number;
  grace_period_applied: boolean;
  estimated_total: number;
  currency: string;
  breakdown: string[];
  daily_usage_so_far: number;
  daily_cap_reached: boolean;
}

export interface AccessCheckResult {
  allowed: boolean;
  access_type: 'free' | 'subscription_only' | 'pay_per_use';
  reason?: string;
  required_action?: 'upgrade_subscription' | 'add_funds' | 'get_approval';
  estimated_cost?: number;
  subscription_required?: boolean;
}
