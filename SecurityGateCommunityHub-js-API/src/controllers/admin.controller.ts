import { Request, Response } from 'express';
import User, { UserRole } from '../models/user.model';
import { generateToken, generateRefreshToken } from '../utils/jwt';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role } = req.query as { role?: string };
    const filter: Record<string, string> = {};
    if (role) filter.role = role;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, data: users, message: 'Users fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body as { role: string };
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found' });
    return res.json({ success: true, data: user, message: 'User role updated' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// SUPERUSER only: switch active role to impersonate any role
// POST /api/admin/switch-role  { activeRole: 'resident' | 'security' | 'admin' | 'staff' | null }
export const switchActiveRole = async (req: Request, res: Response) => {
  try {
    const requestingUser = req.user as { id: string; role: string };

    if (requestingUser.role !== UserRole.SUPERUSER) {
      return res.status(403).json({ success: false, data: null, message: 'Only superusers can switch roles' });
    }

    const { activeRole } = req.body as { activeRole: string | null };

    // null means reset back to superuser view
    if (activeRole !== null && !Object.values(UserRole).includes(activeRole as UserRole)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      requestingUser.id,
      { activeRole: activeRole ?? undefined },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found' });

    // Issue new tokens with updated activeRole
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.json({
      success: true,
      data: { token, refreshToken, activeRole: user.activeRole ?? null },
      message: activeRole ? `Now acting as ${activeRole}` : 'Restored to superuser view',
    });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// GET /api/admin/stats — dashboard stats for superuser/admin
export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const [totalUsers, residents, security, staff, superusers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: UserRole.RESIDENT }),
      User.countDocuments({ role: UserRole.SECURITY }),
      User.countDocuments({ role: UserRole.STAFF }),
      User.countDocuments({ role: UserRole.SUPERUSER }),
    ]);
    return res.json({
      success: true,
      data: { totalUsers, residents, security, staff, superusers },
      message: 'Stats fetched',
    });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
