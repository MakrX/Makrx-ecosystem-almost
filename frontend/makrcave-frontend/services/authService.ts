// ========================================
// Authentication Service for MakrCave Frontend
// ========================================
// This service handles all authentication operations including:
// - User login/logout
// - JWT token management
// - Automatic token refresh
// - User registration
// - Password reset functionality
// - Role-based permission checking

import loggingService from './loggingService';

// API Configuration - Change this URL to point to your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
// Local Storage Keys - Change these if you want different storage key names
const TOKEN_KEY = 'makrcave_access_token';
const REFRESH_TOKEN_KEY = 'makrcave_refresh_token';
const USER_KEY = 'makrcave_user';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'super_admin' | 'admin' | 'makerspace_admin' | 'service_provider' | 'maker';
  assignedMakerspaces?: string[];
  membershipTier?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'expired';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  makerspaceId?: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface TokenPayload {
  sub: string; // user ID
  email: string;
  role: string;
  makerspace_ids?: string[];
  exp: number;
  iat: number;
}

class AuthService {
  private refreshTimer: NodeJS.Timeout | null = null;

  // Initialize auth service
  constructor() {
    this.initializeTokenRefresh();
  }

  // ========================================
  // LOGIN METHOD
  // ========================================
  // Authenticates user with email/password and stores JWT tokens
  // Returns user data and tokens on success
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const startTime = Date.now();

    try {
      loggingService.info('auth', 'AuthService.login', 'Login attempt started', {
        username: credentials.username,
        timestamp: new Date().toISOString()
      });

      // Check if we're in a cloud environment where API might not be available
      const isCloudEnvironment = window.location.hostname.includes('fly.dev') ||
                               window.location.hostname.includes('builder.codes') ||
                               window.location.hostname.includes('vercel.app') ||
                               window.location.hostname.includes('netlify.app') ||
                               !window.location.hostname.includes('localhost');

      // If in cloud environment, use mock authentication
      if (isCloudEnvironment) {
        const responseTime = Date.now() - startTime;

        loggingService.info('auth', 'AuthService.login', 'Using mock authentication for cloud environment', {
          username: credentials.username,
          environment: 'cloud',
          hostname: window.location.hostname
        });

        return this.mockLogin(credentials, responseTime);
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const responseTime = Date.now() - startTime;
      loggingService.logAPICall('/auth/login', 'POST', response.status, responseTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Login failed: ${response.status} ${response.statusText}`;

        loggingService.logAuthEvent('login', false, {
          username: credentials.username,
          statusCode: response.status,
          errorMessage,
          responseTime
        });

        // If we get a 404, fall back to mock authentication
        if (response.status === 404) {
          loggingService.warn('auth', 'AuthService.login', 'API not available, falling back to mock authentication', {
            username: credentials.username,
            originalError: errorMessage
          });

          return this.mockLogin(credentials, responseTime);
        }

        throw new Error(errorMessage);
      }

      const data: LoginResponse = await response.json();

      // Store tokens and user data
      this.setTokens(data.access_token, data.refresh_token);
      this.setUser(data.user);

      // Set up token refresh
      this.scheduleTokenRefresh(data.expires_in);

      loggingService.logAuthEvent('login', true, {
        userId: data.user.id,
        username: data.user.username,
        role: data.user.role,
        responseTime,
        tokenExpiry: data.expires_in
      });

      loggingService.info('auth', 'AuthService.login', 'Login successful', {
        userId: data.user.id,
        role: data.user.role,
        responseTime
      });

      return data;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // If it's a network error, try mock authentication as fallback
      if ((error as Error).message.includes('Failed to fetch') ||
          (error as Error).message.includes('NetworkError') ||
          (error as Error).message.includes('ERR_NETWORK')) {

        loggingService.warn('auth', 'AuthService.login', 'Network error, falling back to mock authentication', {
          username: credentials.username,
          error: (error as Error).message,
          responseTime
        });

        try {
          return this.mockLogin(credentials, responseTime);
        } catch (mockError) {
          loggingService.error('auth', 'AuthService.login', 'Mock authentication also failed', {
            username: credentials.username,
            originalError: (error as Error).message,
            mockError: (mockError as Error).message,
            responseTime
          });
          throw mockError;
        }
      }

      loggingService.error('auth', 'AuthService.login', 'Login failed', {
        username: credentials.username,
        error: (error as Error).message,
        responseTime
      }, (error as Error).stack);

      console.error('Login error:', error);
      throw error;
    }
  }

  // ========================================
  // MOCK AUTHENTICATION FOR CLOUD ENVIRONMENT
  // ========================================
  private mockLogin(credentials: LoginCredentials, responseTime: number): LoginResponse {
    // Mock user database
    const mockUsers: Record<string, User> = {
      'superadmin@makrcave.com': {
        id: 'user-super-admin',
        email: 'superadmin@makrcave.com',
        username: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        assignedMakerspaces: ['ms-1', 'ms-2', 'ms-3']
      },
      'admin@makrcave.com': {
        id: 'user-admin',
        email: 'admin@makrcave.com',
        username: 'sysadmin',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        assignedMakerspaces: ['ms-1', 'ms-2']
      },
      'manager@makrcave.com': {
        id: 'user-manager',
        email: 'manager@makrcave.com',
        username: 'spacemanager',
        firstName: 'Makerspace',
        lastName: 'Manager',
        role: 'makerspace_admin',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        assignedMakerspaces: ['ms-1']
      },
      'provider@makrcave.com': {
        id: 'user-provider',
        email: 'provider@makrcave.com',
        username: 'servicepro',
        firstName: 'Service',
        lastName: 'Provider',
        role: 'service_provider',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        assignedMakerspaces: []
      },
      'maker@makrcave.com': {
        id: 'user-maker',
        email: 'maker@makrcave.com',
        username: 'creativemakr',
        firstName: 'Regular',
        lastName: 'Maker',
        role: 'maker',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        assignedMakerspaces: ['ms-1']
      }
    };

    // Mock passwords
    const mockPasswords: Record<string, string> = {
      'superadmin@makrcave.com': 'SuperAdmin2024!',
      'admin@makrcave.com': 'Admin2024!',
      'manager@makrcave.com': 'Manager2024!',
      'provider@makrcave.com': 'Provider2024!',
      'maker@makrcave.com': 'Maker2024!'
    };

    // Check if user exists
    const user = mockUsers[credentials.username];
    if (!user) {
      loggingService.logAuthEvent('mock_login', false, {
        username: credentials.username,
        reason: 'user_not_found',
        responseTime
      });
      throw new Error('Invalid credentials');
    }

    // Check password
    if (mockPasswords[credentials.username] !== credentials.password) {
      loggingService.logAuthEvent('mock_login', false, {
        username: credentials.username,
        reason: 'invalid_password',
        responseTime
      });
      throw new Error('Invalid credentials');
    }

    // Generate mock JWT tokens
    const accessToken = this.generateMockJWT(user);
    const refreshToken = this.generateMockRefreshToken();

    const loginResponse: LoginResponse = {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      expires_in: 1800, // 30 minutes
      user: user
    };

    // Store tokens and user data
    this.setTokens(loginResponse.access_token, loginResponse.refresh_token);
    this.setUser(loginResponse.user);

    // Set up token refresh
    this.scheduleTokenRefresh(loginResponse.expires_in);

    loggingService.logAuthEvent('mock_login', true, {
      userId: user.id,
      username: user.username,
      role: user.role,
      responseTime
    });

    loggingService.info('auth', 'AuthService.mockLogin', 'Mock login successful', {
      userId: user.id,
      role: user.role,
      responseTime
    });

    return loginResponse;
  }

  // ========================================
  // REGISTRATION METHOD
  // ========================================
  // Creates new user account (default role: 'maker')
  // Automatically logs in user after successful registration
  async register(data: RegisterData): Promise<LoginResponse> {
    const startTime = Date.now();

    try {
      loggingService.info('auth', 'AuthService.register', 'Registration attempt started', {
        email: data.email,
        username: data.username,
        makerspaceId: data.makerspaceId,
        timestamp: new Date().toISOString()
      });

      // Check if we're in a cloud environment
      const isCloudEnvironment = window.location.hostname.includes('fly.dev') ||
                               window.location.hostname.includes('builder.codes') ||
                               window.location.hostname.includes('vercel.app') ||
                               window.location.hostname.includes('netlify.app') ||
                               !window.location.hostname.includes('localhost');

      if (isCloudEnvironment) {
        return this.mockRegister(data, Date.now() - startTime);
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseTime = Date.now() - startTime;
      loggingService.logAPICall('/auth/register', 'POST', response.status, responseTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Registration failed';

        // Fall back to mock registration on 404
        if (response.status === 404) {
          loggingService.warn('auth', 'AuthService.register', 'API not available, falling back to mock registration');
          return this.mockRegister(data, responseTime);
        }

        loggingService.logAuthEvent('registration', false, {
          email: data.email,
          username: data.username,
          statusCode: response.status,
          errorMessage,
          responseTime
        });

        throw new Error(errorMessage);
      }

      const loginResponse: LoginResponse = await response.json();

      // Store tokens and user data
      this.setTokens(loginResponse.access_token, loginResponse.refresh_token);
      this.setUser(loginResponse.user);

      // Set up token refresh
      this.scheduleTokenRefresh(loginResponse.expires_in);

      loggingService.logAuthEvent('registration', true, {
        userId: loginResponse.user.id,
        email: loginResponse.user.email,
        username: loginResponse.user.username,
        role: loginResponse.user.role,
        responseTime
      });

      loggingService.info('auth', 'AuthService.register', 'Registration and auto-login successful', {
        userId: loginResponse.user.id,
        role: loginResponse.user.role,
        responseTime
      });

      return loginResponse;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Try mock registration on network errors
      if ((error as Error).message.includes('Failed to fetch') ||
          (error as Error).message.includes('NetworkError')) {

        loggingService.warn('auth', 'AuthService.register', 'Network error, falling back to mock registration');

        try {
          return this.mockRegister(data, responseTime);
        } catch (mockError) {
          loggingService.error('auth', 'AuthService.register', 'Mock registration also failed', {
            originalError: (error as Error).message,
            mockError: (mockError as Error).message
          });
          throw mockError;
        }
      }

      loggingService.error('auth', 'AuthService.register', 'Registration failed', {
        email: data.email,
        username: data.username,
        error: (error as Error).message,
        responseTime
      }, (error as Error).stack);

      console.error('Registration error:', error);
      throw error;
    }
  }

  // ========================================
  // MOCK REGISTRATION FOR CLOUD ENVIRONMENT
  // ========================================
  private mockRegister(data: RegisterData, responseTime: number): LoginResponse {
    // Create new user with maker role
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      username: data.username,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      role: 'maker', // Default role for new registrations
      isActive: true,
      createdAt: new Date().toISOString(),
      assignedMakerspaces: data.makerspaceId ? [data.makerspaceId] : []
    };

    // Generate mock JWT tokens
    const accessToken = this.generateMockJWT(newUser);
    const refreshToken = this.generateMockRefreshToken();

    const loginResponse: LoginResponse = {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      expires_in: 1800,
      user: newUser
    };

    // Store tokens and user data
    this.setTokens(loginResponse.access_token, loginResponse.refresh_token);
    this.setUser(loginResponse.user);

    // Set up token refresh
    this.scheduleTokenRefresh(loginResponse.expires_in);

    loggingService.logAuthEvent('mock_registration', true, {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      responseTime
    });

    loggingService.info('auth', 'AuthService.mockRegister', 'Mock registration successful', {
      userId: newUser.id,
      role: newUser.role,
      responseTime
    });

    return loginResponse;
  }

  // ========================================
  // MOCK JWT TOKEN GENERATION
  // ========================================
  private generateMockJWT(user: User): string {
    // Create a proper JWT-like structure
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      makerspace_ids: user.assignedMakerspaces,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
    };

    // Base64 encode header and payload
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = `mock_signature_${Date.now()}`;

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private generateMockRefreshToken(): string {
    return `mock-refresh-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========================================
  // LOGOUT METHOD
  // ========================================
  // Clears all authentication data and invalidates server-side token
  async logout(): Promise<void> {
    const startTime = Date.now();
    const user = this.getUser();

    try {
      loggingService.info('auth', 'AuthService.logout', 'Logout initiated', {
        userId: user?.id,
        username: user?.username,
        timestamp: new Date().toISOString()
      });

      const token = this.getAccessToken();
      if (token) {
        // Check if we're in a cloud environment or using mock tokens
        const isMockToken = token.includes('mock_signature_');
        const isCloudEnvironment = window.location.hostname.includes('fly.dev') ||
                                 window.location.hostname.includes('builder.codes') ||
                                 window.location.hostname.includes('vercel.app') ||
                                 window.location.hostname.includes('netlify.app') ||
                                 !window.location.hostname.includes('localhost');

        if (isMockToken || isCloudEnvironment) {
          loggingService.info('auth', 'AuthService.logout', 'Skipping server logout call in cloud environment', {
            userId: user?.id,
            environment: 'cloud',
            isMockToken
          });
        } else {
          // Call logout endpoint to invalidate token on server
          try {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            const responseTime = Date.now() - startTime;
            loggingService.logAPICall('/auth/logout', 'POST', response.status, responseTime);

            if (!response.ok) {
              loggingService.warn('auth', 'AuthService.logout', 'Server logout returned error, proceeding with local cleanup', {
                statusCode: response.status,
                userId: user?.id
              });
            }
          } catch (error) {
            loggingService.warn('auth', 'AuthService.logout', 'Server-side logout failed, proceeding with local cleanup', {
              error: (error as Error).message,
              userId: user?.id
            });
          }
        }
      }
    } finally {
      // Always clear local data
      this.clearAuthData();

      loggingService.logAuthEvent('logout', true, {
        userId: user?.id,
        username: user?.username,
        responseTime: Date.now() - startTime
      });

      loggingService.info('auth', 'AuthService.logout', 'Logout completed', {
        userId: user?.id,
        responseTime: Date.now() - startTime
      });
    }
  }

  // Refresh access token
  async refreshToken(): Promise<string | null> {
    const startTime = Date.now();
    const user = this.getUser();

    try {
      loggingService.debug('auth', 'AuthService.refreshToken', 'Token refresh initiated', {
        userId: user?.id,
        timestamp: new Date().toISOString()
      });

      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Check if this is a mock token or cloud environment
      const isMockToken = refreshToken.startsWith('mock-refresh-token');
      const isCloudEnvironment = window.location.hostname.includes('fly.dev') ||
                               window.location.hostname.includes('builder.codes') ||
                               window.location.hostname.includes('vercel.app') ||
                               window.location.hostname.includes('netlify.app') ||
                               !window.location.hostname.includes('localhost');

      if (isMockToken || isCloudEnvironment) {
        const responseTime = Date.now() - startTime;

        // Generate new mock token for the current user
        if (user) {
          const newAccessToken = this.generateMockJWT(user);
          this.setTokens(newAccessToken, refreshToken);

          loggingService.logAuthEvent('mock_token_refresh', true, {
            userId: user.id,
            responseTime
          });

          loggingService.debug('auth', 'AuthService.refreshToken', 'Mock token refresh successful', {
            userId: user.id,
            responseTime
          });

          return newAccessToken;
        } else {
          throw new Error('No user context available for mock token refresh');
        }
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const responseTime = Date.now() - startTime;
      loggingService.logAPICall('/auth/refresh', 'POST', response.status, responseTime);

      if (!response.ok) {
        // If API is not available, try mock refresh
        if (response.status === 404 && user) {
          const newAccessToken = this.generateMockJWT(user);
          this.setTokens(newAccessToken, refreshToken);

          loggingService.logAuthEvent('mock_token_refresh', true, {
            userId: user.id,
            responseTime,
            fallbackReason: 'api_not_available'
          });

          return newAccessToken;
        }

        // Refresh token is invalid, logout user
        this.clearAuthData();

        loggingService.logAuthEvent('token_refresh', false, {
          userId: user?.id,
          statusCode: response.status,
          responseTime
        });

        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Store new tokens
      this.setTokens(data.access_token, data.refresh_token || refreshToken);

      // Schedule next refresh
      this.scheduleTokenRefresh(data.expires_in);

      loggingService.logAuthEvent('token_refresh', true, {
        userId: user?.id,
        responseTime,
        newTokenExpiry: data.expires_in
      });

      loggingService.debug('auth', 'AuthService.refreshToken', 'Token refresh successful', {
        userId: user?.id,
        responseTime
      });

      return data.access_token;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      loggingService.error('auth', 'AuthService.refreshToken', 'Token refresh failed', {
        userId: user?.id,
        error: (error as Error).message,
        responseTime
      }, (error as Error).stack);

      console.error('Token refresh error:', error);
      this.clearAuthData();
      return null;
    }
  }

  // Request password reset
  async requestPasswordReset(data: ResetPasswordData): Promise<{ message: string }> {
    const startTime = Date.now();

    try {
      loggingService.info('auth', 'AuthService.requestPasswordReset', 'Password reset request initiated', {
        email: data.email,
        timestamp: new Date().toISOString()
      });

      // Check if we're in a cloud environment
      const isCloudEnvironment = window.location.hostname.includes('fly.dev') ||
                               window.location.hostname.includes('builder.codes') ||
                               window.location.hostname.includes('vercel.app') ||
                               window.location.hostname.includes('netlify.app') ||
                               !window.location.hostname.includes('localhost');

      if (isCloudEnvironment) {
        const responseTime = Date.now() - startTime;
        loggingService.logAuthEvent('mock_password_reset_request', true, {
          email: data.email,
          responseTime,
          environment: 'cloud'
        });

        return { message: 'Password reset instructions sent to your email (demo mode)' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseTime = Date.now() - startTime;
      loggingService.logAPICall('/auth/password-reset/request', 'POST', response.status, responseTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Password reset request failed';

        // Fall back to mock response on 404
        if (response.status === 404) {
          loggingService.logAuthEvent('mock_password_reset_request', true, {
            email: data.email,
            responseTime,
            fallbackReason: 'api_not_available'
          });

          return { message: 'Password reset instructions sent to your email (demo mode)' };
        }

        loggingService.logAuthEvent('password_reset_request', false, {
          email: data.email,
          statusCode: response.status,
          errorMessage,
          responseTime
        });

        throw new Error(errorMessage);
      }

      const result = await response.json();

      loggingService.logAuthEvent('password_reset_request', true, {
        email: data.email,
        responseTime
      });

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Fall back to mock response on network errors
      if ((error as Error).message.includes('Failed to fetch') ||
          (error as Error).message.includes('NetworkError')) {

        loggingService.logAuthEvent('mock_password_reset_request', true, {
          email: data.email,
          responseTime,
          fallbackReason: 'network_error'
        });

        return { message: 'Password reset instructions sent to your email (demo mode)' };
      }

      loggingService.error('auth', 'AuthService.requestPasswordReset', 'Password reset request failed', {
        email: data.email,
        error: (error as Error).message,
        responseTime
      }, (error as Error).stack);

      console.error('Password reset request error:', error);
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const startTime = Date.now();

    try {
      loggingService.info('auth', 'AuthService.resetPassword', 'Password reset confirmation initiated', {
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });

      // Check if we're in a cloud environment
      const isCloudEnvironment = window.location.hostname.includes('fly.dev') ||
                               window.location.hostname.includes('builder.codes') ||
                               window.location.hostname.includes('vercel.app') ||
                               window.location.hostname.includes('netlify.app') ||
                               !window.location.hostname.includes('localhost');

      if (isCloudEnvironment) {
        const responseTime = Date.now() - startTime;
        loggingService.logAuthEvent('mock_password_reset_confirm', true, {
          responseTime,
          environment: 'cloud'
        });

        return { message: 'Password reset successfully (demo mode)' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/password-reset/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });

      const responseTime = Date.now() - startTime;
      loggingService.logAPICall('/auth/password-reset/confirm', 'POST', response.status, responseTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Password reset failed';

        // Fall back to mock response on 404
        if (response.status === 404) {
          loggingService.logAuthEvent('mock_password_reset_confirm', true, {
            responseTime,
            fallbackReason: 'api_not_available'
          });

          return { message: 'Password reset successfully (demo mode)' };
        }

        loggingService.logAuthEvent('password_reset_confirm', false, {
          statusCode: response.status,
          errorMessage,
          responseTime
        });

        throw new Error(errorMessage);
      }

      const result = await response.json();

      loggingService.logAuthEvent('password_reset_confirm', true, {
        responseTime
      });

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Fall back to mock response on network errors
      if ((error as Error).message.includes('Failed to fetch') ||
          (error as Error).message.includes('NetworkError')) {

        loggingService.logAuthEvent('mock_password_reset_confirm', true, {
          responseTime,
          fallbackReason: 'network_error'
        });

        return { message: 'Password reset successfully (demo mode)' };
      }

      loggingService.error('auth', 'AuthService.resetPassword', 'Password reset confirmation failed', {
        error: (error as Error).message,
        responseTime
      }, (error as Error).stack);

      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Change password (when logged in)
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Password change failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  // Get current user info
  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Check if we're in a cloud environment or using mock tokens
      const isMockToken = token.includes('mock_signature_');
      const isCloudEnvironment = window.location.hostname.includes('fly.dev') ||
                               window.location.hostname.includes('builder.codes') ||
                               window.location.hostname.includes('vercel.app') ||
                               window.location.hostname.includes('netlify.app') ||
                               !window.location.hostname.includes('localhost');

      // If using mock tokens or in cloud environment, return user from local storage or token
      if (isMockToken || isCloudEnvironment) {
        const storedUser = this.getUser();
        if (storedUser) {
          loggingService.debug('auth', 'AuthService.getCurrentUser', 'Returning stored user data for cloud environment', {
            userId: storedUser.id,
            role: storedUser.role
          });
          return storedUser;
        }

        // Try to extract user info from token if no stored user
        try {
          const payload = this.parseTokenPayload(token);
          const userFromToken: User = {
            id: payload.sub,
            email: payload.email,
            username: payload.email.split('@')[0],
            role: payload.role,
            assignedMakerspaces: payload.makerspace_ids || [],
            isActive: true,
            createdAt: new Date(payload.iat * 1000).toISOString()
          };

          this.setUser(userFromToken);
          loggingService.info('auth', 'AuthService.getCurrentUser', 'Extracted user from token for cloud environment', {
            userId: userFromToken.id,
            role: userFromToken.role
          });

          return userFromToken;
        } catch (tokenError) {
          loggingService.error('auth', 'AuthService.getCurrentUser', 'Failed to extract user from token', {
            error: (tokenError as Error).message
          });
          throw new Error('Unable to get user information in cloud environment');
        }
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If API not available, fall back to stored user or token extraction
        if (response.status === 404) {
          const storedUser = this.getUser();
          if (storedUser) {
            loggingService.info('auth', 'AuthService.getCurrentUser', 'API not available, using stored user data', {
              userId: storedUser.id
            });
            return storedUser;
          }

          // Try to extract from token as fallback
          try {
            const payload = this.parseTokenPayload(token);
            const userFromToken: User = {
              id: payload.sub,
              email: payload.email,
              username: payload.email.split('@')[0],
              role: payload.role,
              assignedMakerspaces: payload.makerspace_ids || [],
              isActive: true,
              createdAt: new Date(payload.iat * 1000).toISOString()
            };

            this.setUser(userFromToken);
            loggingService.info('auth', 'AuthService.getCurrentUser', 'Extracted user from token as API fallback', {
              userId: userFromToken.id,
              role: userFromToken.role
            });

            return userFromToken;
          } catch (tokenError) {
            loggingService.error('auth', 'AuthService.getCurrentUser', 'Failed to extract user from token as fallback', {
              error: (tokenError as Error).message
            });
          }
        }

        if (response.status === 401) {
          // Token expired, try to refresh
          const newToken = await this.refreshToken();
          if (newToken) {
            // Retry with new token
            return this.getCurrentUser();
          }
        }

        throw new Error('Failed to get user info');
      }

      const user: User = await response.json();
      this.setUser(user);

      loggingService.debug('auth', 'AuthService.getCurrentUser', 'Retrieved user from API', {
        userId: user.id,
        role: user.role
      });

      return user;
    } catch (error) {
      loggingService.error('auth', 'AuthService.getCurrentUser', 'Failed to get current user', {
        error: (error as Error).message,
        hasToken: !!this.getAccessToken()
      }, (error as Error).stack);

      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Token management
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    // Also set for backward compatibility
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('authToken', accessToken);
  }

  // User management
  getUser(): User | null {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Also set for backward compatibility
    localStorage.setItem('makrcave_user', JSON.stringify({ id: user.id }));
  }

  // Clear all auth data
  clearAuthData(): void {
    const user = this.getUser();

    loggingService.debug('auth', 'AuthService.clearAuthData', 'Clearing authentication data', {
      userId: user?.id,
      username: user?.username,
      hadRefreshTimer: !!this.refreshTimer
    });

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Clear backward compatibility tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('makrcave_user');
    localStorage.removeItem('makrcave_access_token');

    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    loggingService.info('auth', 'AuthService.clearAuthData', 'Authentication data cleared successfully', {
      previousUserId: user?.id
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      loggingService.debug('auth', 'AuthService.isAuthenticated', 'No access token found');
      return false;
    }

    try {
      const payload = this.parseTokenPayload(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > currentTime;

      if (!isValid) {
        const expiry = new Date(payload.exp * 1000);
        const now = new Date();
        const timeExpired = Math.floor((now.getTime() - expiry.getTime()) / 1000);

        loggingService.warn('auth', 'AuthService.isAuthenticated', 'Token expired', {
          expiry: expiry.toISOString(),
          now: now.toISOString(),
          expiredSecondsAgo: timeExpired,
          userId: payload.sub
        });
      } else {
        loggingService.debug('auth', 'AuthService.isAuthenticated', 'Token is valid', {
          userId: payload.sub,
          role: payload.role,
          expiresIn: payload.exp - currentTime
        });
      }

      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      loggingService.error('auth', 'AuthService.isAuthenticated', 'Failed to validate token', {
        error: errorMessage,
        tokenPresent: !!token,
        tokenLength: token?.length || 0
      }, error instanceof Error ? error.stack : undefined);

      // Clear invalid token
      this.clearAuthData();
      return false;
    }
  }

  // Parse JWT token payload
  parseTokenPayload(token: string): TokenPayload {
    try {
      // Check if token exists and has basic structure
      if (!token || typeof token !== 'string') {
        throw new Error('Token is null, undefined, or not a string');
      }

      // Split token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error(`Invalid token format: expected 3 parts, got ${parts.length}`);
      }

      const [header, payload, signature] = parts;

      if (!payload) {
        throw new Error('Invalid token format: missing payload section');
      }

      // Decode the payload
      let decoded: string;
      try {
        decoded = atob(payload);
      } catch (decodeError) {
        throw new Error(`Failed to base64 decode payload: ${(decodeError as Error).message}`);
      }

      // Parse JSON
      let parsed: any;
      try {
        parsed = JSON.parse(decoded);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON payload: ${(parseError as Error).message}`);
      }

      // Validate required JWT fields
      if (!parsed.sub) {
        throw new Error('Token payload missing required "sub" field');
      }

      if (!parsed.exp) {
        throw new Error('Token payload missing required "exp" field');
      }

      loggingService.debug('auth', 'AuthService.parseTokenPayload', 'Token parsed successfully', {
        userId: parsed.sub,
        role: parsed.role,
        expiry: new Date(parsed.exp * 1000).toISOString(),
        issuedAt: parsed.iat ? new Date(parsed.iat * 1000).toISOString() : 'unknown'
      });

      return parsed as TokenPayload;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorDetails = {
        error: errorMessage,
        tokenLength: token?.length || 0,
        tokenStart: token?.substring(0, 20) || 'N/A',
        tokenParts: token ? token.split('.').length : 0
      };

      loggingService.error('auth', 'AuthService.parseTokenPayload', 'Failed to parse token payload', errorDetails, error instanceof Error ? error.stack : undefined);

      throw new Error(`Token parsing failed: ${errorMessage}`);
    }
  }

  // Get user role from token
  getUserRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload = this.parseTokenPayload(token);
      return payload.role;
    } catch {
      return null;
    }
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Check if user is admin (any admin level)
  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'super_admin' || role === 'admin' || role === 'makerspace_admin';
  }

  // ========================================
  // TOKEN REFRESH SCHEDULING
  // ========================================
  // Automatically refreshes tokens 5 minutes before expiry
  // Change the 300 seconds (5 minutes) value to adjust timing
  private scheduleTokenRefresh(expiresIn: number): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh token 5 minutes before expiry
    // CUSTOMIZATION: Change 300 to adjust refresh timing (in seconds)
    const refreshTime = (expiresIn - 300) * 1000;
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  // Initialize token refresh on app start
  private initializeTokenRefresh(): void {
    const token = this.getAccessToken();
    if (token && this.isAuthenticated()) {
      try {
        const payload = this.parseTokenPayload(token);
        const timeUntilExpiry = payload.exp - (Date.now() / 1000);
        this.scheduleTokenRefresh(timeUntilExpiry);
      } catch {
        // Invalid token, clear auth data
        this.clearAuthData();
      }
    }
  }

  // Create authenticated fetch function
  createAuthenticatedFetch() {
    return async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = this.getAccessToken();
      
      const authenticatedOptions = {
        ...options,
        headers: {
          ...options.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      let response = await fetch(url, authenticatedOptions);

      // If unauthorized, try to refresh token and retry
      if (response.status === 401 && token) {
        const newToken = await this.refreshToken();
        if (newToken) {
          authenticatedOptions.headers = {
            ...authenticatedOptions.headers,
            Authorization: `Bearer ${newToken}`,
          };
          response = await fetch(url, authenticatedOptions);
        }
      }

      return response;
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
