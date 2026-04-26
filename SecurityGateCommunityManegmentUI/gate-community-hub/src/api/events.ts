import api from '@/utils/api';

export interface CommunityEvent {
  _id: string;
  title: string;
  location: string;
  date: string;
  rsvpRequired: boolean;
  description?: string;
  rsvps: { _id: string; name: string }[];
  createdBy: { _id: string; name: string };
}

export const getEvents = async (): Promise<CommunityEvent[]> => {
  const res = await api.get('/events');
  return res.data.data;
};

export const createEvent = async (data: {
  title: string;
  location: string;
  date: string;
  rsvpRequired?: boolean;
  description?: string;
}): Promise<CommunityEvent> => {
  const res = await api.post('/events', data);
  return res.data.data;
};

export const rsvpEvent = async (id: string): Promise<CommunityEvent> => {
  const res = await api.post(`/events/${id}/rsvp`);
  return res.data.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`);
};
