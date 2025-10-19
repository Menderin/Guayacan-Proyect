import { useState, useEffect } from 'react'; // 👈 Removido 'use'
import { useDebounce } from './useDebounce';
import type { User } from '../types/user.types';
import type { Pagination } from '../types/product.types';

const API_URL = 'http://localhost:3000/api';

export const useUserSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [pagination, setPagination] = useState<Pagination>({ // 👈 Corregido tipo
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

    // 👇 Un solo useEffect
    useEffect(() => {
        if (debouncedSearch.length >= 2) {
            fetchUsers(debouncedSearch, pagination.page);
        } else {
            setUsers([]);
            setLoading(false);
        }
    }, [debouncedSearch, pagination.page]);

    const fetchUsers = async (query: string, page: number) => {
        setLoading(true);
        setError(null);
        
        try {
            // 👇 Ruta corregida usando query params
            const response = await fetch(
                `${API_URL}/users/search?name=${encodeURIComponent(query)}&page=${page}&limit=${pagination.limit}`
            );

            if (!response.ok) {
                throw new Error('Error en la búsqueda');
            }

            const data = await response.json();
            
            setUsers(data.data || []); // 👈 Ajusta según tu ApiResponse
            
            // Si tu backend devuelve paginación, actualízala aquí
            // setPagination(prev => ({ ...prev, ...data.pagination }));
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    return {
        searchQuery,
        setSearchQuery,
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
        setSortOrder
    };
};