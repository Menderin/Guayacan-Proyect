// src/context/UserContext.tsx
import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';
import type { User, UserApiResponse } from '../types/user.types'; // 👈 Cambio aquí

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  hasLoaded: boolean;
  createUser: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  creatingUser: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

const API_URL = 'http://localhost:3000/api';

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [creatingUser, setCreatingUser] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    console.log('🔵 fetchUsers llamado');
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔵 Haciendo fetch a /api/users/all-users');
      const response = await fetch(`${API_URL}/users/all-users`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const result: UserApiResponse = await response.json(); // 👈 Cambio aquí
      console.log('🔵 Respuesta recibida:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Error al obtener usuarios');
      }
      
      console.log('🔵 Usuarios extraídos:', result.data);
      setUsers(result.data);
      setHasLoaded(true);
      console.log('✅ Usuarios guardados en el estado');
    } catch (err) {
      console.error('❌ Error en fetchUsers:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (name: string, email: string, password: string) => {
    console.log('🟢 createUser llamado con:', { name, email });
    setCreatingUser(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${API_URL}/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password })
      });

      const result: UserApiResponse = await response.json(); // 👈 Cambio aquí

      if (!result.success) {
        return { 
          success: false, 
          message: result.message || 'Error al crear usuario' 
        };
      }

      // 👇 result.data es User[] pero solo esperamos un usuario
      const newUser = Array.isArray(result.data) ? result.data[0] : result.data;
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      console.log('✅ Usuario creado exitosamente');
      return { 
        success: true, 
        message: result.message || 'Usuario creado exitosamente',
        user: newUser 
      };

    } catch (err) {
      console.error('❌ Error en createUser:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setCreatingUser(false);
    }
  }, []);

  const value = { 
    users, 
    loading, 
    error, 
    fetchUsers, 
    hasLoaded, 
    createUser,
    creatingUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers debe ser usado dentro de un UserProvider');
  }
  return context;
};