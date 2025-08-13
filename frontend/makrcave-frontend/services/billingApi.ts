// Billing API Service for MakrCave Frontend
// Connects frontend components with the backend billing system

import loggingService from './loggingService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Transaction interfaces
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'membership' | 'credit_purchase' | 'printing_3d' | 'laser_cutting' | 'workshop' | 'materials' | 'refund';
  status: 'success' | 'pending' | 'failed' | 'cancelled' | 'refunded';
  description: string;
  gateway: 'razorpay' | 'stripe' | 'credit' | 'bank_transfer';
  gateway_transaction_id?: string;
  created_at: string;
  completed_at?: string;
  failure_reason?: string;
  metadata?: Record<string, any>;
}

// Invoice interfaces
export interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  description?: string;
  amount: number;
  total_amount: number;
  tax_amount?: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  issue_date: string;
  due_date?: string;
  paid_date?: string;
  customer_name: string;
  customer_email: string;
  payment_method?: string;
  transaction_id?: string;
  file_url?: string;
  metadata?: Record<string, any>;
}

// Credit Wallet interfaces
export interface CreditWallet {
  id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  conversion_rate: number;
  auto_recharge_enabled: boolean;
  auto_recharge_threshold: number;
  auto_recharge_amount: number;
}

export interface CreditTransaction {
  id: string;
  type: 'earned' | 'spent' | 'refund' | 'manual_adjustment';
  amount: number;
  description: string;
  created_at: string;
  balance_after: number;
  metadata?: Record<string, any>;
}

// Payment Method interfaces
export interface PaymentMethod {
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

// Analytics interfaces
export interface BillingAnalytics {
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
    growth_rate: number;
    previous_period: number;
  };
  transactions: {
    total_count: number;
    successful_count: number;
    failed_count: number;
    pending_count: number;
    success_rate: number;
    average_amount: number;
  };
  revenue_by_type: Record<string, number>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  top_customers: Array<{
    customer_name: string;
    customer_email: string;
    total_spent: number;
    transaction_count: number;
  }>;
  payment_methods: Record<string, number>;
}

// Request interfaces
export interface CreateTransactionRequest {
  amount: number;
  currency: string;
  type: string;
  description: string;
  gateway: string;
  metadata?: Record<string, any>;
}

export interface CreateInvoiceRequest {
  title: string;
  description?: string;
  amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  due_date?: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  metadata?: Record<string, any>;
}

export interface UpdateCreditWalletRequest {
  auto_recharge_enabled?: boolean;
  auto_recharge_threshold?: number;
  auto_recharge_amount?: number;
}

export interface AddPaymentMethodRequest {
  type: 'card' | 'bank_account' | 'upi';
  provider: 'razorpay' | 'stripe';
  holder_name: string;
  token: string; // Payment gateway token
  is_default?: boolean;
}

// Mock data for fallback when API is unavailable
const mockData = {
  transactions: [
    {
      id: 'txn_001',
      amount: 250.00,
      currency: 'USD',
      type: 'membership' as const,
      status: 'success' as const,
      description: 'Monthly membership fee',
      gateway: 'stripe' as const,
      gateway_transaction_id: 'pi_1234567890',
      created_at: '2024-02-01T10:00:00Z',
      completed_at: '2024-02-01T10:01:00Z'
    },
    {
      id: 'txn_002',
      amount: 75.50,
      currency: 'USD',
      type: 'printing_3d' as const,
      status: 'success' as const,
      description: '3D printing job - Prototype parts',
      gateway: 'credit' as const,
      created_at: '2024-02-05T14:30:00Z',
      completed_at: '2024-02-05T14:30:00Z'
    }
  ],
  invoices: [
    {
      id: 'inv_001',
      invoice_number: 'INV-2024-001',
      title: 'Equipment Usage - January 2024',
      amount: 150.00,
      total_amount: 150.00,
      currency: 'USD',
      status: 'paid' as const,
      issue_date: '2024-01-31',
      due_date: '2024-02-15',
      paid_date: '2024-02-01',
      customer_name: 'John Maker',
      customer_email: 'john@example.com'
    }
  ],
  creditWallet: {
    id: 'wallet_001',
    balance: 125.50,
    total_earned: 300.00,
    total_spent: 174.50,
    conversion_rate: 1.0,
    auto_recharge_enabled: true,
    auto_recharge_threshold: 50.0,
    auto_recharge_amount: 100.0
  },
  paymentMethods: [
    {
      id: 'pm_001',
      type: 'card' as const,
      provider: 'stripe' as const,
      last_four: '4242',
      brand: 'visa' as const,
      expiry_month: 12,
      expiry_year: 2025,
      holder_name: 'John Maker',
      is_default: true,
      is_verified: true,
      created_at: '2024-01-01T00:00:00Z'
    }
  ],
  analytics: {
    revenue: {
      total: 5250.00,
      monthly: 1250.00,
      weekly: 320.00,
      daily: 85.00,
      growth_rate: 12.5,
      previous_period: 1100.00
    },
    transactions: {
      total_count: 156,
      successful_count: 148,
      failed_count: 8,
      pending_count: 0,
      success_rate: 94.8,
      average_amount: 125.50
    },
    revenue_by_type: {
      membership: 2500.00,
      printing_3d: 1200.00,
      laser_cutting: 800.00,
      workshop: 450.00,
      materials: 300.00
    },
    revenue_by_month: [
      { month: '2024-01', revenue: 1100.00, transactions: 42 },
      { month: '2024-02', revenue: 1250.00, transactions: 48 }
    ],
    top_customers: [
      { customer_name: 'John Maker', customer_email: 'john@example.com', total_spent: 450.00, transaction_count: 12 }
    ],
    payment_methods: {
      credit_card: 65,
      credit_wallet: 25,
      bank_transfer: 10
    }
  }
};

// Helper function for API calls with fallback
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const startTime = Date.now();
  const method = options.method || 'GET';

  loggingService.debug('api', 'BillingApi.apiCall', `Starting ${method} ${endpoint}`, {
    endpoint,
    method,
    hasBody: !!options.body
  });

  // Check if we're in a cloud environment where API might not be available
  const isCloudEnvironment = window.location.hostname.includes('fly.dev') ||
                            window.location.hostname.includes('builder.codes') ||
                            !window.location.hostname.includes('localhost');

  // If in cloud environment or API base URL suggests no real backend, use mock data immediately
  if (isCloudEnvironment || API_BASE_URL === '/api') {
    const responseTime = Date.now() - startTime;

    loggingService.info('api', 'BillingApi.apiCall', 'Using mock data for cloud environment', {
      endpoint,
      method,
      responseTime,
      reason: 'cloud_environment_detected'
    });

    loggingService.logBillingEvent('api_fallback_to_mock', undefined, {
      endpoint,
      method,
      environment: 'cloud'
    });

    const fallbackData = getFallbackData<T>(endpoint);
    if (fallbackData !== null) {
      return { data: fallbackData };
    }

    // Return appropriate empty data based on endpoint
    if (endpoint.includes('analytics')) {
      return { data: { revenue: { total: 0, monthly: 0, weekly: 0, daily: 0, growth_rate: 0, previous_period: 0 }, transactions: { total_count: 0, successful_count: 0, failed_count: 0, pending_count: 0, success_rate: 0, average_amount: 0 }, revenue_by_type: {}, revenue_by_month: [], top_customers: [], payment_methods: {} } as T };
    }
    if (endpoint.includes('credit-wallet')) {
      return { data: { id: 'wallet_fallback', balance: 0, total_earned: 0, total_spent: 0, conversion_rate: 1.0, auto_recharge_enabled: false, auto_recharge_threshold: 0, auto_recharge_amount: 0 } as T };
    }
    return { data: [] as T };
  }

  // Try real API call for local development
  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');

    loggingService.debug('api', 'BillingApi.apiCall', 'Making real API call', {
      endpoint,
      method,
      hasToken: !!token,
      apiBaseUrl: API_BASE_URL
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    const responseTime = Date.now() - startTime;
    loggingService.logAPICall(endpoint, method, response.status, responseTime);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;

      loggingService.error('api', 'BillingApi.apiCall', 'API call failed', {
        endpoint,
        method,
        statusCode: response.status,
        errorMessage,
        responseTime
      });

      loggingService.logBillingEvent('api_error', undefined, {
        endpoint,
        method,
        statusCode: response.status,
        errorMessage
      });

      throw new Error(errorMessage);
    }

    const data = await response.json();

    loggingService.info('api', 'BillingApi.apiCall', 'API call successful', {
      endpoint,
      method,
      responseTime,
      hasData: !!data
    });

    loggingService.logBillingEvent('api_success', undefined, {
      endpoint,
      method,
      responseTime
    });

    return { data };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    loggingService.warn('api', 'BillingApi.apiCall', 'API call failed, using fallback data', {
      endpoint,
      method,
      error: (error as Error).message,
      responseTime
    });

    loggingService.logBillingEvent('api_fallback_after_error', undefined, {
      endpoint,
      method,
      error: (error as Error).message,
      responseTime
    });

    // Fallback to mock data
    const fallbackData = getFallbackData<T>(endpoint);
    if (fallbackData !== null) {
      return { data: fallbackData };
    }

    // Return appropriate empty data based on endpoint
    if (endpoint.includes('analytics')) {
      return { data: { revenue: { total: 0, monthly: 0, weekly: 0, daily: 0, growth_rate: 0, previous_period: 0 }, transactions: { total_count: 0, successful_count: 0, failed_count: 0, pending_count: 0, success_rate: 0, average_amount: 0 }, revenue_by_type: {}, revenue_by_month: [], top_customers: [], payment_methods: {} } as T };
    }
    if (endpoint.includes('credit-wallet')) {
      return { data: { id: 'wallet_fallback', balance: 0, total_earned: 0, total_spent: 0, conversion_rate: 1.0, auto_recharge_enabled: false, auto_recharge_threshold: 0, auto_recharge_amount: 0 } as T };
    }
    return { data: [] as T };
  }
}

// Get fallback data based on endpoint
function getFallbackData<T>(endpoint: string): T | null {
  console.log('Getting fallback data for endpoint:', endpoint);

  if (endpoint.includes('transactions')) {
    console.log('Returning transaction fallback data');
    return mockData.transactions as T;
  }
  if (endpoint.includes('invoices')) {
    console.log('Returning invoice fallback data');
    return mockData.invoices as T;
  }
  if (endpoint.includes('credit-wallet')) {
    console.log('Returning credit wallet fallback data');
    return mockData.creditWallet as T;
  }
  if (endpoint.includes('payment-methods')) {
    console.log('Returning payment methods fallback data');
    return mockData.paymentMethods as T;
  }
  if (endpoint.includes('analytics')) {
    console.log('Returning analytics fallback data');
    return mockData.analytics as T;
  }

  console.log('No specific fallback data found for:', endpoint);
  return null;
}

// Transaction API
export const transactionApi = {
  // Get all transactions with filtering
  getTransactions: async (params?: {
    status?: string;
    type?: string;
    gateway?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Transaction[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    return apiCall<Transaction[]>(`/billing/transactions?${queryParams}`);
  },

  // Get transaction by ID
  getTransaction: async (transactionId: string): Promise<ApiResponse<Transaction>> => {
    return apiCall<Transaction>(`/billing/transactions/${transactionId}`);
  },

  // Create new transaction
  createTransaction: async (data: CreateTransactionRequest): Promise<ApiResponse<Transaction>> => {
    return apiCall<Transaction>('/billing/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Retry failed transaction
  retryTransaction: async (transactionId: string): Promise<ApiResponse<Transaction>> => {
    return apiCall<Transaction>(`/billing/transactions/${transactionId}/retry`, {
      method: 'POST',
    });
  },

  // Download transaction receipt
  downloadReceipt: async (transactionId: string): Promise<ApiResponse<Blob>> => {
    return apiCall<Blob>(`/billing/transactions/${transactionId}/receipt`);
  },
};

// Invoice API
export const invoiceApi = {
  // Get all invoices with filtering
  getInvoices: async (params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Invoice[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    return apiCall<Invoice[]>(`/billing/invoices?${queryParams}`);
  },

  // Get invoice by ID
  getInvoice: async (invoiceId: string): Promise<ApiResponse<Invoice>> => {
    return apiCall<Invoice>(`/billing/invoices/${invoiceId}`);
  },

  // Create new invoice
  createInvoice: async (data: CreateInvoiceRequest): Promise<ApiResponse<Invoice>> => {
    return apiCall<Invoice>('/billing/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Download invoice PDF
  downloadInvoice: async (invoiceId: string): Promise<ApiResponse<Blob>> => {
    return apiCall<Blob>(`/billing/invoices/${invoiceId}/download`);
  },

  // Send invoice to customer
  sendInvoice: async (invoiceId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/billing/invoices/${invoiceId}/send`, {
      method: 'POST',
    });
  },

  // Mark invoice as paid
  markAsPaid: async (invoiceId: string): Promise<ApiResponse<Invoice>> => {
    return apiCall<Invoice>(`/billing/invoices/${invoiceId}/mark-paid`, {
      method: 'POST',
    });
  },

  // Cancel invoice
  cancelInvoice: async (invoiceId: string): Promise<ApiResponse<Invoice>> => {
    return apiCall<Invoice>(`/billing/invoices/${invoiceId}/cancel`, {
      method: 'POST',
    });
  },
};

// Credit Wallet API
export const creditWalletApi = {
  // Get wallet information
  getWallet: async (): Promise<ApiResponse<CreditWallet>> => {
    return apiCall<CreditWallet>('/billing/credit-wallet');
  },

  // Update wallet settings
  updateWallet: async (data: UpdateCreditWalletRequest): Promise<ApiResponse<CreditWallet>> => {
    return apiCall<CreditWallet>('/billing/credit-wallet', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get credit transactions
  getCreditTransactions: async (params?: {
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<CreditTransaction[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    return apiCall<CreditTransaction[]>(`/billing/credit-wallet/transactions?${queryParams}`);
  },

  // Purchase credits
  purchaseCredits: async (amount: number, paymentMethodId?: string): Promise<ApiResponse<Transaction>> => {
    return apiCall<Transaction>('/billing/credit-wallet/purchase', {
      method: 'POST',
      body: JSON.stringify({ amount, payment_method_id: paymentMethodId }),
    });
  },

  // Manual credit adjustment (admin only)
  adjustCredits: async (amount: number, reason: string): Promise<ApiResponse<CreditTransaction>> => {
    return apiCall<CreditTransaction>('/billing/credit-wallet/adjust', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  },
};

// Payment Methods API
export const paymentMethodApi = {
  // Get all payment methods
  getPaymentMethods: async (): Promise<ApiResponse<PaymentMethod[]>> => {
    return apiCall<PaymentMethod[]>('/billing/payment-methods');
  },

  // Add new payment method
  addPaymentMethod: async (data: AddPaymentMethodRequest): Promise<ApiResponse<PaymentMethod>> => {
    return apiCall<PaymentMethod>('/billing/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Set default payment method
  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<ApiResponse<PaymentMethod>> => {
    return apiCall<PaymentMethod>(`/billing/payment-methods/${paymentMethodId}/set-default`, {
      method: 'POST',
    });
  },

  // Delete payment method
  deletePaymentMethod: async (paymentMethodId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/billing/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
    });
  },

  // Verify payment method
  verifyPaymentMethod: async (paymentMethodId: string): Promise<ApiResponse<PaymentMethod>> => {
    return apiCall<PaymentMethod>(`/billing/payment-methods/${paymentMethodId}/verify`, {
      method: 'POST',
    });
  },
};

// Analytics API
export const analyticsApi = {
  // Get billing analytics
  getBillingAnalytics: async (timeRange?: string): Promise<ApiResponse<BillingAnalytics>> => {
    const params = timeRange ? `?time_range=${timeRange}` : '';
    return apiCall<BillingAnalytics>(`/billing/analytics${params}`);
  },

  // Export analytics report
  exportReport: async (timeRange?: string, format: 'csv' | 'pdf' = 'csv'): Promise<ApiResponse<Blob>> => {
    const params = new URLSearchParams();
    if (timeRange) params.append('time_range', timeRange);
    params.append('format', format);
    return apiCall<Blob>(`/billing/analytics/export?${params}`);
  },

  // Get revenue trends
  getRevenueTrends: async (timeRange?: string): Promise<ApiResponse<any>> => {
    const params = timeRange ? `?time_range=${timeRange}` : '';
    return apiCall<any>(`/billing/analytics/revenue-trends${params}`);
  },
};

// Checkout and Payment Processing API
export const checkoutApi = {
  // Create checkout session
  createCheckoutSession: async (data: {
    items: Array<{
      type: string;
      description: string;
      amount: number;
      quantity: number;
      metadata?: Record<string, any>;
    }>;
    currency: string;
    payment_method_id?: string;
    credits_to_use?: number;
    billing_details?: Record<string, any>;
  }): Promise<ApiResponse<{
    session_id: string;
    client_secret?: string;
    redirect_url?: string;
  }>> => {
    return apiCall('/billing/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Verify payment
  verifyPayment: async (sessionId: string, paymentId?: string): Promise<ApiResponse<Transaction>> => {
    return apiCall<Transaction>('/billing/checkout/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, payment_id: paymentId }),
    });
  },

  // Handle webhook (for internal use)
  handleWebhook: async (webhookData: any): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>('/billing/webhooks/payment', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  },
};

// Refund API
export const refundApi = {
  // Request refund
  requestRefund: async (transactionId: string, amount?: number, reason?: string): Promise<ApiResponse<any>> => {
    return apiCall('/billing/refunds', {
      method: 'POST',
      body: JSON.stringify({
        transaction_id: transactionId,
        amount,
        reason,
      }),
    });
  },

  // Get refund status
  getRefundStatus: async (refundId: string): Promise<ApiResponse<any>> => {
    return apiCall(`/billing/refunds/${refundId}`);
  },

  // Get all refunds
  getRefunds: async (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    return apiCall<any[]>(`/billing/refunds?${queryParams}`);
  },
};

// Export all APIs
export const billingApi = {
  transactions: transactionApi,
  invoices: invoiceApi,
  creditWallet: creditWalletApi,
  paymentMethods: paymentMethodApi,
  analytics: analyticsApi,
  checkout: checkoutApi,
  refunds: refundApi,
};

export default billingApi;
