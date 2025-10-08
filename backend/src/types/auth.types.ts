import { Request } from 'express';

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  id_role: number;
  created_at: Date;
}

export interface IUserResponse {
  id: number;
  name: string;
  email: string;
  id_role: number;
  created_at: Date;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: IUserResponse;
    token: string;
  };
}

export interface IJWTPayload {
  userId: number;
  email: string;
  role: number;
}

export interface IAuthRequest extends Request {
  user?: IJWTPayload;
}