import { Router } from 'express';
import { getAllUsers, updateUserRole, switchActiveRole, getAdminStats } from '../controllers/admin.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Admin + Superuser can list/update users
router.get('/users', authenticateJWT, authorizeRoles(UserRole.ADMIN, UserRole.SUPERUSER), getAllUsers);
router.patch('/users/:id/role', authenticateJWT, authorizeRoles(UserRole.ADMIN, UserRole.SUPERUSER), updateUserRole);

// Dashboard stats
router.get('/stats', authenticateJWT, authorizeRoles(UserRole.ADMIN, UserRole.SUPERUSER), getAdminStats);

// Superuser role switching
router.post('/switch-role', authenticateJWT, authorizeRoles(UserRole.SUPERUSER), switchActiveRole);

export default router;
