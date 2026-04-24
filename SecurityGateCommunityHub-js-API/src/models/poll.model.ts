import mongoose, { Document, Schema } from 'mongoose';

export interface IPollOption {
  option: string;
  votes: number;
}

export interface IPoll extends Document {
  question: string;
  options: IPollOption[];
  endsAt: Date;
}

const PollOptionSchema = new Schema<IPollOption>(
  {
    option: { type: String, required: true },
    votes: { type: Number, default: 0 }
  },
  { _id: false }
);

const PollSchema = new Schema<IPoll>(
  {
    question: { type: String, required: true },
    options: [PollOptionSchema],
    endsAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IPoll>('Poll', PollSchema);
