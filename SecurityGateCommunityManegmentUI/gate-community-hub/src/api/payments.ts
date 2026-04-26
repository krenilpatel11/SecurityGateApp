import api from '@/utils/api';

export interface Payment {
  _id: string;
  resident: { _id: string; name: string; unit?: string; email: string };
  amount: number;
  description: string;
  month: string;
  status: 'Pending' | 'Paid';
  paidAt?: string;
  createdAt: string;
}

export const getPayments = async (status?: string): Promise<Payment[]> => {
  const res = await api.get('/payments', { params: status ? { status } : {} });
  return res.data.data;
};

export const recordPayment = async (data: {
  residentId: string;
  amount: number;
  description: string;
  month: string;
}): Promise<Payment> => {
  const res = await api.post('/payments', data);
  return res.data.data;
};

export const markPaid = async (id: string): Promise<Payment> => {
  const res = await api.patch(`/payments/${id}/paid`);
  return res.data.data;
};
