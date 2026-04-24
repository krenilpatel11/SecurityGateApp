import mongoose, { Document, Schema } from 'mongoose';

export enum VisitorCategory {
  RESIDENT = 'Resident',
  DELIVERY = 'Delivery',
  GUEST = 'Guest',
  SERVICE = 'Service'
}

export enum VisitorStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  ACTIVE = 'Active',
  CHECKED_OUT = 'Checked Out',
  COMPLETED = 'Completed'
}

export interface IVisitor extends Document {
  name: string;
  photoUrl?: string;
  category: VisitorCategory;
  purpose: string;
  invitedBy: mongoose.Types.ObjectId; // User who invited
  unit?: string;
  status: VisitorStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  entryPoint?: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    name: { type: String, required: true },
    photoUrl: { type: String },
    category: { type: String, enum: Object.values(VisitorCategory), required: true },
    purpose: { type: String, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    unit: { type: String },
    status: { type: String, enum: Object.values(VisitorStatus), default: VisitorStatus.PENDING },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    entryPoint: { type: String },
    qrCode: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IVisitor>('Visitor', VisitorSchema);
