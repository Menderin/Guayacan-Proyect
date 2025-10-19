import { Request, Response } from 'express';
import { User, Role } from '../models';
import { ApiResponse } from '../utils/response.utils';

export const getProfile = async (req: Request & { user?: { userId: number } }, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [{
        model: Role,
        as: 'role',
        attributes: ['role_name', 'description']
      }]
    });

    if (!user) {
      return ApiResponse.error(res, 'Usuario no encontrado', 404);
    }

    return ApiResponse.success(res, user, 'Perfil obtenido');
  } catch (error) {
    console.error('Error:', error);
    return ApiResponse.error(res, 'Error al obtener perfil', 500);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: {
        id_role: 2  // 👈 Filtra solo usuarios con role_id = 2
      },
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [{
        model: Role,
        as: 'role',
        attributes: ['role_name']
      }]
    }); 
    return ApiResponse.success(res, users, 'Usuarios obtenidos');
  } catch (error) {
    console.error('Error:', error);
    return ApiResponse.error(res, 'Error al obtener usuarios', 500);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [{
        model: Role,
        as: 'role',
        attributes: ['role_name', 'description']
      }]
    });
    if (!user) {
      return ApiResponse.error(res, 'Usuario no encontrado', 404);
    }
    return ApiResponse.success(res, user, 'Usuario obtenido');
  } catch (error) {
    console.error('Error:', error);
    return ApiResponse.error(res, 'Error al obtener usuario', 500);
  }
};