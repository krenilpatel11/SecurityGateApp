import api from '@/utils/api';

export interface FeedPost {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'Active' | 'Closed' | 'Sold';
  postedBy: { name: string; unit?: string; avatar?: string };
  price?: number;
  imageUrl?: string;
  contactPhone?: string;
  unit?: string;
  likes: string[];
  createdAt: string;
}

export const getFeed = async (params?: { category?: string; page?: number }): Promise<{ posts: FeedPost[]; total: number; pages: number }> => {
  const res = await api.get('/feed', { params });
  return res.data.data;
};

export const createPost = async (data: {
  title: string; description: string; category: string;
  price?: number; imageUrl?: string; contactPhone?: string;
}): Promise<FeedPost> => {
  const res = await api.post('/feed', data);
  return res.data.data;
};

export const toggleLike = async (id: string): Promise<{ likes: number; liked: boolean }> => {
  const res = await api.patch(`/feed/${id}/like`, {});
  return res.data.data;
};

export const closePost = async (id: string, status: 'Closed' | 'Sold'): Promise<FeedPost> => {
  const res = await api.patch(`/feed/${id}/status`, { status });
  return res.data.data;
};

export const deletePost = async (id: string): Promise<void> => {
  await api.delete(`/feed/${id}`);
};
