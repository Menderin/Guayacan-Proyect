import { Request, Response } from 'express';
import { User, Role } from '../models';
import { ApiResponse } from '../utils/response.utils';
import { Op } from 'sequelize';
import pool from '../../database/postgres/config';

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


export const searchUsersByName = async (req: Request, res: Response) => {
  try {
    const nameQuery = req.query.name as string;
    
    if (!nameQuery) {
      return ApiResponse.error(res, 'Parámetro de búsqueda "name" es requerido', 400);
    }

    const users = await User.findAll({
      where: {
        name: { [Op.like]: `%${nameQuery}%` }, // 👈 Corregido
        id_role: 2
      }, 
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [{
        model: Role, 
        as: 'role',
        attributes: ['role_name']
      }]
    });

    return ApiResponse.success(res, users, 'Usuarios encontrados');
  } catch (error) {
    console.error('Error:', error);
    return ApiResponse.error(res, 'Error al buscar usuarios', 500);
  }
};



export const editUser = async (req: Request & { user?: { userId: number } }, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { name, password } = req.body;

    // Validar ID
    if (isNaN(userId)) {
      return ApiResponse.error(res, 'ID de usuario inválido', 400);
    }

    // Validar que al menos un campo esté presente
    if (!name && !password) {
      return ApiResponse.error(res, 'Debe proporcionar al menos un campo para actualizar (name o password)', 400);
    }

    // Buscar el usuario primero para verificar que existe
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    
    if (userCheck.rows.length === 0) {
      return ApiResponse.error(res, 'Usuario no encontrado', 404);
    }

    // Construir la consulta de actualización
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return ApiResponse.error(res, 'El nombre debe tener al menos 2 caracteres', 400);
      }
      if (trimmedName.length > 100) {
        return ApiResponse.error(res, 'El nombre no puede exceder 100 caracteres', 400);
      }
      updateFields.push(`name = $${paramIndex}`);
      values.push(trimmedName);
      paramIndex++;
    }
    
    if (password) {
      if (password.length < 6) {
        return ApiResponse.error(res, 'La contraseña debe tener al menos 6 caracteres', 400);
      }
      if (password.length > 50) {
        return ApiResponse.error(res, 'La contraseña es demasiado larga', 400);
      }
      // Usar pgcrypto para hashear el password
      updateFields.push(`password = crypt($${paramIndex}, gen_salt('bf', 10))`);
      values.push(password);
      paramIndex++;
    }

    // Agregar el userId al final
    values.push(userId);

    // Ejecutar actualización usando pgcrypto
    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // Obtener usuario actualizado usando Sequelize para mantener consistencia
    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [{
        model: Role,
        as: 'role',
        attributes: ['role_name', 'description']
      }]
    });

    return ApiResponse.success(res, updatedUser, 'Usuario actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    // Manejo de errores específicos
    if (error instanceof Error) {
      if (error.message.includes('crypt') || error.message.includes('gen_salt')) {
        return ApiResponse.error(res, 'Error al procesar la contraseña. Asegúrese de que pgcrypto esté habilitado', 500);
      }
    }
    
    return ApiResponse.error(res, 'Error al actualizar usuario', 500);
  }
};