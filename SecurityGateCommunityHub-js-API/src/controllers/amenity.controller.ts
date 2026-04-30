import { Request, Response } from 'express';
import { Amenity, AmenityBooking, BookingStatus } from '../models/amenity.model';
import { UserRole } from '../models/user.model';

export const getAmenities = async (_req: Request, res: Response) => {
  try {
    const amenities = await Amenity.find({ isActive: true }).sort({ name: 1 });
    return res.json({ success: true, data: amenities, message: 'Amenities fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const createAmenity = async (req: Request, res: Response) => {
  try {
    const { name, description, capacity } = req.body as { name: string; description: string; capacity: number };
    if (!name || !description || !capacity) {
      return res.status(400).json({ success: false, data: null, message: 'name, description, and capacity are required' });
    }
    const amenity = await Amenity.create({ name, description, capacity });
    return res.status(201).json({ success: true, data: amenity, message: 'Amenity created' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const bookAmenity = async (req: Request, res: Response) => {
  try {
    const { amenityId, date, timeSlot } = req.body as { amenityId: string; date: string; timeSlot: string };
    if (!amenityId || !date || !timeSlot) {
      return res.status(400).json({ success: false, data: null, message: 'amenityId, date, and timeSlot are required' });
    }
    // Time-slot conflict check
    const conflict = await AmenityBooking.findOne({
      amenity: amenityId,
      date: new Date(date),
      timeSlot,
      status: { $nin: [BookingStatus.REJECTED] },
    });
    if (conflict) {
      return res.status(409).json({ success: false, data: null, message: `Time slot "${timeSlot}" is already booked for this date` });
    }
    const bookedBy = (req.user as { id: string }).id;
    const booking = await AmenityBooking.create({ amenity: amenityId, bookedBy, date: new Date(date), timeSlot });
    const populated = await booking.populate([
      { path: 'amenity', select: 'name' },
      { path: 'bookedBy', select: 'name unit' },
    ]);
    return res.status(201).json({ success: true, data: populated, message: 'Amenity booked' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const user = req.user as { id: string; role: string; activeRole?: string };
    const effectiveRole = user.activeRole ?? user.role;
    const filter = effectiveRole === UserRole.RESIDENT ? { bookedBy: user.id } : {};
    const bookings = await AmenityBooking.find(filter)
      .populate('amenity', 'name description')
      .populate('bookedBy', 'name unit email')
      .sort({ date: -1 });
    return res.json({ success: true, data: bookings, message: 'Bookings fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: string };
    if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid status' });
    }
    const booking = await AmenityBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('amenity', 'name').populate('bookedBy', 'name unit');
    if (!booking) return res.status(404).json({ success: false, data: null, message: 'Booking not found' });
    return res.json({ success: true, data: booking, message: 'Booking status updated' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
