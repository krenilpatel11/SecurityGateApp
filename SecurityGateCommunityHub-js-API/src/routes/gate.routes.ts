import { Router } from 'express';
import { getGateLogs, getGateDashboard, createGateLog } from '../controllers/gate.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.get('/dashboard', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), getGateDashboard);
router.get('/logs', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), getGateLogs);
router.post('/log', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), createGateLog);

export default router;
