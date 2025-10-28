import { query } from '../../database/postgres/config';
import {
  IUser,
  IUserResponse,
  IRegisterRequest,
  ILoginRequest,
} from '../types/auth.types';
import {
  generateToken,
  isValidEmail,
  isStrongPassword,
} from '../utils/auth.utils';

/**
 * Registra un nuevo usuario
 */
export const registerUser = async (
  userData: IRegisterRequest
): Promise<{ user: IUserResponse; token: string }> => {
  const { name, email, password } = userData;

  // Validaciones
  if (!name || !email || !password) {
    throw new Error('Todos los campos son requeridos');
  }

  if (name.length < 3 || name.length > 100) {
    throw new Error('El nombre debe tener entre 3 y 100 caracteres');
  }

  if (!isValidEmail(email)) {
    throw new Error('El email no es válido');
  }

  if (!isStrongPassword(password)) {
    throw new Error(
      'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número'
    );
  }

  // Verificar si el usuario ya existe
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [
    email,
  ]);

  if (existingUser.rows.length > 0) {
    throw new Error('El email ya está registrado');
  }

  // Insertar usuario con hash de contraseña usando pgcrypto
  const result = await query(
    `INSERT INTO users (name, email, password, id_role) 
     VALUES ($1, $2, crypt($3, gen_salt('bf')), $4) 
     RETURNING id, name, email, id_role, created_at`,
    [name, email, password, 2] // 2 = usuario normal
  );

  const newUser: IUserResponse = result.rows[0];

  // Generar token
  const token = generateToken({
    userId: newUser.id,
    email: newUser.email,
    id_role: newUser.id_role
  });

  return { user: newUser, token };
};

/**
 * Inicia sesión de un usuario
 */
export const loginUser = async (
  credentials: ILoginRequest
): Promise<{ user: IUserResponse; token: string }> => {
  const { email, password } = credentials;

  // Validaciones
  if (!email || !password) {
    throw new Error('Email y contraseña son requeridos');
  }

  if (!isValidEmail(email)) {
    throw new Error('El email no es válido');
  }

  // Buscar usuario y verificar contraseña usando pgcrypto
  const result = await query(
    `SELECT id, name, email, id_role, created_at 
     FROM users 
     WHERE email = $1 AND password = crypt($2, password)`,
    [email, password]
  );

  if (result.rows.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const userResponse: IUserResponse = result.rows[0];

  // Generar token
  const token = generateToken({
    userId: userResponse.id,
    email: userResponse.email,
    id_role: userResponse.id_role,
  });

  return { user: userResponse, token };
};

/**
 * Obtiene un usuario por ID (sin contraseña)
 */
export const getUserById = async (userId: number): Promise<IUserResponse> => {
  const result = await query(
    'SELECT id, name, email, id_role, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  return result.rows[0];
};