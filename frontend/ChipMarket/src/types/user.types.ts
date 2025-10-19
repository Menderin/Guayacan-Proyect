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