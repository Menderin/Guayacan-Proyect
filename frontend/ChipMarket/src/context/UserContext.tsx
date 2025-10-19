// src/context/UserContext.tsx

import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';
import type { User, ApiResponse } from '../types/user.types';

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  hasLoaded: boolean; // Nuevo: saber si ya se cargaron los datos
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Cambiado a false
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false); // Nuevo

  const fetchUsers = useCallback(async () => {
    console.log('🔵 fetchUsers llamado');
    setLoading(true);
    setError(null);
    try {
      console.log('🔵 Haciendo fetch a /api/users/all-users');
      const response = await fetch('/api/users/all-users');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const result: ApiResponse = await response.json();
      console.log('🔵 Respuesta recibida:', result);
      
      // Verificamos que la respuesta sea exitosa
      if (!result.success) {
        throw new Error(result.message || 'Error al obtener usuarios');
      }
      
      console.log('🔵 Usuarios extraídos:', result.data);
      console.log('🔵 Cantidad de usuarios:', result.data.length);
      
      // Extraemos el array de usuarios del objeto 'data'
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

  // ❌ Eliminado el useEffect - NO carga automáticamente

  const value = { users, loading, error, fetchUsers, hasLoaded };

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