import type { AuthTokens } from '@makrx/types';

// Auth utilities
export const auth = {
  setTokens: (tokens: AuthTokens) => {
    localStorage.setItem('makrx_access_token', tokens.accessToken);
    localStorage.setItem('makrx_refresh_token', tokens.refreshToken);
    localStorage.setItem('makrx_expires_in', tokens.expiresIn.toString());
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('makrx_access_token');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('makrx_refresh_token');
  },

  clearTokens: () => {
    localStorage.removeItem('makrx_access_token');
    localStorage.removeItem('makrx_refresh_token');
    localStorage.removeItem('makrx_expires_in');
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('makrx_access_token');
    const expiresIn = localStorage.getItem('makrx_expires_in');
    
    if (!token || !expiresIn) return false;
    
    const now = Date.now();
    const expiry = parseInt(expiresIn);
    
    return now < expiry;
  }
};

// Date utilities
export const dates = {
  formatDate: (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatDateTime: (date: string | Date): string => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  isToday: (date: string | Date): boolean => {
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
  }
};

// String utilities
export const strings = {
  slugify: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  truncate: (text: string, length: number): string => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  },

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
};

// API utilities
export const api = {
  getBaseUrl: (): string => {
    return process.env.NODE_ENV === 'production' 
      ? 'https://api.makrx.org' 
      : 'http://localhost:8000';
  },

  buildUrl: (endpoint: string, params?: Record<string, string>): string => {
    const baseUrl = api.getBaseUrl();
    const url = new URL(endpoint, baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }
};

// Price utilities
export const price = {
  format: (amount: number, currency = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency
    }).format(amount);
  },

  calculate: {
    tax: (amount: number, rate = 0.08): number => {
      return amount * rate;
    },
    
    total: (amount: number, taxRate = 0.08): number => {
      return amount + price.calculate.tax(amount, taxRate);
    }
  }
};
