import { Request, Response } from 'express';
import Visitor, { VisitorCategory, VisitorStatus } from '../models/visitor.model';
import QRCode from 'qrcode';

// POST /api/visitor/invite — Resident invites a visitor
export const inviteVisitor = async (req: Request, res: Response) => {
  try {
    const { name, category, purpose, visitDate, visitTime, unit, entryPoint } = req.body as {
      name: string;
      category: VisitorCategory;
      purpose: string;
      visitDate: string;
      visitTime: string;
      unit?: string;
      entryPoint?: string;
    };
    if (!name || !purpose) {
      return res.status(400).json({ success: false, data: null, message: 'name and purpose are required' });
    }
    const invitedBy = (req.user as { id: string }).id;
    const visitorData = `${name}-${Date.now()}`;
    const qrCode = await QRCode.toDataURL(visitorData);
    const visitor = await Visitor.create({
      name,
      category: category ?? VisitorCategory.GUEST,
      purpose,
      invitedBy,
      unit,
      status: VisitorStatus.APPROVED,
      checkInTime: visitDate && visitTime ? new Date(`${visitDate}T${visitTime}`) : undefined,
      entryPoint,
      qrCode,
    });
    return res.status(201).json({ success: true, data: visitor, message: 'Visitor invited' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// GET /api/visitor/upcoming — Resident views upcoming pre-approved visitors
export const listUpcomingVisitors = async (req: Request, res: Response) => {
  try {
    const invitedBy = (req.user as { id: string }).id;
    const now = new Date();
    const visitors = await Visitor.find({
      invitedBy,
      checkInTime: { $gte: now },
      status: { $in: [VisitorStatus.APPROVED, VisitorStatus.PENDING] },
    }).sort({ checkInTime: 1 });
    return res.json({ success: true, data: visitors, message: 'Upcoming visitors fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// GET /api/visitor/history — Resident views past visitors
export const visitorHistory = async (req: Request, res: Response) => {
  try {
    const invitedBy = (req.user as { id: string }).id;
    const now = new Date();
    const visitors = await Visitor.find({
      invitedBy,
      checkInTime: { $lt: now },
    }).sort({ checkInTime: -1 });
    return res.json({ success: true, data: visitors, message: 'Visitor history fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// GET /api/visitor/my — Resident views all their invited visitors
export const listMyVisitors = async (req: Request, res: Response) => {
  try {
    const invitedBy = (req.user as { id: string }).id;
    const visitors = await Visitor.find({ invitedBy })
      .populate('invitedBy', 'name unit')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: visitors, message: 'My visitors fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// GET /api/visitor — Security/Admin views all visitors with optional filters
export const listAllVisitors = async (req: Request, res: Response) => {
  try {
    const { category, date, status } = req.query as { category?: string; date?: string; status?: string };
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      filter.checkInTime = { $gte: start, $lte: end };
    }
    const visitors = await Visitor.find(filter)
      .populate('invitedBy', 'name unit email')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: visitors, message: 'All visitors fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
