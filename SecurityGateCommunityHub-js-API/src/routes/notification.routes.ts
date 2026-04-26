import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notification.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, getNotifications);
router.patch('/read-all', authenticateJWT, markAllRead);
router.patch('/:id/read', authenticateJWT, markRead);

export default router;
