// src/hooks/useUsers.ts

import { useState, useCallback } from 'react';
import { authenticatedFetch } from '../utils/api.helper';
import type { User } from '../types/user.types';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  searchUsers: (query: string) => Promise<void>;
  getAllUsers: () => Promise<void>;
  getUserById: (id: number) => Promise<User | null>;
  reset: () => void;
}

/**
 * Hook para buscar y gestionar usuarios/clientes
 */
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:3000/api/users';

  /**
   * Buscar usuarios por nombre
   */
  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.trim() === '') {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `${API_URL}/search?name=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setUsers(data.data);
      } else {
        setUsers([]);
        setError(data.message || 'No se encontraron usuarios');
      }
    } catch (err) {
      setError('Error al buscar usuarios');
      setUsers([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener todos los usuarios
   */
  const getAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch(`${API_URL}/all-users`);
      const data = await response.json();

      if (data.success && data.data) {
        setUsers(data.data);
      } else {
        setUsers([]);
        setError(data.message || 'Error al obtener usuarios');
      }
    } catch (err) {
      setError('Error al obtener usuarios');
      setUsers([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener un usuario por ID
   */
  const getUserById = useCallback(async (id: number): Promise<User | null> => {
    if (!id || id <= 0) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Primero intentamos obtener todos los usuarios y buscar el específico
      const response = await authenticatedFetch(`${API_URL}/all-users`);
      const data = await response.json();

      if (data.success && data.data) {
        const user = data.data.find((u: User) => u.id === id);
        if (user) {
          return user;
        }
      }

      setError('Usuario no encontrado');
      return null;
    } catch (err) {
      setError('Error al obtener el usuario');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Resetear estado
   */
  const reset = () => {
    setUsers([]);
    setLoading(false);
    setError(null);
  };

  return {
    users,
    loading,
    error,
    searchUsers,
    getAllUsers,
    getUserById,
    reset
  };
};