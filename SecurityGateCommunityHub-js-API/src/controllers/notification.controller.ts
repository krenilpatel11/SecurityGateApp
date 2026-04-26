import { Request, Response } from 'express';
import Notification from '../models/notification.model';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: string }).id;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    return res.json({ success: true, data: notifications, message: 'Notifications fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const markRead = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: string }).id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, data: null, message: 'Notification not found' });
    return res.json({ success: true, data: notification, message: 'Notification marked as read' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const markAllRead = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: string }).id;
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    return res.json({ success: true, data: null, message: 'All notifications marked as read' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
