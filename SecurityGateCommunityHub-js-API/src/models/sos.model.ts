import mongoose, { Document, Schema } from 'mongoose';

export enum SOSStatus {
  ACTIVE = 'Active',
  RESOLVED = 'Resolved',
}

export interface ISOS extends Document {
  raisedBy: mongoose.Types.ObjectId;
  unit: string;
  message: string;
  status: SOSStatus;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SOSSchema = new Schema<ISOS>(
  {
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    unit: { type: String, required: true },
    message: { type: String, default: 'Emergency! Please help!' },
    status: { type: String, enum: Object.values(SOSStatus), default: SOSStatus.ACTIVE },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<ISOS>('SOS', SOSSchema);
