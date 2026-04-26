import { Router } from 'express';
import { getAllUsers, updateUserRole } from '../controllers/admin.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.get('/users', authenticateJWT, authorizeRoles(UserRole.ADMIN), getAllUsers);
router.patch('/users/:id/role', authenticateJWT, authorizeRoles(UserRole.ADMIN), updateUserRole);

export default router;
