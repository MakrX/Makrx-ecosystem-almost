// ========================================
// AUTHENTICATION CONTEXT
// ========================================
// Provides authentication state and methods using Keycloak JS adapter

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, RolePermissions } from '@makrx/types';
import { getRolePermissions, hasPermission, UI_ACCESS } from '../config/rolePermissions';
import auth, { User as AuthUser } from '../lib/auth';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  roles: string[];
  assignedMakerspaces?: string[];
  membershipTier?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'expired';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  register: () => Promise<void>;
  getCurrentRole: () => UserRole;
  getRolePermissions: () => RolePermissions;
  hasPermission: (area: keyof RolePermissions, action: string, context?: any) => boolean;
  getUIAccess: () => typeof UI_ACCESS[UserRole];
  refreshUser: () => Promise<void>;
  // Role check helpers
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isMakerspaceAdmin: boolean;
  isServiceProvider: boolean;
  isUser: boolean;
  // For backward compatibility
  isMakrcaveManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const KNOWN_ROLES: UserRole[] = ['super_admin', 'admin', 'makerspace_admin', 'service_provider', 'user'];

function mapUser(authUser: AuthUser): User {
  const primaryRole = (authUser.roles.find(r => KNOWN_ROLES.includes(r as UserRole)) as UserRole) || 'user';
  return {
    id: authUser.sub,
    email: authUser.email,
    username: authUser.preferred_username,
    firstName: authUser.name,
    role: primaryRole,
    roles: authUser.roles,
    createdAt: new Date().toISOString(),
    isActive: true
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handle = (u: AuthUser | null) => setUser(u ? mapUser(u) : null);
    auth.addAuthListener(handle);

    const initialize = async () => {
      await auth.init();
      const current = auth.getCurrentUser();
      if (current) {
        setUser(mapUser(current));
      }
      setIsLoading(false);
    };
    initialize();

    return () => auth.removeAuthListener(handle);
  }, []);

  const login = async () => {
    auth.login();
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
  };

  const register = async () => {
    auth.register();
  };

  const refreshUser = async () => {
    const current = auth.getCurrentUser();
    setUser(current ? mapUser(current) : null);
  };

  const getCurrentRole = (): UserRole => {
    return user?.role || 'user';
  };

  const getUserRolePermissions = (): RolePermissions => {
    return user ? getRolePermissions(user.role) : getRolePermissions('user');
  };

  const userHasPermission = (area: keyof RolePermissions, action: string, context?: any): boolean => {
    return user ? hasPermission(user.role, area, action, context) : false;
  };

  const getUserUIAccess = () => {
    return user ? UI_ACCESS[user.role] : UI_ACCESS.user;
  };

  // Role check helpers
  const isSuperAdmin = user?.roles.includes('super_admin') || false;
  const isAdmin = user?.roles.includes('admin') || false;
  const isMakerspaceAdmin = user?.roles.includes('makerspace_admin') || false;
  const isServiceProvider = user?.roles.includes('service_provider') || false;
  const isUser = user?.roles.includes('user') || false;
  const isMakrcaveManager = isMakerspaceAdmin; // For backward compatibility
  const isAuthenticated = !!user && auth.isAuthenticated();

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      register,
      getCurrentRole,
      getRolePermissions: getUserRolePermissions,
      hasPermission: userHasPermission,
      getUIAccess: getUserUIAccess,
      refreshUser,
      isSuperAdmin,
      isAdmin,
      isMakerspaceAdmin,
      isServiceProvider,
      isUser,
      isMakrcaveManager
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

