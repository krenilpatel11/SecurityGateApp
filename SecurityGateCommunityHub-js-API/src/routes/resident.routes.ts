import { Router } from 'express';
import { getProfile, updateProfile, getDashboardData } from '../controllers/resident.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.get(
  '/profile',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF),
  getProfile
);

router.put(
  '/profile',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF),
  updateProfile
);

router.get(
  '/dashboard',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF),
  getDashboardData
);

export default router;
