import { Request, Response } from 'express';
import Poll from '../models/poll.model';
import mongoose from 'mongoose';

export const getPolls = async (_req: Request, res: Response) => {
  try {
    const polls = await Poll.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    return res.json({ success: true, data: polls, message: 'Polls fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const createPoll = async (req: Request, res: Response) => {
  try {
    const { question, options, endsAt } = req.body as { question: string; options: string[]; endsAt: string };
    if (!question || !options || options.length < 2 || !endsAt) {
      return res.status(400).json({ success: false, data: null, message: 'question, at least 2 options, and endsAt are required' });
    }
    const createdBy = (req.user as { id: string }).id;
    const poll = await Poll.create({
      question,
      options: options.map((o: string) => ({ option: o, votes: 0 })),
      endsAt: new Date(endsAt),
      createdBy,
    });
    return res.status(201).json({ success: true, data: poll, message: 'Poll created' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const votePoll = async (req: Request, res: Response) => {
  try {
    const { optionIndex } = req.body as { optionIndex: number };
    const userId = new mongoose.Types.ObjectId((req.user as { id: string }).id);
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ success: false, data: null, message: 'Poll not found' });
    if (poll.votedBy.some((id) => id.equals(userId))) {
      return res.status(400).json({ success: false, data: null, message: 'You have already voted' });
    }
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid option index' });
    }
    poll.options[optionIndex].votes += 1;
    poll.votedBy.push(userId);
    await poll.save();
    return res.json({ success: true, data: poll, message: 'Vote recorded' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
