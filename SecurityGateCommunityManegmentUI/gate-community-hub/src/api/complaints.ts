import api from '@/utils/api';

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  raisedBy: { _id: string; name: string; unit?: string; email: string };
  resolution?: string;
  createdAt: string;
}

export const getComplaints = async (): Promise<Complaint[]> => {
  const res = await api.get('/complaints');
  return res.data.data;
};

export const createComplaint = async (data: { title: string; description: string; category: string }): Promise<Complaint> => {
  const res = await api.post('/complaints', data);
  return res.data.data;
};

export const updateComplaintStatus = async (id: string, status: string, resolution?: string): Promise<Complaint> => {
  const res = await api.patch(`/complaints/${id}/status`, { status, resolution });
  return res.data.data;
};
