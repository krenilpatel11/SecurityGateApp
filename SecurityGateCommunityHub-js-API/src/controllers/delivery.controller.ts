import { Request, Response } from 'express';
import Delivery, { DeliveryStatus } from '../models/delivery.model';
import GateLog, { GateLogAction } from '../models/gateLog.model';

// GET /api/delivery — Resident: get their deliveries (all statuses)
export const getMyDeliveries = async (req: Request, res: Response) => {
  try {
    const residentId = (req.user as { id: string }).id;
    const { status } = req.query as { status?: string };
    const filter: Record<string, unknown> = { resident: residentId };
    if (status) filter.status = status;
    const deliveries = await Delivery.find(filter).sort({ requestedAt: -1 });
    return res.json({ success: true, data: deliveries, message: 'Deliveries fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// GET /api/delivery/all — Guard/Admin: get all deliveries
export const getAllDeliveries = async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    const deliveries = await Delivery.find(filter)
      .populate('resident', 'name unit phone email')
      .sort({ requestedAt: -1 });
    return res.json({ success: true, data: deliveries, message: 'All deliveries fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// POST /api/delivery — Guard: log a new incoming delivery
export const createDelivery = async (req: Request, res: Response) => {
  try {
    const { residentId, deliveryPerson, deliveryCompany, purpose, items, photoUrl } = req.body as {
      residentId: string; deliveryPerson: string; deliveryCompany?: string;
      purpose: string; items?: string; photoUrl?: string;
    };
    if (!residentId || !deliveryPerson || !purpose) {
      return res.status(400).json({ success: false, data: null, message: 'residentId, deliveryPerson, and purpose are required' });
    }
    const delivery = await Delivery.create({
      resident: residentId, deliveryPerson, deliveryCompany, purpose, items, photoUrl,
      status: DeliveryStatus.PENDING,
    });
    const populated = await delivery.populate('resident', 'name unit phone');
    return res.status(201).json({ success: true, data: populated, message: 'Delivery logged — awaiting resident approval' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// PATCH /api/delivery/:id/action — Resident: approve / reject
export const residentDeliveryAction = async (req: Request, res: Response) => {
  try {
    const { action } = req.body as { action: 'approve' | 'reject' };
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, data: null, message: 'action must be approve or reject' });
    }
    const update: Partial<{ status: DeliveryStatus; approvedAt: Date }> = {};
    if (action === 'approve') { update.status = DeliveryStatus.APPROVED; update.approvedAt = new Date(); }
    else { update.status = DeliveryStatus.REJECTED; }

    const delivery = await Delivery.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('resident', 'name unit');
    if (!delivery) return res.status(404).json({ success: false, data: null, message: 'Delivery not found' });

    // Log to GateLog
    const guardAction = action === 'approve' ? GateLogAction.DELIVERY_APPROVED : GateLogAction.DELIVERY_REJECTED;
    await GateLog.create({
      action: guardAction,
      performedBy: (req.user as { id: string }).id,
      description: `Delivery from ${delivery.deliveryPerson} — ${action}d`,
      metadata: { deliveryId: delivery._id },
    });

    return res.json({ success: true, data: delivery, message: `Delivery ${action}d` });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// PATCH /api/delivery/:id/leave-at-gate — Resident/Guard: leave parcel at gate
export const leaveParcelAtGate = async (req: Request, res: Response) => {
  try {
    const { reason, photoUrl } = req.body as { reason?: string; photoUrl?: string };
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { status: DeliveryStatus.LEFT_AT_GATE, leftAtGateReason: reason, photoUrl, completedAt: new Date() },
      { new: true }
    );
    if (!delivery) return res.status(404).json({ success: false, data: null, message: 'Delivery not found' });
    await GateLog.create({
      action: GateLogAction.DELIVERY_LEFT_AT_GATE,
      performedBy: (req.user as { id: string }).id,
      description: `Parcel left at gate — ${delivery.deliveryPerson}`,
      metadata: { deliveryId: delivery._id, reason },
    });
    return res.json({ success: true, data: delivery, message: 'Parcel left at gate' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// POST /api/delivery/club — Resident: club multiple deliveries under one request
export const clubDeliveries = async (req: Request, res: Response) => {
  try {
    const { deliveryIds } = req.body as { deliveryIds: string[] };
    if (!deliveryIds || deliveryIds.length < 2) {
      return res.status(400).json({ success: false, data: null, message: 'At least 2 delivery IDs required' });
    }
    // Each delivery gets the others as clubbedWith
    await Promise.all(
      deliveryIds.map(id =>
        Delivery.findByIdAndUpdate(id, {
          $addToSet: { clubbedWith: { $each: deliveryIds.filter(d => d !== id) } },
        })
      )
    );
    const clubbed = await Delivery.find({ _id: { $in: deliveryIds } }).populate('resident', 'name unit');
    return res.json({ success: true, data: clubbed, message: 'Deliveries clubbed' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
