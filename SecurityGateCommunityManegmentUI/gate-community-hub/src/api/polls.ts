import api from '@/utils/api';

export interface PollOption {
  option: string;
  votes: number;
}

export interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  endsAt: string;
  votedBy: string[];
  createdBy: { _id: string; name: string };
  createdAt: string;
}

export const getPolls = async (): Promise<Poll[]> => {
  const res = await api.get('/polls');
  return res.data.data;
};

export const createPoll = async (data: { question: string; options: string[]; endsAt: string }): Promise<Poll> => {
  const res = await api.post('/polls', data);
  return res.data.data;
};

export const votePoll = async (id: string, optionIndex: number): Promise<Poll> => {
  const res = await api.post(`/polls/${id}/vote`, { optionIndex });
  return res.data.data;
};
