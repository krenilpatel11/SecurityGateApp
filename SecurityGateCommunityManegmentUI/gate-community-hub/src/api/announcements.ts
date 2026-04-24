import api from "@/utils/api";

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: { _id: string; name: string; avatar?: string };
  community?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const res = await api.get<ApiResponse<Announcement[]>>("/announcements");
  return res.data.data;
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  isPinned?: boolean;
}): Promise<Announcement> {
  const res = await api.post<ApiResponse<Announcement>>("/announcements", data);
  return res.data.data;
}

export async function updateAnnouncement(
  id: string,
  data: { title?: string; content?: string; isPinned?: boolean }
): Promise<Announcement> {
  const res = await api.patch<ApiResponse<Announcement>>(`/announcements/${id}`, data);
  return res.data.data;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await api.delete(`/announcements/${id}`);
}
