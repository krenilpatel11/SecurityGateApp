import mongoose, { Document, Schema } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
}

export interface IPayment extends Document {
  resident: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  month: string;
  status: PaymentStatus;
  paidAt?: Date;
  recordedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    resident: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    month: { type: String, required: true },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    paidAt: { type: Date },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
