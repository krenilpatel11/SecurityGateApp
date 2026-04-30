import api from '@/utils/api';

export interface StaffMember {
  _id: string;
  name: string;
  phone: string;
  type: string;
  photoUrl?: string;
  unit: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  vendorPassUrl?: string;
  assignedTo: { name: string; unit: string };
  createdAt: string;
}

export interface AttendanceLog {
  _id: string;
  staff: { name: string; type: string; unit: string };
  date: string;
  checkIn?: string;
  checkOut?: string;
  workedHours?: number;
  healthStatus: 'Healthy' | 'Sick' | 'Not Checked';
  temperature?: number;
  notes?: string;
}

export const getStaff = async (): Promise<StaffMember[]> => {
  const res = await api.get('/staff');
  return res.data.data;
};

export const registerStaff = async (data: {
  name: string; phone: string; type: string; unit: string; photoUrl?: string;
}): Promise<StaffMember> => {
  const res = await api.post('/staff', data);
  return res.data.data;
};

export const staffCheckIn = async (id: string, data: {
  healthStatus?: string; temperature?: number; notes?: string;
}): Promise<AttendanceLog> => {
  const res = await api.post(`/staff/${id}/checkin`, data);
  return res.data.data;
};

export const staffCheckOut = async (id: string): Promise<AttendanceLog> => {
  const res = await api.patch(`/staff/${id}/checkout`, {});
  return res.data.data;
};

export const getAttendanceLogs = async (id: string, params?: { from?: string; to?: string }): Promise<AttendanceLog[]> => {
  const res = await api.get(`/staff/${id}/attendance`, { params });
  return res.data.data;
};
