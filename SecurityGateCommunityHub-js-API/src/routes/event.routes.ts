import { Router } from 'express';
import { getEvents, createEvent, rsvpEvent, deleteEvent } from '../controllers/event.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.get('/', authenticateJWT, getEvents);
router.post('/', authenticateJWT, authorizeRoles(UserRole.ADMIN), createEvent);
router.post('/:id/rsvp', authenticateJWT, rsvpEvent);
router.delete('/:id', authenticateJWT, authorizeRoles(UserRole.ADMIN), deleteEvent);

export default router;
