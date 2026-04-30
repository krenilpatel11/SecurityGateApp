import mongoose, { Document, Schema } from 'mongoose';

export enum VisitorCategory {
  RESIDENT = 'Resident',
  DELIVERY = 'Delivery',
  GUEST = 'Guest',
  SERVICE = 'Service',
  VENDOR = 'Vendor',
}

export enum VisitorStatus {
  PENDING = 'Pending',
  OTP_SENT = 'OTP Sent',
  APPROVED = 'Approved',
  ACTIVE = 'Active',
  CHECKED_OUT = 'Checked Out',
  COMPLETED = 'Completed',
  DENIED = 'Denied',
}

export interface IVisitor extends Document {
  name: string;
  phone?: string;
  photoUrl?: string; // captured at gate
  category: VisitorCategory;
  purpose: string;
  invitedBy: mongoose.Types.ObjectId;
  unit?: string;
  status: VisitorStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  entryPoint?: string;
  qrCode?: string; // gate pass QR
  otp?: string; // 6-digit OTP for approval
  otpExpiresAt?: Date;
  otpVerified?: boolean;
  vehicleNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    name: { type: String, required: true },
    phone: { type: String },
    photoUrl: { type: String },
    category: { type: String, enum: Object.values(VisitorCategory), required: true },
    purpose: { type: String, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    unit: { type: String },
    status: { type: String, enum: Object.values(VisitorStatus), default: VisitorStatus.PENDING },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    entryPoint: { type: String },
    qrCode: { type: String },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    otpVerified: { type: Boolean, default: false },
    vehicleNumber: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IVisitor>('Visitor', VisitorSchema);
