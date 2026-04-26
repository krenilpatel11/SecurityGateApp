import api from '@/utils/api';

export interface Amenity {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  isActive: boolean;
}

export interface AmenityBooking {
  _id: string;
  amenity: { _id: string; name: string; description: string };
  bookedBy: { _id: string; name: string; unit?: string; email: string };
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export const getAmenities = async (): Promise<Amenity[]> => {
  const res = await api.get('/amenities');
  return res.data.data;
};

export const createAmenity = async (data: { name: string; description: string; capacity: number }): Promise<Amenity> => {
  const res = await api.post('/amenities', data);
  return res.data.data;
};

export const bookAmenity = async (data: { amenityId: string; date: string; timeSlot: string }): Promise<AmenityBooking> => {
  const res = await api.post('/amenities/bookings', data);
  return res.data.data;
};

export const getBookings = async (): Promise<AmenityBooking[]> => {
  const res = await api.get('/amenities/bookings');
  return res.data.data;
};

export const updateBookingStatus = async (id: string, status: string): Promise<AmenityBooking> => {
  const res = await api.patch(`/amenities/bookings/${id}/status`, { status });
  return res.data.data;
};
