import api from '@/utils/api';

export interface SOSAlert {
  _id: string;
  raisedBy: { _id: string; name: string; unit?: string; phone?: string };
  unit: string;
  message: string;
  status: 'Active' | 'Resolved';
  resolvedBy?: { _id: string; name: string };
  createdAt: string;
}

export const getSOSAlerts = async (): Promise<SOSAlert[]> => {
  const res = await api.get('/sos');
  return res.data.data;
};

export const triggerSOS = async (message?: string): Promise<SOSAlert> => {
  const res = await api.post('/sos', { message });
  return res.data.data;
};

export const resolveSOS = async (id: string): Promise<SOSAlert> => {
  const res = await api.patch(`/sos/${id}/resolve`);
  return res.data.data;
};
