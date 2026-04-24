import { Router, Request, Response } from 'express';
import { getPendingDeliveries, updateDeliveryStatus, getDeliveryHistory, leaveParcelAtGate, clubDeliveries } from '../controllers/delivery.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';
import Delivery, { DeliveryStatus } from '../models/delivery.model';
import User from '../models/user.model';

const router = Router();

// Resident: pending deliveries
router.get('/pending', authenticateJWT, authorizeRoles(UserRole.RESIDENT), getPendingDeliveries);

// Resident: approve/reject delivery
router.post('/:deliveryId/status', authenticateJWT, authorizeRoles(UserRole.RESIDENT), updateDeliveryStatus);

// Resident: delivery history
router.get('/history', authenticateJWT, authorizeRoles(UserRole.RESIDENT), getDeliveryHistory);

// Resident: leave parcel at gate
router.post('/:deliveryId/leave-at-gate', authenticateJWT, authorizeRoles(UserRole.RESIDENT), leaveParcelAtGate);

// Resident: club deliveries
router.post('/club', authenticateJWT, authorizeRoles(UserRole.RESIDENT), clubDeliveries);

// Resident: mark delivery as received
router.patch(
  '/:id/received',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT),
  async (req: Request, res: Response) => {
    try {
      const delivery = await Delivery.findOneAndUpdate(
        { _id: req.params.id, resident: (req.user as { id: string }).id },
        { status: DeliveryStatus.COMPLETED, completedAt: new Date() },
        { new: true }
      );
      if (!delivery) return res.status(404).json({ success: false, data: null, message: 'Delivery not found' });
      return res.json({ success: true, data: delivery, message: 'Delivery marked as received' });
    } catch {
      return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
    }
  }
);

// Guard/Admin: get all deliveries
router.get(
  '/',
  authenticateJWT,
  authorizeRoles(UserRole.SECURITY, UserRole.ADMIN),
  async (_req: Request, res: Response) => {
    try {
      const deliveries = await Delivery.find().sort({ requestedAt: -1 }).populate('resident', 'name unit email');
      return res.json({ success: true, data: deliveries, message: 'Deliveries fetched' });
    } catch {
      return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
    }
  }
);

// Guard: log new delivery arrival
router.post(
  '/',
  authenticateJWT,
  authorizeRoles(UserRole.SECURITY, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { recipientUnit, deliveryPerson, deliveryCompany, purpose, items } = req.body as {
        recipientUnit: string;
        deliveryPerson: string;
        deliveryCompany?: string;
        purpose: string;
        items?: string;
      };
      if (!recipientUnit || !deliveryPerson || !purpose) {
        return res.status(400).json({ success: false, data: null, message: 'recipientUnit, deliveryPerson, and purpose are required' });
      }
      // Find resident by unit
      const resident = await User.findOne({ unit: recipientUnit, role: UserRole.RESIDENT });
      if (!resident) {
        return res.status(404).json({ success: false, data: null, message: `No resident found for unit ${recipientUnit}` });
      }
      const delivery = await Delivery.create({
        resident: resident._id,
        deliveryPerson,
        deliveryCompany,
        purpose,
        items,
        status: DeliveryStatus.PENDING,
      });
      return res.status(201).json({ success: true, data: delivery, message: 'Delivery logged successfully' });
    } catch {
      return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
    }
  }
);

export default router;
