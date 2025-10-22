// src/hooks/useUserSearch.ts

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import type { User, Pagination, UserApiResponse } from '../types/user.types';

const API_URL = 'http://localhost:3000/api/users';

interface UseUserSearchOptions {
    loadAllOnMount?: boolean; // Nueva opción
}

export const useUserSearch = (options: UseUserSearchOptions = {}) => {
    const { loadAllOnMount = false } = options;
    
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(loadAllOnMount); // Cargar si se solicita
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });

    const [sortBy, setSortBy] = useState('relevance');
    const [sortOrder, setSortOrder] = useState('desc');

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Función para BUSCAR usuarios
    const searchUsers = useCallback(async (query: string, page: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${API_URL}/search?name=${encodeURIComponent(query)}&page=${page}&limit=${pagination.limit}`
            );
            if (!response.ok) throw new Error('Error en la búsqueda');
            const data = await response.json();
            setUsers(data.data || []); 
            setPagination((prev: Pagination) => ({
                ...prev, 
                page: data.pagination?.page || page,
                total: data.pagination?.total || 0,
                totalPages: data.pagination?.totalPages || 0,
                hasNext: data.pagination?.hasNext || false,
                hasPrev: data.pagination?.hasPrev || false
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);

    // Función para OBTENER TODOS los usuarios
    const fetchAllUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/all-users`);
            if (!response.ok) throw new Error('Error al cargar los usuarios');
            const result: UserApiResponse = await response.json();
            
            if (result.success && result.data) {
                setUsers(result.data);
            } else {
                throw new Error(result.message || 'Error al cargar usuarios');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Efecto inicial: cargar todos los usuarios si se solicita
    useEffect(() => {
        if (loadAllOnMount) {
            fetchAllUsers();
        }
    }, [loadAllOnMount, fetchAllUsers]);

    // Efecto de búsqueda
    useEffect(() => {
        // Solo aplicar si NO estamos en modo "cargar todos"
        if (!loadAllOnMount) {
            if (debouncedSearch.length >= 2) {
                searchUsers(debouncedSearch, pagination.page);
            } else if (debouncedSearch.length === 0) {
                setUsers([]);
                setLoading(false);
                setError(null);
                setPagination((prev: Pagination) => ({
                    ...prev,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false
                }));
            } else {
                setUsers([]);
                setLoading(false);
            }
        }
    }, [debouncedSearch, pagination.page, searchUsers, loadAllOnMount]);

    // Función de RECARGA
    const refetchUsers = useCallback(() => {
        if (loadAllOnMount) {
            fetchAllUsers();
        } else if (debouncedSearch.length >= 2) {
            searchUsers(debouncedSearch, pagination.page);
        } else {
            fetchAllUsers();
        }
    }, [loadAllOnMount, debouncedSearch, pagination.page, searchUsers, fetchAllUsers]);

    return {
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        users,
        loading,
        error,
        viewMode,
        setViewMode,
        pagination,
        setPagination,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        refetchUsers
    };
};