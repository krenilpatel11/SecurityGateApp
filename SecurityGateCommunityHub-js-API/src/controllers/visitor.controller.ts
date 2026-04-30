import { Request, Response } from 'express';
import Visitor, { VisitorCategory, VisitorStatus } from '../models/visitor.model';
import GateLog, { GateLogAction } from '../models/gateLog.model';
import QRCode from 'qrcode';

// Helper: generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/visitor/invite — Resident pre-approves a visitor, generates OTP + QR gate pass
export const inviteVisitor = async (req: Request, res: Response) => {
  try {
    const { name, phone, category, purpose, visitDate, visitTime, unit, entryPoint, vehicleNumber } = req.body as {
      name: string; phone?: string; category: VisitorCategory; purpose: string;
      visitDate: string; visitTime: string; unit?: string; entryPoint?: string; vehicleNumber?: string;
    };
    if (!name || !purpose) {
      return res.status(400).json({ success: false, data: null, message: 'name and purpose are required' });
    }
    const invitedBy = (req.user as { id: string }).id;
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // QR encodes visitor ID + OTP for gate scanner
    const checkInTime = visitDate && visitTime ? new Date(`${visitDate}T${visitTime}`) : undefined;
    const visitor = await Visitor.create({
      name, phone, category: category ?? VisitorCategory.GUEST, purpose,
      invitedBy, unit, status: VisitorStatus.OTP_SENT,
      checkInTime, entryPoint, vehicleNumber, otp, otpExpiresAt,
    });

    // Generate QR with visitor ID + OTP embedded
    const qrPayload = JSON.stringify({ visitorId: visitor._id, otp, name, unit });
    const qrCode = await QRCode.toDataURL(qrPayload);
    visitor.qrCode = qrCode;
    await visitor.save();

    // In production: send OTP via SMS to visitor's phone
    // For now: return OTP in response (dev mode)
    return res.status(201).json({
      success: true,
      data: { ...visitor.toObject(), otpForDev: otp }, // remove otpForDev in production
      message: `Visitor invited. OTP ${otp} sent (dev mode).`,
    });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// POST /api/visitor/:id/verify-otp — Guard scans QR or resident approves via OTP
export const verifyVisitorOTP = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body as { otp: string };
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ success: false, data: null, message: 'Visitor not found' });
    if (visitor.otpVerified) return res.json({ success: true, data: visitor, message: 'Already verified' });
    if (!visitor.otp || visitor.otp !== otp) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid OTP' });
    }
    if (visitor.otpExpiresAt && visitor.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, data: null, message: 'OTP expired' });
    }
    visitor.otpVerified = true;
    visitor.status = VisitorStatus.APPROVED;
    await visitor.save();
    return res.json({ success: true, data: visitor, message: 'OTP verified — visitor approved' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// PATCH /api/visitor/:id/photo — Guard captures visitor photo at gate
export const captureVisitorPhoto = async (req: Request, res: Response) => {
  try {
    const { photoUrl } = req.body as { photoUrl: string };
    if (!photoUrl) return res.status(400).json({ success: false, data: null, message: 'photoUrl is required' });
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { photoUrl }, { new: true });
    if (!visitor) return res.status(404).json({ success: false, data: null, message: 'Visitor not found' });
    return res.json({ success: true, data: visitor, message: 'Photo captured' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// GET /api/visitor/gate-pass/:id — Shareable gate pass (public, no auth needed)
export const getGatePass = async (req: Request, res: Response) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate('invitedBy', 'name unit phone');
    if (!visitor) return res.status(404).json({ success: false, data: null, message: 'Gate pass not found' });
    // Return safe subset — no OTP
    const { otp: _otp, otpExpiresAt: _exp, ...safeVisitor } = visitor.toObject();
    return res.json({ success: true, data: safeVisitor, message: 'Gate pass fetched' });
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

// GET /api/visitor/upcoming — Resident views upcoming pre-approved visitors
export const listUpcomingVisitors = async (req: Request, res: Response) => {
  try {
    const invitedBy = (req.user as { id: string }).id;
    const now = new Date();
    const visitors = await Visitor.find({
      invitedBy, checkInTime: { $gte: now },
      status: { $in: [VisitorStatus.APPROVED, VisitorStatus.PENDING, VisitorStatus.OTP_SENT] },
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
    const visitors = await Visitor.find({ invitedBy, checkInTime: { $lt: now } }).sort({ checkInTime: -1 });
    return res.json({ success: true, data: visitors, message: 'Visitor history fetched' });
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

// PATCH /api/visitor/:id/status — Guard check-in / check-out / deny + logs to GateLog
export const updateVisitorStatus = async (req: Request, res: Response) => {
  try {
    const { status, photoUrl } = req.body as { status: VisitorStatus; photoUrl?: string };
    const validStatuses = Object.values(VisitorStatus);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, data: null, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    const update: Partial<IVisitorUpdate> = { status };
    if (photoUrl) update.photoUrl = photoUrl;
    if (status === VisitorStatus.ACTIVE) update.checkInTime = new Date();
    if (status === VisitorStatus.CHECKED_OUT || status === VisitorStatus.COMPLETED) update.checkOutTime = new Date();

    const visitor = await Visitor.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('invitedBy', 'name unit');
    if (!visitor) return res.status(404).json({ success: false, data: null, message: 'Visitor not found' });

    // Log to GateLog
    const guardId = (req.user as { id: string }).id;
    const actionMap: Partial<Record<VisitorStatus, GateLogAction>> = {
      [VisitorStatus.ACTIVE]: GateLogAction.VISITOR_CHECKIN,
      [VisitorStatus.CHECKED_OUT]: GateLogAction.VISITOR_CHECKOUT,
      [VisitorStatus.COMPLETED]: GateLogAction.VISITOR_CHECKOUT,
      [VisitorStatus.DENIED]: GateLogAction.VISITOR_DENIED,
    };
    const action = actionMap[status];
    if (action) {
      await GateLog.create({
        action,
        performedBy: guardId,
        visitorName: visitor.name,
        unit: visitor.unit,
        description: `${visitor.name} — ${status}`,
        metadata: { visitorId: visitor._id, category: visitor.category },
      });
    }

    return res.json({ success: true, data: visitor, message: 'Visitor status updated' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

interface IVisitorUpdate {
  status: VisitorStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  photoUrl?: string;
}

// POST /api/visitor/walkin — Guard logs a walk-in visitor
export const logWalkIn = async (req: Request, res: Response) => {
  try {
    const { name, phone, purpose, unit, category, vehicleNumber, photoUrl } = req.body as {
      name: string; phone?: string; purpose: string; unit?: string;
      category?: VisitorCategory; vehicleNumber?: string; photoUrl?: string;
    };
    if (!name || !purpose) {
      return res.status(400).json({ success: false, data: null, message: 'Name and purpose are required' });
    }
    const loggedBy = (req.user as { id: string }).id;
    const visitor = await Visitor.create({
      name, phone, purpose, unit, vehicleNumber, photoUrl,
      category: category ?? VisitorCategory.GUEST,
      invitedBy: loggedBy,
      status: VisitorStatus.ACTIVE,
      checkInTime: new Date(),
      otpVerified: true,
    });
    await GateLog.create({
      action: GateLogAction.VISITOR_CHECKIN,
      performedBy: loggedBy,
      visitorName: name,
      unit,
      description: `Walk-in: ${name} — ${purpose}`,
      metadata: { visitorId: visitor._id, category: visitor.category },
    });
    return res.status(201).json({ success: true, data: visitor, message: 'Walk-in visitor logged' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
