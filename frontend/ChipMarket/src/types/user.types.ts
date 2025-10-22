// src/types/user.types.ts

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  role: {
    role_name: string;
  };
}

export interface UserApiResponse {
  success: boolean;
  message: string;
  data: User[];
}

// ⬅️ Agregar la interfaz Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}