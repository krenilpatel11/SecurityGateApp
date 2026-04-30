import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceLog extends Document {
  staff: mongoose.Types.ObjectId;
  unit: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  workedHours?: number; // computed on checkout
  healthStatus?: 'Healthy' | 'Sick' | 'Not Checked';
  temperature?: number; // in Celsius
  notes?: string;
  loggedBy: mongoose.Types.ObjectId; // security guard or resident
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceLogSchema = new Schema<IAttendanceLog>(
  {
    staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    unit: { type: String, required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    workedHours: { type: Number },
    healthStatus: { type: String, enum: ['Healthy', 'Sick', 'Not Checked'], default: 'Not Checked' },
    temperature: { type: Number },
    notes: { type: String },
    loggedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAttendanceLog>('AttendanceLog', AttendanceLogSchema);
