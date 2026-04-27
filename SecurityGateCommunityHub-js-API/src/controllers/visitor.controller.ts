import { Request, Response } from 'express';
import Visitor, { VisitorCategory, VisitorStatus } from '../models/visitor.model';
import QRCode from 'qrcode';

// Invite Visitor (Create + Generate QR)
export const inviteVisitor = async (req: Request, res: Response) => {
  const { name, category, purpose, visitDate, visitTime, unit, entryPoint } = req.body;
  const invitedBy = (req.user as any)._id;

  // Generate QR code data (could be visitor ID or a unique string)
  const visitorData = `${name}-${Date.now()}`;
  const qrCode = await QRCode.toDataURL(visitorData);

  const visitor = await Visitor.create({
    name,
    category,
    purpose,
    invitedBy,
    unit,
    status: VisitorStatus.APPROVED,
    checkInTime: new Date(`${visitDate}T${visitTime}`),
    entryPoint,
    qrCode
  });

  res.status(201).json(visitor);
};

// List Upcoming (Pre-Approved) Visitors
export const listUpcomingVisitors = async (req: Request, res: Response) => {
  const invitedBy = (req.user as any)._id;
  const now = new Date();
  const visitors = await Visitor.find({
    invitedBy,
    checkInTime: { $gte: now },
    status: { $in: [VisitorStatus.APPROVED, VisitorStatus.PENDING] }
  }).sort({ checkInTime: 1 });
  res.json(visitors);
};

// Visitor History (Past Visitors)
export const visitorHistory = async (req: Request, res: Response) => {
  const invitedBy = (req.user as any)._id;
  const now = new Date();
  const visitors = await Visitor.find({
    invitedBy,
    checkInTime: { $lt: now }
  }).sort({ checkInTime: -1 });
  res.json(visitors);
};

// List All Visitors (for security dashboard)
export const listAllVisitors = async (req: Request, res: Response) => {
  const { category, date } = req.query;
  const filter: any = {};
  if (category) filter.category = category;
  if (date) {
    const start = new Date(date as string);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    filter.checkInTime = { $gte: start, $lte: end };
  }
  const visitors = await Visitor.find(filter).sort({ checkInTime: -1 });
  res.json(visitors);
};
