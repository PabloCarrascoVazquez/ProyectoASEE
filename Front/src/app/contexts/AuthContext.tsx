import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'user' | 'vendor' | 'admin' | null;

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
  // Añadimos un helper booleano para facilitar la lectura en los componentes
  isAdmin: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

const login = (email: string, password: string) => {
    // Definimos la lógica de "Súper Usuario"
    const isAdminUser = email === 'admin@admin.com' && password === 'admin';
    
    // Asignamos el rol basado en la validación anterior
    const assignedRole: UserRole = isAdminUser ? 'admin' : 'user';

    setUser({
      id: isAdminUser ? '0' : '1', // ID único para el admin si quieres
      name: isAdminUser ? 'Administrador del Sistema' : email.split('@')[0],
      email,
      role: assignedRole,
    });

    console.log(`Sesión iniciada como: ${assignedRole}`);
  };

  const loginWithOAuth = (provider: 'google' | 'github') => {
    setUser({
      id: '1',
      name: `User from ${provider}`,
      email: `user@${provider}.com`,
      role: 'user', // Por defecto los de OAuth suelen entrar como user
    });
  };

  const register = (name: string, email: string, address: string, role: UserRole) => {
    setUser({
      id: '1',
      name,
      email,
      address,
      role, // Aquí ya permites que el registro defina el rol
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

  // Valor calculado para saber si es admin rápidamente
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, loginWithOAuth, register, logout, switchRole, isAdmin }}>
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