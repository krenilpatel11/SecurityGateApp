import mongoose, { Document, Schema } from 'mongoose';

export enum DeliveryStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
  LEFT_AT_GATE = 'Left at Gate'
}

export interface IDelivery extends Document {
  resident: mongoose.Types.ObjectId;
  deliveryPerson: string;
  deliveryCompany?: string;
  purpose: string;
  items?: string;
  photoUrl?: string;
  status: DeliveryStatus;
  requestedAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  leftAtGateReason?: string;
  clubbedWith?: mongoose.Types.ObjectId[]; // Array of other Delivery IDs
}

const DeliverySchema = new Schema<IDelivery>({
  resident: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deliveryPerson: { type: String, required: true },
  deliveryCompany: { type: String },
  purpose: { type: String, required: true },
  items: { type: String },
  photoUrl: { type: String },
  status: { type: String, enum: Object.values(DeliveryStatus), default: DeliveryStatus.PENDING },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  completedAt: { type: Date },
  leftAtGateReason: { type: String },
  clubbedWith: [{ type: Schema.Types.ObjectId, ref: 'Delivery' }]
});

export default mongoose.model<IDelivery>('Delivery', DeliverySchema);
