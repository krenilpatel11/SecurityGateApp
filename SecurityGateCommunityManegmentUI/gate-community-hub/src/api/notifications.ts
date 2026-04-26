import api from '@/utils/api';

export interface AppNotification {
  _id: string;
  user: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const getNotifications = async (): Promise<AppNotification[]> => {
  const res = await api.get('/notifications');
  return res.data.data;
};

export const markRead = async (id: string): Promise<AppNotification> => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data.data;
};

export const markAllRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};
