import { Router, Request, Response } from 'express';
import { inviteVisitor, listUpcomingVisitors, visitorHistory, listAllVisitors, listMyVisitors } from '../controllers/visitor.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';
import Visitor, { VisitorStatus, VisitorCategory } from '../models/visitor.model';

const router = Router();

// Resident invites a visitor
router.post(
  '/invite',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT),
  inviteVisitor
);

// Resident views all their invited visitors
router.get(
  '/my',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT),
  listMyVisitors
);

// Resident views upcoming (pre-approved) visitors
router.get(
  '/upcoming',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT),
  listUpcomingVisitors
);

// Resident views visitor history
router.get(
  '/history',
  authenticateJWT,
  authorizeRoles(UserRole.RESIDENT),
  visitorHistory
);

// Security/Admin views all visitors (with filters)
router.get(
  '/',
  authenticateJWT,
  authorizeRoles(UserRole.SECURITY, UserRole.ADMIN),
  listAllVisitors
);

// Guard updates visitor status (check-in / check-out / deny)
router.patch(
  '/:id/status',
  authenticateJWT,
  authorizeRoles(UserRole.SECURITY, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body as { status: VisitorStatus };
      const validStatuses = Object.values(VisitorStatus);
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, data: null, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      const update: Partial<{ status: VisitorStatus; checkInTime: Date; checkOutTime: Date }> = { status };
      if (status === VisitorStatus.ACTIVE) update.checkInTime = new Date();
      if (status === VisitorStatus.CHECKED_OUT || status === VisitorStatus.COMPLETED) update.checkOutTime = new Date();

      const visitor = await Visitor.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!visitor) return res.status(404).json({ success: false, data: null, message: 'Visitor not found' });
      return res.json({ success: true, data: visitor, message: 'Visitor status updated' });
    } catch {
      return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
    }
  }
);

// Guard logs a walk-in visitor
router.post(
  '/walkin',
  authenticateJWT,
  authorizeRoles(UserRole.SECURITY, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { name, phone, purpose, unit, category } = req.body as {
        name: string;
        phone?: string;
        purpose: string;
        unit?: string;
        category?: VisitorCategory;
      };
      if (!name || !purpose) {
        return res.status(400).json({ success: false, data: null, message: 'Name and purpose are required' });
      }
      const loggedBy = (req.user as { id: string }).id;
      const visitor = await Visitor.create({
        name,
        purpose,
        unit,
        category: category ?? VisitorCategory.GUEST,
        invitedBy: loggedBy,
        status: VisitorStatus.ACTIVE,
        checkInTime: new Date(),
      });
      return res.status(201).json({ success: true, data: visitor, message: 'Walk-in visitor logged' });
    } catch {
      return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
    }
  }
);

export default router;
