import { Request, Response } from 'express';
import { User, Role } from '../models';
import { ApiResponse } from '../utils/response.utils';
import { Op } from 'sequelize';

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

// 👇 Agregar esta función al final del archivo
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

    // Insertar usuario usando pgcrypto (igual que en auth.service)
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