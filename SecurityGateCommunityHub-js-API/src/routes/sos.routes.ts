import { Router } from 'express';
import { triggerSOS, getSOSAlerts, resolveSOS } from '../controllers/sos.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.get('/', authenticateJWT, getSOSAlerts);
router.post('/', authenticateJWT, authorizeRoles(UserRole.RESIDENT), triggerSOS);
router.patch('/:id/resolve', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), resolveSOS);

export default router;
