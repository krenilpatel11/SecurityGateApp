import api from '@/utils/api';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  unit?: string;
  phone?: string;
  avatar?: string;
  residentSince?: string;
}

export const getProfile = async (): Promise<UserProfile> => {
  const res = await api.get('/users/me');
  return res.data.data;
};

export const updateProfile = async (data: Partial<Pick<UserProfile, 'name' | 'phone' | 'unit'>>): Promise<UserProfile> => {
  const res = await api.patch('/users/me', data);
  return res.data.data;
};
