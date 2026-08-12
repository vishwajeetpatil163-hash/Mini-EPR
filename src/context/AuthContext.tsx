import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  switchRoleDemo: (role: Role) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
  updateSession: (updatedUser: User, newToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('wholesale_erp_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user);
      } catch (err) {
        console.warn('Stored token invalid or expired:', err);
        localStorage.removeItem('wholesale_erp_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    localStorage.setItem('wholesale_erp_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const switchRoleDemo = async (role: Role) => {
    const roleCredentials: Record<Role, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@wholesale.com', pass: 'admin123' },
      SALES: { email: 'sales@wholesale.com', pass: 'sales123' },
      WAREHOUSE: { email: 'warehouse@wholesale.com', pass: 'warehouse123' },
      ACCOUNTS: { email: 'accounts@wholesale.com', pass: 'accounts123' },
    };

    const creds = roleCredentials[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  const logout = () => {
    localStorage.removeItem('wholesale_erp_token');
    setToken(null);
    setUser(null);
  };

  const updateSession = (updatedUser: User, newToken: string) => {
    localStorage.setItem('wholesale_erp_token', newToken);
    setToken(newToken);
    setUser(updatedUser);
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        switchRoleDemo,
        logout,
        hasRole,
        updateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
