import { Request, Response } from 'express';
import SOS, { SOSStatus } from '../models/sos.model';
import { UserRole } from '../models/user.model';

export const triggerSOS = async (req: Request, res: Response) => {
  try {
    const user = req.user as { id: string; unit?: string };
    const { message } = req.body as { message?: string };
    const sos = await SOS.create({
      raisedBy: user.id,
      unit: user.unit ?? 'Unknown',
      message: message ?? 'Emergency! Please help!',
    });
    const populated = await sos.populate('raisedBy', 'name unit phone');
    return res.status(201).json({ success: true, data: populated, message: 'SOS alert triggered' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const getSOSAlerts = async (req: Request, res: Response) => {
  try {
    const user = req.user as { id: string; role: string };
    const filter = user.role === UserRole.RESIDENT ? { raisedBy: user.id } : {};
    const alerts = await SOS.find(filter)
      .populate('raisedBy', 'name unit phone')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: alerts, message: 'SOS alerts fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const resolveSOS = async (req: Request, res: Response) => {
  try {
    const resolvedBy = (req.user as { id: string }).id;
    const sos = await SOS.findByIdAndUpdate(
      req.params.id,
      { status: SOSStatus.RESOLVED, resolvedBy },
      { new: true }
    ).populate('raisedBy', 'name unit phone').populate('resolvedBy', 'name');
    if (!sos) return res.status(404).json({ success: false, data: null, message: 'SOS alert not found' });
    return res.json({ success: true, data: sos, message: 'SOS alert resolved' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
