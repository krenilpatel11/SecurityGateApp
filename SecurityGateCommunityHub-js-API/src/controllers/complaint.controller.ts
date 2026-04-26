import { Request, Response } from 'express';
import Complaint, { ComplaintStatus } from '../models/complaint.model';
import { UserRole } from '../models/user.model';

export const createComplaint = async (req: Request, res: Response) => {
  try {
    const { title, description, category } = req.body as { title: string; description: string; category: string };
    if (!title || !description || !category) {
      return res.status(400).json({ success: false, data: null, message: 'title, description, and category are required' });
    }
    const raisedBy = (req.user as { id: string }).id;
    const complaint = await Complaint.create({ title, description, category, raisedBy });
    return res.status(201).json({ success: true, data: complaint, message: 'Complaint raised' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const getComplaints = async (req: Request, res: Response) => {
  try {
    const user = req.user as { id: string; role: string };
    const filter = user.role === UserRole.RESIDENT ? { raisedBy: user.id } : {};
    const complaints = await Complaint.find(filter)
      .populate('raisedBy', 'name unit email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: complaints, message: 'Complaints fetched' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

export const updateComplaintStatus = async (req: Request, res: Response) => {
  try {
    const { status, resolution } = req.body as { status: string; resolution?: string };
    if (!Object.values(ComplaintStatus).includes(status as ComplaintStatus)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid status' });
    }
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, ...(resolution && { resolution }) },
      { new: true }
    ).populate('raisedBy', 'name unit email');
    if (!complaint) return res.status(404).json({ success: false, data: null, message: 'Complaint not found' });
    return res.json({ success: true, data: complaint, message: 'Complaint status updated' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
