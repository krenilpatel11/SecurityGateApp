import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  location: string;
  date: Date;
  rsvpRequired: boolean;
  description?: string;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    rsvpRequired: { type: Boolean, default: false },
    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', EventSchema);
