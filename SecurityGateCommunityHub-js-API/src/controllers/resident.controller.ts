import { Request, Response } from 'express';
import User from '../models/user.model';
import Notification from '../models/notification.model';
import Event from '../models/event.model';
import Visitor, { VisitorStatus } from '../models/visitor.model';
import Payment, { PaymentStatus } from '../models/payment.model';

// GET /api/resident/profile
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

// PUT /api/resident/profile
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

// GET /api/resident/dashboard
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: string }).id;
    const now = new Date();

    // Real counts
    const [visitorPassCount, pendingPayment, upcomingEventsCount, notifications, events] = await Promise.all([
      Visitor.countDocuments({ invitedBy: userId, checkInTime: { $gte: now }, status: { $in: [VisitorStatus.APPROVED, VisitorStatus.PENDING] } }),
      Payment.findOne({ resident: userId, status: PaymentStatus.PENDING }).sort({ createdAt: -1 }),
      Event.countDocuments({ date: { $gte: now } }),
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Event.find({ date: { $gte: now } }).sort({ date: 1 }).limit(3).populate('createdBy', 'name').lean(),
    ]);

    return res.json({
      success: true,
      data: {
        quickActions: {
          visitorPasses: visitorPassCount,
          paymentStatus: pendingPayment ? 'Pending' : 'Paid',
          upcomingEvents: upcomingEventsCount,
        },
        notifications,
        events,
      },
      message: 'Dashboard data fetched',
    });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
