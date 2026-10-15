import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AuthSession } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, token: string, user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'om_sai_clinic_admin_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored) as AuthSession;
        if (session.token && session.user) {
          setToken(session.token);
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role as AdminUser['role'],
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse admin auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, newToken: string, newUser: AdminUser) => {
    setToken(newToken);
    setUser(newUser);
    const session: AuthSession = {
      token: newToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
