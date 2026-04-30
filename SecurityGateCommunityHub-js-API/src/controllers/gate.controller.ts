import { Request, Response } from 'express';
import GateLog, { GateLogAction } from '../models/gateLog.model';
import Visitor, { VisitorStatus } from '../models/visitor.model';
import Delivery, { DeliveryStatus } from '../models/delivery.model';

// GET /api/gate/logs — Security/Admin: paginated gate activity feed
export const getGateLogs = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', action, from, to } = req.query as {
      page?: string; limit?: string; action?: string; from?: string; to?: string;
    };
    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;
    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, Date>).$gte = new Date(from);
      if (to) (filter.createdAt as Record<string, Date>).$lte = new Date(to);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      GateLog.find(filter)
        .populate('performedBy', 'name role')
        .populate('relatedUser', 'name unit')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      GateLog.countDocuments(filter),
    ]);
    return res.json({
      success: true,
      data: { logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
      message: 'Gate logs fetched',
    });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// GET /api/gate/dashboard — Real-time dashboard stats
export const getGateDashboard = async (_req: Request, res: Response) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [
      visitorsToday, activeVisitors, pendingVisitors,
      pendingDeliveries, approvedDeliveries,
      recentLogs, actionBreakdown,
    ] = await Promise.all([
      Visitor.countDocuments({ createdAt: { $gte: today, $lte: todayEnd } }),
      Visitor.countDocuments({ status: VisitorStatus.ACTIVE }),
      Visitor.countDocuments({ status: { $in: [VisitorStatus.PENDING, VisitorStatus.OTP_SENT] } }),
      Delivery.countDocuments({ status: DeliveryStatus.PENDING }),
      Delivery.countDocuments({ status: DeliveryStatus.APPROVED, requestedAt: { $gte: today } }),
      GateLog.find({ createdAt: { $gte: today } })
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      GateLog.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
      ]),
    ]);

    // Peak hours — last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const hourlyActivity = await GateLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    return res.json({
      success: true,
      data: {
        today: { visitorsToday, activeVisitors, pendingVisitors, pendingDeliveries, approvedDeliveries },
        recentLogs,
        actionBreakdown: actionBreakdown.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
          acc[item._id] = item.count; return acc;
        }, {}),
        peakHours: hourlyActivity.map((h: { _id: number; count: number }) => ({ hour: h._id, count: h.count })),
      },
      message: 'Gate dashboard fetched',
    });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// POST /api/gate/log — Manually log a gate event (guard)
export const createGateLog = async (req: Request, res: Response) => {
  try {
    const { action, visitorName, unit, description, metadata } = req.body as {
      action: GateLogAction; visitorName?: string; unit?: string;
      description: string; metadata?: Record<string, unknown>;
    };
    if (!action || !description) {
      return res.status(400).json({ success: false, data: null, message: 'action and description are required' });
    }
    if (!Object.values(GateLogAction).includes(action)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid action' });
    }
    const log = await GateLog.create({
      action, visitorName, unit, description, metadata,
      performedBy: (req.user as { id: string }).id,
    });
    return res.status(201).json({ success: true, data: log, message: 'Gate event logged' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
