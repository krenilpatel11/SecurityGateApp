import { Router } from 'express';
import {
  inviteVisitor, verifyVisitorOTP, captureVisitorPhoto, getGatePass,
  listMyVisitors, listUpcomingVisitors, visitorHistory,
  listAllVisitors, updateVisitorStatus, logWalkIn,
} from '../controllers/visitor.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Resident routes
router.post('/invite', authenticateJWT, authorizeRoles(UserRole.RESIDENT), inviteVisitor);
router.get('/my', authenticateJWT, authorizeRoles(UserRole.RESIDENT), listMyVisitors);
router.get('/upcoming', authenticateJWT, authorizeRoles(UserRole.RESIDENT), listUpcomingVisitors);
router.get('/history', authenticateJWT, authorizeRoles(UserRole.RESIDENT), visitorHistory);

// Public gate pass (shareable link — no auth)
router.get('/gate-pass/:id', getGatePass);

// Guard / Admin routes
router.get('/', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), listAllVisitors);
router.post('/walkin', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), logWalkIn);
router.patch('/:id/status', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), updateVisitorStatus);
router.patch('/:id/photo', authenticateJWT, authorizeRoles(UserRole.SECURITY, UserRole.ADMIN), captureVisitorPhoto);

// OTP verification — both resident (approve from app) and guard (scan QR)
router.post('/:id/verify-otp', authenticateJWT, verifyVisitorOTP);

export default router;
