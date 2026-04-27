import { Request, Response } from 'express';
import User from '../models/user.model';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: string }).id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found' });
    return res.json({ success: true, data: user, message: 'Profile fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
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
};
