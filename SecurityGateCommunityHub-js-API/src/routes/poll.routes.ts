import { Router } from 'express';
import { getPolls, createPoll, votePoll } from '../controllers/poll.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.get('/', authenticateJWT, getPolls);
router.post('/', authenticateJWT, authorizeRoles(UserRole.ADMIN), createPoll);
router.post('/:id/vote', authenticateJWT, votePoll);

export default router;
