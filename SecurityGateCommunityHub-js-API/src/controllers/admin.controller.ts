import { Request, Response } from 'express';
import User, { UserRole } from '../models/user.model';

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
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found' });
    return res.json({ success: true, data: user, message: 'User role updated' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
