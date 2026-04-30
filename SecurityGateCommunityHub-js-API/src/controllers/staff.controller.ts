import { Request, Response } from 'express';
import Staff, { StaffStatus } from '../models/staff.model';
import AttendanceLog from '../models/attendanceLog.model';
import GateLog, { GateLogAction } from '../models/gateLog.model';
import QRCode from 'qrcode';

// POST /api/staff — Resident registers a domestic helper / staff member
export const registerStaff = async (req: Request, res: Response) => {
  try {
    const { name, phone, type, photoUrl, idProofUrl, unit } = req.body as {
      name: string; phone: string; type: string; photoUrl?: string; idProofUrl?: string; unit: string;
    };
    if (!name || !phone || !type || !unit) {
      return res.status(400).json({ success: false, data: null, message: 'name, phone, type, and unit are required' });
    }
    const assignedTo = (req.user as { id: string }).id;

    // Generate vendor pass QR
    const staffMember = await Staff.create({ name, phone, type, photoUrl, idProofUrl, assignedTo, unit });
    const qrPayload = JSON.stringify({ staffId: staffMember._id, name, type, unit });
    const vendorPassUrl = await QRCode.toDataURL(qrPayload);
    staffMember.vendorPassUrl = vendorPassUrl;
    await staffMember.save();

    return res.status(201).json({ success: true, data: staffMember, message: 'Staff registered with vendor pass' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// GET /api/staff — Resident: get their staff; Admin/Security: get all
export const getStaff = async (req: Request, res: Response) => {
  try {
    const user = req.user as { id: string; role: string; activeRole?: string };
    const effectiveRole = user.activeRole ?? user.role;
    const filter = effectiveRole === 'resident' ? { assignedTo: user.id } : {};
    const staff = await Staff.find(filter).populate('assignedTo', 'name unit').sort({ name: 1 });
    return res.json({ success: true, data: staff, message: 'Staff fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// PATCH /api/staff/:id/status — Admin: activate/suspend staff
export const updateStaffStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: StaffStatus };
    if (!Object.values(StaffStatus).includes(status)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid status' });
    }
    const staff = await Staff.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!staff) return res.status(404).json({ success: false, data: null, message: 'Staff not found' });
    return res.json({ success: true, data: staff, message: 'Staff status updated' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// POST /api/staff/:id/checkin — Guard logs staff check-in
export const staffCheckIn = async (req: Request, res: Response) => {
  try {
    const { healthStatus, temperature, notes } = req.body as {
      healthStatus?: 'Healthy' | 'Sick' | 'Not Checked'; temperature?: number; notes?: string;
    };
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, data: null, message: 'Staff not found' });
    if (staff.status === StaffStatus.SUSPENDED) {
      return res.status(403).json({ success: false, data: null, message: 'Staff is suspended — entry denied' });
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    // Check if already checked in today
    const existing = await AttendanceLog.findOne({ staff: staff._id, date: today, checkIn: { $exists: true } });
    if (existing) return res.status(400).json({ success: false, data: null, message: 'Already checked in today' });

    const log = await AttendanceLog.create({
      staff: staff._id, unit: staff.unit, date: today,
      checkIn: new Date(), healthStatus: healthStatus ?? 'Not Checked',
      temperature, notes, loggedBy: (req.user as { id: string }).id,
    });

    await GateLog.create({
      action: GateLogAction.STAFF_CHECKIN,
      performedBy: (req.user as { id: string }).id,
      description: `Staff check-in: ${staff.name} (${staff.type}) — Unit ${staff.unit}`,
      metadata: { staffId: staff._id, healthStatus },
    });

    return res.status(201).json({ success: true, data: log, message: 'Staff checked in' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// PATCH /api/staff/:id/checkout — Guard logs staff check-out
export const staffCheckOut = async (req: Request, res: Response) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const log = await AttendanceLog.findOne({ staff: req.params.id, date: today, checkIn: { $exists: true }, checkOut: { $exists: false } });
    if (!log) return res.status(404).json({ success: false, data: null, message: 'No active check-in found for today' });

    const checkOut = new Date();
    const workedHours = parseFloat(((checkOut.getTime() - log.checkIn!.getTime()) / 3600000).toFixed(2));
    log.checkOut = checkOut;
    log.workedHours = workedHours;
    await log.save();

    const staff = await Staff.findById(req.params.id);
    await GateLog.create({
      action: GateLogAction.STAFF_CHECKOUT,
      performedBy: (req.user as { id: string }).id,
      description: `Staff check-out: ${staff?.name ?? 'Unknown'} — ${workedHours}h worked`,
      metadata: { staffId: req.params.id, workedHours },
    });

    return res.json({ success: true, data: log, message: `Staff checked out — ${workedHours}h worked` });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// GET /api/staff/:id/attendance — Get attendance logs for a staff member
export const getAttendanceLogs = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const filter: Record<string, unknown> = { staff: req.params.id };
    if (from || to) {
      filter.date = {};
      if (from) (filter.date as Record<string, Date>).$gte = new Date(from);
      if (to) (filter.date as Record<string, Date>).$lte = new Date(to);
    }
    const logs = await AttendanceLog.find(filter)
      .populate('staff', 'name type unit')
      .populate('loggedBy', 'name')
      .sort({ date: -1 });
    return res.json({ success: true, data: logs, message: 'Attendance logs fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
