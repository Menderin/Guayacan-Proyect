// src/utils/api.helper.ts

/**
 * Helper para hacer fetch con autenticación automática
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  console.log('🔑 Token encontrado:', token ? 'Sí ✅' : 'No ❌');
  
  if (!token) {
    throw new Error('No hay sesión activa. Por favor inicia sesión.');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
  }

  return response;
};