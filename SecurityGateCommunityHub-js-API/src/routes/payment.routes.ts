import { Router } from 'express';
import { getPayments, recordPayment, markPaid } from '../controllers/payment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.get('/', authenticateJWT, getPayments);
router.post('/', authenticateJWT, authorizeRoles(UserRole.ADMIN), recordPayment);
router.patch('/:id/paid', authenticateJWT, authorizeRoles(UserRole.ADMIN), markPaid);

export default router;
