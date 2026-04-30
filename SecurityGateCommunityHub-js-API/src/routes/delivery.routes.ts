import { Router } from 'express';
import {
  getMyDeliveries, getAllDeliveries, createDelivery,
  residentDeliveryAction, leaveParcelAtGate, clubDeliveries,
} from '../controllers/delivery.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Resident
router.get('/', authenticateJWT, authorizeRoles(UserRole.RESIDENT), getMyDeliveries);
router.patch('/:id/action', authenticateJWT, authorizeRoles(UserRole.RESIDENT), residentDeliveryAction);
router.patch('/:id/leave-at-gate', authenticateJWT, authorizeRoles(UserRole.RESIDENT, UserRole.SECURITY), leaveParcelAtGate);
router.post('/club', authenticateJWT, authorizeRoles(UserRole.RESIDENT), clubDeliveries);

// Guard / Admin
router.get('/all', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), getAllDeliveries);
router.post('/', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), createDelivery);

export default router;
