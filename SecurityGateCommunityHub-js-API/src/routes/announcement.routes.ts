import { Router, Request, Response } from 'express';
import Announcement from '../models/announcement.model';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// GET /api/announcements — all authenticated users
router.get(
  '/',
  authenticateJWT,
  async (_req: Request, res: Response) => {
    try {
      const announcements = await Announcement.find()
        .sort({ isPinned: -1, createdAt: -1 })
        .populate('author', 'name avatar');
      return res.json({ success: true, data: announcements, message: 'Announcements fetched' });
    } catch {
      return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
    }
  }
);

// POST /api/announcements — admin only
router.post(
  '/',
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { title, content, isPinned, community } = req.body as {
        title: string;
        content: string;
        isPinned?: boolean;
        community?: string;
      };
      if (!title || !content) {
        return res.status(400).json({ success: false, data: null, message: 'Title and content are required' });
      }
      const author = (req.user as { id: string }).id;
      const announcement = await Announcement.create({ title, content, author, isPinned: isPinned ?? false, community });
      const populated = await announcement.populate('author', 'name avatar');
      return res.status(201).json({ success: true, data: populated, message: 'Announcement created' });
    } catch {
      return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
    }
  }
);

// PATCH /api/announcements/:id — admin only (update)
router.patch(
  '/:id',
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { title, content, isPinned } = req.body as { title?: string; content?: string; isPinned?: boolean };
      const announcement = await Announcement.findByIdAndUpdate(
        req.params.id,
        { title, content, isPinned },
        { new: true, runValidators: true }
      ).populate('author', 'name avatar');
      if (!announcement) return res.status(404).json({ success: false, data: null, message: 'Announcement not found' });
      return res.json({ success: true, data: announcement, message: 'Announcement updated' });
    } catch {
      return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
    }
  }
);

// DELETE /api/announcements/:id — admin only
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const announcement = await Announcement.findByIdAndDelete(req.params.id);
      if (!announcement) return res.status(404).json({ success: false, data: null, message: 'Announcement not found' });
      return res.json({ success: true, data: null, message: 'Announcement deleted' });
    } catch {
      return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
    }
  }
);

export default router;
