import { Request, Response } from 'express';
import Payment, { PaymentStatus } from '../models/payment.model';
import { UserRole } from '../models/user.model';

export const getPayments = async (req: Request, res: Response) => {
  try {
    const user = req.user as { id: string; role: string; activeRole?: string };
    const effectiveRole = user.activeRole ?? user.role;
    const { status } = req.query as { status?: string };
    const filter: Record<string, unknown> =
      effectiveRole === UserRole.RESIDENT ? { resident: user.id } : {};
    if (status) filter.status = status;
    const payments = await Payment.find(filter)
      .populate('resident', 'name unit email')
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: payments, message: 'Payments fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { residentId, amount, description, month } = req.body as {
      residentId: string;
      amount: number;
      description: string;
      month: string;
    };
    if (!residentId || !amount || !description || !month) {
      return res.status(400).json({ success: false, data: null, message: 'residentId, amount, description, and month are required' });
    }
    const recordedBy = (req.user as { id: string }).id;
    const payment = await Payment.create({ resident: residentId, amount, description, month, recordedBy });
    const populated = await payment.populate('resident', 'name unit email');
    return res.status(201).json({ success: true, data: populated, message: 'Payment recorded' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const markPaid = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: PaymentStatus.PAID, paidAt: new Date() },
      { new: true }
    ).populate('resident', 'name unit email');
    if (!payment) return res.status(404).json({ success: false, data: null, message: 'Payment not found' });
    return res.json({ success: true, data: payment, message: 'Payment marked as paid' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
