import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import billingApi, {
  Transaction,
  Invoice,
  CreditWallet,
  CreditTransaction,
  PaymentMethod,
  BillingAnalytics
} from '../services/billingApi';

// State interfaces
interface BillingState {
  // Loading states
  loading: {
    transactions: boolean;
    invoices: boolean;
    creditWallet: boolean;
    paymentMethods: boolean;
    analytics: boolean;
  };
  
  // Error states
  errors: {
    transactions?: string;
    invoices?: string;
    creditWallet?: string;
    paymentMethods?: string;
    analytics?: string;
  };
  
  // Data
  transactions: Transaction[];
  invoices: Invoice[];
  creditWallet: CreditWallet | null;
  creditTransactions: CreditTransaction[];
  paymentMethods: PaymentMethod[];
  analytics: BillingAnalytics | null;
  
  // Pagination and filters
  transactionFilters: {
    status?: string;
    type?: string;
    gateway?: string;
    searchQuery?: string;
    dateRange?: string;
  };
  
  invoiceFilters: {
    status?: string;
    searchQuery?: string;
    dateRange?: string;
  };
  
  // UI state
  selectedTransaction: Transaction | null;
  selectedInvoice: Invoice | null;
  showCheckoutModal: boolean;
  checkoutItems: any[];
}

// Action types
type BillingAction =
  // Loading actions
  | { type: 'SET_LOADING'; payload: { key: keyof BillingState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof BillingState['errors']; value: string | undefined } }
  
  // Data actions
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: Invoice }
  | { type: 'SET_CREDIT_WALLET'; payload: CreditWallet }
  | { type: 'SET_CREDIT_TRANSACTIONS'; payload: CreditTransaction[] }
  | { type: 'ADD_CREDIT_TRANSACTION'; payload: CreditTransaction }
  | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
  | { type: 'ADD_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'UPDATE_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'REMOVE_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_ANALYTICS'; payload: BillingAnalytics }
  
  // Filter actions
  | { type: 'SET_TRANSACTION_FILTERS'; payload: Partial<BillingState['transactionFilters']> }
  | { type: 'SET_INVOICE_FILTERS'; payload: Partial<BillingState['invoiceFilters']> }
  
  // UI actions
  | { type: 'SET_SELECTED_TRANSACTION'; payload: Transaction | null }
  | { type: 'SET_SELECTED_INVOICE'; payload: Invoice | null }
  | { type: 'SET_CHECKOUT_MODAL'; payload: boolean }
  | { type: 'SET_CHECKOUT_ITEMS'; payload: any[] }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: BillingState = {
  loading: {
    transactions: false,
    invoices: false,
    creditWallet: false,
    paymentMethods: false,
    analytics: false,
  },
  errors: {},
  transactions: [],
  invoices: [],
  creditWallet: null,
  creditTransactions: [],
  paymentMethods: [],
  analytics: null,
  transactionFilters: {},
  invoiceFilters: {},
  selectedTransaction: null,
  selectedInvoice: null,
  showCheckoutModal: false,
  checkoutItems: [],
};

// Reducer
function billingReducer(state: BillingState, action: BillingAction): BillingState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      };
    
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
        errors: { ...state.errors, transactions: undefined },
      };
    
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    
    case 'SET_INVOICES':
      return {
        ...state,
        invoices: action.payload,
        errors: { ...state.errors, invoices: undefined },
      };
    
    case 'ADD_INVOICE':
      return {
        ...state,
        invoices: [action.payload, ...state.invoices],
      };
    
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(i =>
          i.id === action.payload.id ? action.payload : i
        ),
      };
    
    case 'SET_CREDIT_WALLET':
      return {
        ...state,
        creditWallet: action.payload,
        errors: { ...state.errors, creditWallet: undefined },
      };
    
    case 'SET_CREDIT_TRANSACTIONS':
      return {
        ...state,
        creditTransactions: action.payload,
      };
    
    case 'ADD_CREDIT_TRANSACTION':
      return {
        ...state,
        creditTransactions: [action.payload, ...state.creditTransactions],
      };
    
    case 'SET_PAYMENT_METHODS':
      return {
        ...state,
        paymentMethods: action.payload,
        errors: { ...state.errors, paymentMethods: undefined },
      };
    
    case 'ADD_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: [...state.paymentMethods, action.payload],
      };
    
    case 'UPDATE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.map(pm =>
          pm.id === action.payload.id ? action.payload : pm
        ),
      };
    
    case 'REMOVE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.filter(pm => pm.id !== action.payload),
      };
    
    case 'SET_ANALYTICS':
      return {
        ...state,
        analytics: action.payload,
        errors: { ...state.errors, analytics: undefined },
      };
    
    case 'SET_TRANSACTION_FILTERS':
      return {
        ...state,
        transactionFilters: {
          ...state.transactionFilters,
          ...action.payload,
        },
      };
    
    case 'SET_INVOICE_FILTERS':
      return {
        ...state,
        invoiceFilters: {
          ...state.invoiceFilters,
          ...action.payload,
        },
      };
    
    case 'SET_SELECTED_TRANSACTION':
      return {
        ...state,
        selectedTransaction: action.payload,
      };
    
    case 'SET_SELECTED_INVOICE':
      return {
        ...state,
        selectedInvoice: action.payload,
      };
    
    case 'SET_CHECKOUT_MODAL':
      return {
        ...state,
        showCheckoutModal: action.payload,
      };
    
    case 'SET_CHECKOUT_ITEMS':
      return {
        ...state,
        checkoutItems: action.payload,
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
interface BillingContextType {
  state: BillingState;
  dispatch: React.Dispatch<BillingAction>;
  
  // Transaction actions
  fetchTransactions: (filters?: any) => Promise<void>;
  fetchTransaction: (id: string) => Promise<Transaction | null>;
  createTransaction: (data: any) => Promise<Transaction | null>;
  retryTransaction: (id: string) => Promise<Transaction | null>;
  downloadReceipt: (id: string) => Promise<void>;
  
  // Invoice actions
  fetchInvoices: (filters?: any) => Promise<void>;
  fetchInvoice: (id: string) => Promise<Invoice | null>;
  createInvoice: (data: any) => Promise<Invoice | null>;
  downloadInvoice: (id: string) => Promise<void>;
  sendInvoice: (id: string) => Promise<void>;
  markInvoiceAsPaid: (id: string) => Promise<void>;
  cancelInvoice: (id: string) => Promise<void>;
  
  // Credit wallet actions
  fetchCreditWallet: () => Promise<void>;
  updateCreditWallet: (data: any) => Promise<void>;
  fetchCreditTransactions: () => Promise<void>;
  purchaseCredits: (amount: number, paymentMethodId?: string) => Promise<void>;
  
  // Payment method actions
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (data: any) => Promise<PaymentMethod | null>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  
  // Analytics actions
  fetchAnalytics: (timeRange?: string) => Promise<void>;
  exportReport: (timeRange?: string, format?: 'csv' | 'pdf') => Promise<void>;
  
  // Checkout actions
  createCheckoutSession: (data: any) => Promise<any>;
  verifyPayment: (sessionId: string, paymentId?: string) => Promise<void>;
  
  // UI actions
  setTransactionFilters: (filters: Partial<BillingState['transactionFilters']>) => void;
  setInvoiceFilters: (filters: Partial<BillingState['invoiceFilters']>) => void;
  selectTransaction: (transaction: Transaction | null) => void;
  selectInvoice: (invoice: Invoice | null) => void;
  showCheckout: (items: any[]) => void;
  hideCheckout: () => void;
  
  // Utility functions
  refreshData: () => Promise<void>;
  resetState: () => void;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

// Provider component
interface BillingProviderProps {
  children: ReactNode;
}

export const BillingProvider: React.FC<BillingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(billingReducer, initialState);

  // Helper function for handling API calls
  const handleApiCall = async <T,>(
    apiCall: () => Promise<{ data?: T; error?: string }>,
    loadingKey: keyof BillingState['loading'],
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ): Promise<T | null> => {
    dispatch({ type: 'SET_LOADING', payload: { key: loadingKey, value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: loadingKey as keyof BillingState['errors'], value: undefined } });

    try {
      const result = await apiCall();
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.data) {
        onSuccess?.(result.data);
        return result.data;
      }
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'SET_ERROR', payload: { key: loadingKey as keyof BillingState['errors'], value: errorMessage } });
      onError?.(errorMessage);
      console.error(`API call failed (${loadingKey}):`, error);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: loadingKey, value: false } });
    }
  };

  // Transaction actions
  const fetchTransactions = async (filters?: any) => {
    const result = await handleApiCall(
      () => billingApi.transactions.getTransactions(filters),
      'transactions',
      (data) => dispatch({ type: 'SET_TRANSACTIONS', payload: data })
    );

    // Fallback to empty array if API fails
    if (!result) {
      dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
    }
  };

  const fetchTransaction = async (id: string) => {
    return await handleApiCall(
      () => billingApi.transactions.getTransaction(id),
      'transactions'
    );
  };

  const createTransaction = async (data: any) => {
    return await handleApiCall(
      () => billingApi.transactions.createTransaction(data),
      'transactions',
      (transaction) => dispatch({ type: 'ADD_TRANSACTION', payload: transaction })
    );
  };

  const retryTransaction = async (id: string) => {
    return await handleApiCall(
      () => billingApi.transactions.retryTransaction(id),
      'transactions',
      (transaction) => dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction })
    );
  };

  const downloadReceipt = async (id: string) => {
    await handleApiCall(
      () => billingApi.transactions.downloadReceipt(id),
      'transactions',
      (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    );
  };

  // Invoice actions
  const fetchInvoices = async (filters?: any) => {
    const result = await handleApiCall(
      () => billingApi.invoices.getInvoices(filters),
      'invoices',
      (data) => dispatch({ type: 'SET_INVOICES', payload: data })
    );

    // Fallback to empty array if API fails
    if (!result) {
      dispatch({ type: 'SET_INVOICES', payload: [] });
    }
  };

  const fetchInvoice = async (id: string) => {
    return await handleApiCall(
      () => billingApi.invoices.getInvoice(id),
      'invoices'
    );
  };

  const createInvoice = async (data: any) => {
    return await handleApiCall(
      () => billingApi.invoices.createInvoice(data),
      'invoices',
      (invoice) => dispatch({ type: 'ADD_INVOICE', payload: invoice })
    );
  };

  const downloadInvoice = async (id: string) => {
    await handleApiCall(
      () => billingApi.invoices.downloadInvoice(id),
      'invoices',
      (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    );
  };

  const sendInvoice = async (id: string) => {
    await handleApiCall(
      () => billingApi.invoices.sendInvoice(id),
      'invoices'
    );
  };

  const markInvoiceAsPaid = async (id: string) => {
    await handleApiCall(
      () => billingApi.invoices.markAsPaid(id),
      'invoices',
      (invoice) => dispatch({ type: 'UPDATE_INVOICE', payload: invoice })
    );
  };

  const cancelInvoice = async (id: string) => {
    await handleApiCall(
      () => billingApi.invoices.cancelInvoice(id),
      'invoices',
      (invoice) => dispatch({ type: 'UPDATE_INVOICE', payload: invoice })
    );
  };

  // Credit wallet actions
  const fetchCreditWallet = async () => {
    const result = await handleApiCall(
      () => billingApi.creditWallet.getWallet(),
      'creditWallet',
      (data) => dispatch({ type: 'SET_CREDIT_WALLET', payload: data })
    );

    // Fallback to default wallet if API fails
    if (!result) {
      dispatch({ type: 'SET_CREDIT_WALLET', payload: {
        id: 'fallback',
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        conversion_rate: 1.0,
        auto_recharge_enabled: false,
        auto_recharge_threshold: 50,
        auto_recharge_amount: 100
      }});
    }
  };

  const updateCreditWallet = async (data: any) => {
    await handleApiCall(
      () => billingApi.creditWallet.updateWallet(data),
      'creditWallet',
      (wallet) => dispatch({ type: 'SET_CREDIT_WALLET', payload: wallet })
    );
  };

  const fetchCreditTransactions = async () => {
    await handleApiCall(
      () => billingApi.creditWallet.getCreditTransactions(),
      'creditWallet',
      (data) => dispatch({ type: 'SET_CREDIT_TRANSACTIONS', payload: data })
    );
  };

  const purchaseCredits = async (amount: number, paymentMethodId?: string) => {
    await handleApiCall(
      () => billingApi.creditWallet.purchaseCredits(amount, paymentMethodId),
      'creditWallet',
      () => {
        // Refresh wallet and transactions after purchase
        fetchCreditWallet();
        fetchCreditTransactions();
      }
    );
  };

  // Payment method actions
  const fetchPaymentMethods = async () => {
    const result = await handleApiCall(
      () => billingApi.paymentMethods.getPaymentMethods(),
      'paymentMethods',
      (data) => dispatch({ type: 'SET_PAYMENT_METHODS', payload: data })
    );

    // Fallback to empty array if API fails
    if (!result) {
      dispatch({ type: 'SET_PAYMENT_METHODS', payload: [] });
    }
  };

  const addPaymentMethod = async (data: any) => {
    return await handleApiCall(
      () => billingApi.paymentMethods.addPaymentMethod(data),
      'paymentMethods',
      (paymentMethod) => dispatch({ type: 'ADD_PAYMENT_METHOD', payload: paymentMethod })
    );
  };

  const setDefaultPaymentMethod = async (id: string) => {
    await handleApiCall(
      () => billingApi.paymentMethods.setDefaultPaymentMethod(id),
      'paymentMethods',
      (paymentMethod) => {
        // Update all payment methods to reflect new default
        const updatedMethods = state.paymentMethods.map(pm => ({
          ...pm,
          is_default: pm.id === id
        }));
        dispatch({ type: 'SET_PAYMENT_METHODS', payload: updatedMethods });
      }
    );
  };

  const deletePaymentMethod = async (id: string) => {
    await handleApiCall(
      () => billingApi.paymentMethods.deletePaymentMethod(id),
      'paymentMethods',
      () => dispatch({ type: 'REMOVE_PAYMENT_METHOD', payload: id })
    );
  };

  // Analytics actions
  const fetchAnalytics = async (timeRange?: string) => {
    await handleApiCall(
      () => billingApi.analytics.getBillingAnalytics(timeRange),
      'analytics',
      (data) => dispatch({ type: 'SET_ANALYTICS', payload: data })
    );
  };

  const exportReport = async (timeRange?: string, format: 'csv' | 'pdf' = 'csv') => {
    await handleApiCall(
      () => billingApi.analytics.exportReport(timeRange, format),
      'analytics',
      (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `billing-report-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    );
  };

  // Checkout actions
  const createCheckoutSession = async (data: any) => {
    return await handleApiCall(
      () => billingApi.checkout.createCheckoutSession(data),
      'transactions'
    );
  };

  const verifyPayment = async (sessionId: string, paymentId?: string) => {
    await handleApiCall(
      () => billingApi.checkout.verifyPayment(sessionId, paymentId),
      'transactions',
      (transaction) => {
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
        // Refresh related data
        fetchCreditWallet();
        fetchInvoices();
      }
    );
  };

  // UI actions
  const setTransactionFilters = (filters: Partial<BillingState['transactionFilters']>) => {
    dispatch({ type: 'SET_TRANSACTION_FILTERS', payload: filters });
  };

  const setInvoiceFilters = (filters: Partial<BillingState['invoiceFilters']>) => {
    dispatch({ type: 'SET_INVOICE_FILTERS', payload: filters });
  };

  const selectTransaction = (transaction: Transaction | null) => {
    dispatch({ type: 'SET_SELECTED_TRANSACTION', payload: transaction });
  };

  const selectInvoice = (invoice: Invoice | null) => {
    dispatch({ type: 'SET_SELECTED_INVOICE', payload: invoice });
  };

  const showCheckout = (items: any[]) => {
    dispatch({ type: 'SET_CHECKOUT_ITEMS', payload: items });
    dispatch({ type: 'SET_CHECKOUT_MODAL', payload: true });
  };

  const hideCheckout = () => {
    dispatch({ type: 'SET_CHECKOUT_MODAL', payload: false });
    dispatch({ type: 'SET_CHECKOUT_ITEMS', payload: [] });
  };

  // Utility functions
  const refreshData = async () => {
    await Promise.all([
      fetchTransactions(),
      fetchInvoices(),
      fetchCreditWallet(),
      fetchPaymentMethods(),
      fetchAnalytics(),
    ]);
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  const contextValue: BillingContextType = {
    state,
    dispatch,
    fetchTransactions,
    fetchTransaction,
    createTransaction,
    retryTransaction,
    downloadReceipt,
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    downloadInvoice,
    sendInvoice,
    markInvoiceAsPaid,
    cancelInvoice,
    fetchCreditWallet,
    updateCreditWallet,
    fetchCreditTransactions,
    purchaseCredits,
    fetchPaymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    fetchAnalytics,
    exportReport,
    createCheckoutSession,
    verifyPayment,
    setTransactionFilters,
    setInvoiceFilters,
    selectTransaction,
    selectInvoice,
    showCheckout,
    hideCheckout,
    refreshData,
    resetState,
  };

  return (
    <BillingContext.Provider value={contextValue}>
      {children}
    </BillingContext.Provider>
  );
};

// Hook to use billing context
export const useBilling = (): BillingContextType => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};

export default BillingContext;
