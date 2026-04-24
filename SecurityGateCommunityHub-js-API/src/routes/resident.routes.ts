import { Router } from 'express';
import { getProfile, updateProfile, getDashboardData } from '../controllers/resident.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.get(
  '/profile',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT),
  getProfile
);

router.put(
  '/profile',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT),
  updateProfile
);

router.get(
  '/dashboard',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT),
  getDashboardData
);

export default router;
