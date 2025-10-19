import { Router } from 'express';
import { getProfile } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { get } from 'http';

import { getAllUsers } from '../controllers/user.controller';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.get('/all-users', getAllUsers);

export default router;