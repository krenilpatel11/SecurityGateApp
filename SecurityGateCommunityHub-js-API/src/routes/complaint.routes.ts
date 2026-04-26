import { Router } from 'express';
import { createComplaint, getComplaints, updateComplaintStatus } from '../controllers/complaint.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.get('/', authenticateJWT, getComplaints);
router.post('/', authenticateJWT, createComplaint);
router.patch('/:id/status', authenticateJWT, authorizeRoles(UserRole.ADMIN, UserRole.SECURITY), updateComplaintStatus);

export default router;
