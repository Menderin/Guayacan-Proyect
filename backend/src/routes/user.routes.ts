import { Router } from 'express';
import {   
    getProfile, 
    getAllUsers,
    searchUsersByName,
    createUser,
    deleteUser 
} from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.get('/all-users', getAllUsers);
router.get('/search', searchUsersByName);
router.post('/create', authenticateToken, createUser);
router.delete('/:id', authenticateToken, deleteUser);

export default router;