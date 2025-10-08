import { Request, Response } from 'express';
import { registerUser, loginUser, getUserById } from '../services/auth.service';
import { IAuthRequest } from '../types/auth.types';

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const result = await registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: result,
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al registrar usuario',
    });
  }
};

/**
 * POST /api/auth/login
 * Inicia sesión de un usuario
 */
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: result,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al iniciar sesión',
    });
  }
};

/**
 * GET /api/auth/me
 * Obtiene la información del usuario autenticado
 */
export const getMe = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    const user = await getUserById(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: { user },
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Usuario no encontrado',
    });
  }
};

/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario (del lado del cliente se debe eliminar el token)
 */
export const logout = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    // En JWT stateless, el logout se maneja en el cliente eliminando el token
    // Aquí podríamos agregar el token a una blacklist si fuera necesario
    
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
    });
  }
};