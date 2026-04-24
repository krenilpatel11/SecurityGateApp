import { Request, Response } from 'express';
import { IUser } from '../models/user.model';
import User from '../models/user.model';

export const getProfile = async (req: Request, res: Response) => {
  // Assuming user is attached to req and has _id property (common with MongoDB)
  if (!req.user || !(req.user as any).id) {
    return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
  }
  const userId = (req.user as any).id;
  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};
