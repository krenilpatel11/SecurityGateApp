import { Router } from 'express';
import { getAmenities, createAmenity, bookAmenity, getBookings, updateBookingStatus } from '../controllers/amenity.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.get('/', authenticateJWT, getAmenities);
router.post('/', authenticateJWT, authorizeRoles(UserRole.ADMIN), createAmenity);
router.post('/bookings', authenticateJWT, bookAmenity);
router.get('/bookings', authenticateJWT, getBookings);
router.patch('/bookings/:id/status', authenticateJWT, authorizeRoles(UserRole.ADMIN), updateBookingStatus);

export default router;
