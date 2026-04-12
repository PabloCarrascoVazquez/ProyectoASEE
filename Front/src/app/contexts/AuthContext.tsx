import React, { createContext, useContext, useState, ReactNode } from 'react';
import { userService } from '../services/userService'; // Importa el servicio

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
  setUser: (user: User | null) => void; // AÑADIDO: Para que el Login pueda usarlo
  login: (email: string, password: string) => Promise<void>; // Cambiado a Promise
  loginWithOAuth: (provider: 'google' | 'github') => void;
  register: (name: string, email: string, password: string) => Promise<void>; // Ajustado a realidad
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // LOGIN REAL CON BACKEND
  const login = async (email: string, password: string) => {
    try {
      const response = await userService.login(email, password);
      // Actualizamos el estado con lo que viene de Flask
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as UserRole
      });
    } catch (error) {
      throw error; // Re-lanzamos para que el componente Login muestre el toast
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await userService.register(name, email, password);
      // Tras registrar, podrías loguearlo automáticamente o pedir que haga login
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    userService.logout(); // Limpia localStorage
    setUser(null);
  };

  const loginWithOAuth = (provider: 'google' | 'github') => {
    setUser({
      id: 'oauth-id',
      name: `User ${provider}`,
      email: `user@${provider}.com`,
      role: 'user',
    });
  };

  const switchRole = (role: UserRole) => {
    if (user) setUser({ ...user, role });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
        user, 
        setUser, // Ahora el Login no dará error
        login, 
        loginWithOAuth, 
        register, 
        logout, 
        switchRole, 
        isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};