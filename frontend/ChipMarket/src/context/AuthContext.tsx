// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  id_role: number;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

interface AuthContextType {
  user: User | null;
  token: string;
  loading: boolean;
  message: Message | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
  setMessage: (message: Message | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000/api/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializar desde localStorage
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('token') || '';
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Efecto para persistir user y token en localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        setMessage({ type: 'success', text: data.message });
        setUser(data.data.user);
        setToken(data.data.token);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión. Verifica que el backend esté corriendo.' });
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        setMessage({ type: 'success', text: data.message });
        setUser(data.data.user);
        setToken(data.data.token);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión. Verifica que el backend esté corriendo.' });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setMessage({ type: 'success', text: 'Sesión cerrada exitosamente' });
  };

  const getProfile = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'No hay sesión activa' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Perfil obtenido correctamente' });
        setUser(data.data.user);
      } else {
        setMessage({ type: 'error', text: data.message });
        // Si el token es inválido, cerrar sesión
        if (response.status === 401) {
          logout();
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al obtener el perfil' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, message, login, register, logout, getProfile, setMessage }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}