import mongoose, { Document, Schema } from 'mongoose';

export enum BookingStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface IAmenity extends Document {
  name: string;
  description: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAmenityBooking extends Document {
  amenity: mongoose.Types.ObjectId;
  bookedBy: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AmenitySchema = new Schema<IAmenity>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    capacity: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AmenityBookingSchema = new Schema<IAmenityBooking>(
  {
    amenity: { type: Schema.Types.ObjectId, ref: 'Amenity', required: true },
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING },
  },
  { timestamps: true }
);

export const Amenity = mongoose.model<IAmenity>('Amenity', AmenitySchema);
export const AmenityBooking = mongoose.model<IAmenityBooking>('AmenityBooking', AmenityBookingSchema);
