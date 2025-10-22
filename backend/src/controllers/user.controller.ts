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
        id_role: 2
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
        name: { [Op.like]: `%${nameQuery}%` },
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
      attributes: ['id', 'name', 'email'],
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

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return ApiResponse.error(res, 'Nombre, email y contraseña son requeridos', 400);
    }

    if (name.length < 3 || name.length > 100) {
      return ApiResponse.error(res, 'El nombre debe tener entre 3 y 100 caracteres', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ApiResponse.error(res, 'Formato de email inválido', 400);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return ApiResponse.error(
        res,
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número',
        400
      );
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return ApiResponse.error(res, 'El email ya está registrado', 409);
    }

    // Importar sequelize dinámicamente para usar query raw
    const { sequelize } = require('../config/database');

    // Insertar usuario usando pgcrypto
    const result = await sequelize.query(
      `INSERT INTO users (name, email, password, id_role) 
       VALUES (:name, :email, crypt(:password, gen_salt('bf')), 2) 
       RETURNING id`,
      {
        replacements: { name, email, password },
        type: sequelize.QueryTypes.INSERT
      }
    );

    const newUserId = (result[0] as any[])[0].id;

    // Obtener el usuario creado con su rol
    const userWithRole = await User.findByPk(newUserId, {
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [{
        model: Role,
        as: 'role',
        attributes: ['role_name']
      }]
    });

    return ApiResponse.success(res, userWithRole, 'Usuario creado exitosamente', 201);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return ApiResponse.error(res, 'Error al crear usuario', 500);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return ApiResponse.error(res, 'ID de usuario inválido', 400);
    }

    // Verificar que el usuario existe
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'id_role']
    });

    if (!user) {
      return ApiResponse.error(res, 'Usuario no encontrado', 404);
    }

    // ⚠️ IMPORTANTE: No permitir eliminar administradores
    if (user.id_role === 1) {
      return ApiResponse.error(res, 'No se pueden eliminar usuarios administradores', 403);
    }

    // Eliminar el usuario
    await user.destroy();

    console.log(`✅ Usuario ${userId} eliminado exitosamente`);
    
    return ApiResponse.success(
      res, 
      { id: userId, name: user.name, email: user.email }, 
      'Usuario eliminado exitosamente',
      200
    );

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return ApiResponse.error(res, 'Error al eliminar usuario', 500);
  }
};