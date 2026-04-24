import { Request, Response } from 'express';
import Delivery, { DeliveryStatus } from '../models/delivery.model';

// 1. Resident: Get Pending Deliveries
export const getPendingDeliveries = async (req: Request, res: Response) => {
  const deliveries = await Delivery.find({ resident: (req.user as any)._id, status: DeliveryStatus.PENDING });
  res.json(deliveries);
};

// 2. Resident: Approve/Reject Delivery
export const updateDeliveryStatus = async (req: Request, res: Response) => {
  const { deliveryId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  const update: any = {};

  if (action === 'approve') {
    update.status = DeliveryStatus.APPROVED;
    update.approvedAt = new Date();
  } else if (action === 'reject') {
    update.status = DeliveryStatus.REJECTED;
  }

  const delivery = await Delivery.findByIdAndUpdate(deliveryId, update, { new: true });
  res.json(delivery);
};

// 3. Resident: Get Delivery History
export const getDeliveryHistory = async (req: Request, res: Response) => {
  const deliveries = await Delivery.find({ resident: (req.user as any)._id, status: { $ne: DeliveryStatus.PENDING } }).sort({ requestedAt: -1 });
  res.json(deliveries);
};

// 4. Resident: Leave Parcel at Gate (photo upload is handled elsewhere)
export const leaveParcelAtGate = async (req: Request, res: Response) => {
  const { deliveryId } = req.params;
  const { reason, photoUrl } = req.body;
  const delivery = await Delivery.findByIdAndUpdate(
    deliveryId,
    {
      status: DeliveryStatus.LEFT_AT_GATE,
      leftAtGateReason: reason,
      photoUrl,
      completedAt: new Date()
    },
    { new: true }
  );
  res.json(delivery);
};

// 5. Resident: Club Multiple Deliveries
export const clubDeliveries = async (req: Request, res: Response) => {
  const { deliveryIds } = req.body; // [id1, id2, ...]
  // Add each ID as clubbedWith for the others
  await Delivery.updateMany(
    { _id: { $in: deliveryIds } },
    { $addToSet: { clubbedWith: { $each: deliveryIds.filter((id: string, _: number, arr: string[]) => arr.indexOf(id) !== -1) } } }
  );
  const clubbedDeliveries = await Delivery.find({ _id: { $in: deliveryIds } });
  res.json(clubbedDeliveries);
};
