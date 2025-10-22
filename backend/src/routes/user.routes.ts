import { Router } from 'express';
import {   
    getProfile, 
    getAllUsers,
    searchUsersByName,
    editUser
    createUser,
    deleteUser 
} from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.get('/all-users', getAllUsers);
router.get('/search', searchUsersByName); // Ejemplo de ruta para buscar usuario por ID
router.put('/edit-user/:id', editUser);
router.post('/create', authenticateToken, createUser);
router.delete('/:id', authenticateToken, deleteUser);

export default router;