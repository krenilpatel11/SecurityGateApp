import { Router, Request, Response } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';
import User from '../models/user.model';

const router = Router();

// GET /api/users/profile — all authenticated users
router.get(
  '/profile',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF),
  getProfile
);

// PUT /api/users/profile — update profile
router.put(
  '/profile',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF),
  updateProfile
);

// GET /api/users/me — current user profile (alias)
router.get(
  '/me',
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as { id: string }).id;
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found' });
      return res.json({ success: true, data: user, message: 'Profile fetched' });
    } catch {
      return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
    }
  }
);

// PATCH /api/users/me — update current user profile (alias)
router.patch(
  '/me',
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as { id: string }).id;
      const { name, phone, unit } = req.body as { name?: string; phone?: string; unit?: string };
      const user = await User.findByIdAndUpdate(
        userId,
        { name, phone, unit, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password');
      if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found' });
      return res.json({ success: true, data: user, message: 'Profile updated' });
    } catch {
      return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
    }
  }
);

export default router;
