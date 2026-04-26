import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  location: string;
  date: Date;
  rsvpRequired: boolean;
  description?: string;
  rsvps: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    rsvpRequired: { type: Boolean, default: false },
    description: { type: String },
    rsvps: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', EventSchema);
