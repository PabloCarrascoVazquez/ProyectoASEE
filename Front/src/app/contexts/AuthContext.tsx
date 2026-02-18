import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'user' | 'vendor' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  address?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  loginWithOAuth: (provider: 'google' | 'github') => void;
  register: (name: string, email: string, address: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    // Simulación de login
    setUser({
      id: '1',
      name: email.split('@')[0],
      email,
      role: 'user',
    });
  };

  const loginWithOAuth = (provider: 'google' | 'github') => {
    // Simulación de OAuth login
    setUser({
      id: '1',
      name: `User from ${provider}`,
      email: `user@${provider}.com`,
      role: 'user',
    });
  };

  const register = (name: string, email: string, address: string, role: UserRole) => {
    setUser({
      id: '1',
      name,
      email,
      address,
      role,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithOAuth, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
