import mongoose, { Document, Schema } from 'mongoose';

export enum ComplaintStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

export enum ComplaintCategory {
  MAINTENANCE = 'Maintenance',
  NOISE = 'Noise',
  SECURITY = 'Security',
  CLEANLINESS = 'Cleanliness',
  PARKING = 'Parking',
  OTHER = 'Other',
}

export interface IComplaint extends Document {
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  raisedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: Object.values(ComplaintCategory), required: true },
    status: { type: String, enum: Object.values(ComplaintStatus), default: ComplaintStatus.OPEN },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    resolution: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
