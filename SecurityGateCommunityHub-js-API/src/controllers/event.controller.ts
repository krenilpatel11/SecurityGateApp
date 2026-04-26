import { Request, Response } from 'express';
import Event from '../models/event.model';
import mongoose from 'mongoose';

export const getEvents = async (_req: Request, res: Response) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name')
      .populate('rsvps', 'name unit')
      .sort({ date: 1 });
    return res.json({ success: true, data: events, message: 'Events fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, location, date, rsvpRequired, description } = req.body as {
      title: string;
      location: string;
      date: string;
      rsvpRequired?: boolean;
      description?: string;
    };
    if (!title || !location || !date) {
      return res.status(400).json({ success: false, data: null, message: 'title, location, and date are required' });
    }
    const createdBy = (req.user as { id: string }).id;
    const event = await Event.create({ title, location, date: new Date(date), rsvpRequired, description, createdBy });
    return res.status(201).json({ success: true, data: event, message: 'Event created' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const rsvpEvent = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId((req.user as { id: string }).id);
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, data: null, message: 'Event not found' });
    const alreadyRsvp = event.rsvps.some((id) => id.equals(userId));
    if (alreadyRsvp) {
      event.rsvps = event.rsvps.filter((id) => !id.equals(userId));
    } else {
      event.rsvps.push(userId);
    }
    await event.save();
    return res.json({ success: true, data: event, message: alreadyRsvp ? 'RSVP removed' : 'RSVP confirmed' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, data: null, message: 'Event not found' });
    return res.json({ success: true, data: null, message: 'Event deleted' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
