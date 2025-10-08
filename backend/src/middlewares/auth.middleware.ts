import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types/auth.types';
import { verifyToken } from '../utils/auth.utils';

/**
 * Middleware para proteger rutas que requieren autenticación
 */
export const authenticateToken = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
      });
      return;
    }

    // Verificar el token
    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error instanceof Error ? error.message : 'Token inválido',
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param allowedRoles - Array de roles permitidos
 */
export const authorizeRoles = (...allowedRoles: number[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar si el usuario es admin (role 1)
 */
export const isAdmin = authorizeRoles(1);

/**
 * Middleware para verificar si el usuario es admin o el propietario del recurso
 */
export const isAdminOrOwner = (userIdParam: string = 'id') => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    const resourceUserId = parseInt(req.params[userIdParam]);

    // Si es admin o es el dueño del recurso
    if (req.user.role === 1 || req.user.userId === resourceUserId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso',
    });
  };
};