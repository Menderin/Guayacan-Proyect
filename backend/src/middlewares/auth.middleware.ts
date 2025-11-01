// middlewares/auth.middleware.ts
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

    // Usar id_role del token
    const userRole = req.user.role || req.user.id_role;

    if (!allowedRoles.includes(userRole)) {
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
export const isAdmin = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
    });
    return;
  }

  // Verificar tanto 'role' como 'id_role'
  const userRole = req.user.role || req.user.id_role;

  if (userRole !== 1) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo para Administradores',
    });
    return;
  }

  next();
};

/**
 * Middleware para verificar si el usuario es cliente (role 2)
 */
export const isClient = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
    });
    return;
  }

  // Verificar tanto 'role' como 'id_role'
  const userRole = req.user.role || req.user.id_role;

  if (userRole !== 2) {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo para clientes',
    });
    return;
  }

  next();
};

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
    
    // Verificar tanto 'role' como 'id_role'
    const userRole = req.user.role || req.user.id_role;

    // Si es admin o es el dueño del recurso
    if (userRole === 1 || req.user.userId === resourceUserId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso',
    });
  };
};