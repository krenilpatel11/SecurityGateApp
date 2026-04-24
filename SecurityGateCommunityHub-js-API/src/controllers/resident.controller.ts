import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model';
import Notification from '../models/notification.model';
import Event from '../models/event.model';
import Poll from '../models/poll.model';

// GET /api/resident/profile
export const getProfile = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;
  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// PUT /api/resident/profile
export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;
  const { name, phone, unit } = req.body;
  const user = await User.findByIdAndUpdate(
    userId,
    { name, phone, unit },
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// GET /api/resident/dashboard
export const getDashboardData = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;

  // Quick actions (example: count of visitor passes, payment status, etc.)
  // For demo, hardcoded. Replace with real queries as needed.
  const quickActions = {
    visitorPasses: 21,
    paymentStatus: 'Paid',
    upcomingEvents: 32
  };

  // Notifications (latest 5)
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5);

  // Upcoming events (next 2)
  const now = new Date();
  const events = await Event.find({ date: { $gte: now } })
    .sort({ date: 1 })
    .limit(2);

  // Active polls (next 2)
  const polls = await Poll.find({ endsAt: { $gte: now } })
    .sort({ endsAt: 1 })
    .limit(2);

  res.json({
    quickActions,
    notifications,
    events,
    polls
  });
};
