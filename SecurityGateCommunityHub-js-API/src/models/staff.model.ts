import mongoose, { Document, Schema } from 'mongoose';

export enum StaffType {
  MAID = 'Maid',
  DRIVER = 'Driver',
  GARDENER = 'Gardener',
  COOK = 'Cook',
  SECURITY = 'Security',
  PLUMBER = 'Plumber',
  ELECTRICIAN = 'Electrician',
  OTHER = 'Other',
}

export enum StaffStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
}

export interface IStaff extends Document {
  name: string;
  phone: string;
  type: StaffType;
  photoUrl?: string;
  idProofUrl?: string;
  assignedTo: mongoose.Types.ObjectId; // Resident who employs them
  unit: string;
  status: StaffStatus;
  vendorPassUrl?: string; // QR-based vendor pass
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    type: { type: String, enum: Object.values(StaffType), required: true },
    photoUrl: { type: String },
    idProofUrl: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    unit: { type: String, required: true },
    status: { type: String, enum: Object.values(StaffStatus), default: StaffStatus.ACTIVE },
    vendorPassUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IStaff>('Staff', StaffSchema);
