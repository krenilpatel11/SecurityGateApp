import { Router } from 'express';
import {
  registerStaff, getStaff, updateStaffStatus,
  staffCheckIn, staffCheckOut, getAttendanceLogs,
} from '../controllers/staff.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles(UserRole.RESIDENT), registerStaff);
router.get('/', authenticateJWT, authorizeRoles(UserRole.RESIDENT, UserRole.SECURITY, UserRole.ADMIN), getStaff);
router.patch('/:id/status', authenticateJWT, authorizeRoles(UserRole.ADMIN), updateStaffStatus);
router.post('/:id/checkin', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.RESIDENT), staffCheckIn);
router.patch('/:id/checkout', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.RESIDENT), staffCheckOut);
router.get('/:id/attendance', authenticateJWT, authorizeRoles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SECURITY), getAttendanceLogs);

export default router;
