import { Router } from 'express';
import {   
    getProfile, 
    getAllUsers,
    searchUsersByName,
    createUser
} from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { get } from 'http';

import {  } from '../controllers/user.controller';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.get('/all-users', getAllUsers);
router.get('/search', searchUsersByName); // Ejemplo de ruta para buscar usuario por ID
router.post('/create', authenticateToken, createUser);

export default router;