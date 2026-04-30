import { Router } from 'express';
import {
  getGateLogs,
  getGateDashboard,
  createGateLog,
  exportGateLogs,
  triggerLockdown,
  liftLockdown,
  getLockdownStatus,
} from '../controllers/gate.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.get('/dashboard', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), getGateDashboard);
router.get('/logs', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), getGateLogs);
router.post('/log', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), createGateLog);

// CSV export — admin only
router.get('/export', authenticateJWT, authorizeRoles(UserRole.ADMIN), exportGateLogs);

// Lockdown — security + admin
router.get('/lockdown', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), getLockdownStatus);
router.post('/lockdown', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), triggerLockdown);
router.delete('/lockdown', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), liftLockdown);

export default router;
