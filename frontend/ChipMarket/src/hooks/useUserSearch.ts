// src/hooks/useUserSearch.ts

import { useState, useEffect, useCallback } from 'react'; // <-- Importa useCallback
import { useDebounce } from './useDebounce';
import type { User } from '../types/user.types';
import type { Pagination } from '../types/product.types';

// La URL base de tu API de usuarios
const API_URL = 'http://localhost:3000/api/users';

export const useUserSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true); // <-- Pon 'true' para la carga inicial
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

    // --- 1. Función para BUSCAR usuarios ---
    const searchUsers = useCallback(async (query: string, page: number) => {
        setLoading(true);
        setError(null);
        try {
            // Esta es la ruta de búsqueda que ya tenías
            const response = await fetch(
                `${API_URL}/search?name=${encodeURIComponent(query)}&page=${page}&limit=${pagination.limit}`
            );
            if (!response.ok) throw new Error('Error en la búsqueda');
            const data = await response.json();
            setUsers(data.data || []); 
            // setPagination(prev => ({ ...prev, ...data.pagination }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]); // Depende de pagination.limit

    // --- 2. Función para OBTENER TODOS los usuarios ---
    const fetchAllUsers = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            // Esta es la ruta para obtener todos los usuarios (de tu user.routes.ts)
            const response = await fetch(
                `${API_URL}/all-users?page=${page}&limit=${pagination.limit}`
            );
            if (!response.ok) throw new Error('Error al cargar los usuarios');
            const data = await response.json();
            
            // Asumo que 'all-users' también devuelve { data: [...] }
            // Si devuelve el array directamente, usa setUsers(data || []);
            setUsers(data.data || data || []); 
            // setPagination(prev => ({ ...prev, ...data.pagination }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]); // Depende de pagination.limit

    // --- 3. useEffect MODIFICADO ---
    useEffect(() => {
        if (debouncedSearch.length >= 2) {
            // Si el usuario está buscando
            searchUsers(debouncedSearch, pagination.page);
        } else if (debouncedSearch.length === 0) {
            // Si la búsqueda está vacía (carga inicial o se borró el texto)
            fetchAllUsers(pagination.page);
        } else {
            // Opcional: si la búsqueda es de 1 letra, limpiar
            setUsers([]);
            setLoading(false);
        }
        // Asegúrate de incluir las nuevas funciones como dependencias
    }, [debouncedSearch, pagination.page, searchUsers, fetchAllUsers]);

    // --- 4. Función de RECARGA (para el botón 'onReload') ---
    const refetchUsers = useCallback(() => {
        if (debouncedSearch.length >= 2) {
            searchUsers(debouncedSearch, pagination.page);
        } else {
            fetchAllUsers(pagination.page);
        }
    }, [debouncedSearch, pagination.page, searchUsers, fetchAllUsers]);


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
        setSortOrder,
        refetchUsers // <-- ¡Añade esto al retorno!
    };
};