import api from '@/utils/api';
import type { UserProfile } from './profile';

export const getAllUsers = async (role?: string): Promise<UserProfile[]> => {
  const res = await api.get('/admin/users', { params: role ? { role } : {} });
  return res.data.data;
};

export const updateUserRole = async (id: string, role: string): Promise<UserProfile> => {
  const res = await api.patch(`/admin/users/${id}/role`, { role });
  return res.data.data;
};
