import mongoose, { Document, Schema } from 'mongoose';

export enum FeedCategory {
  BUY = 'Buy',
  SELL = 'Sell',
  RENT = 'Rent',
  LOST_FOUND = 'Lost & Found',
  ANNOUNCEMENT = 'Announcement',
  EVENT = 'Event',
  GENERAL = 'General',
}

export enum FeedStatus {
  ACTIVE = 'Active',
  CLOSED = 'Closed',
  SOLD = 'Sold',
}

export interface ICommunityFeed extends Document {
  title: string;
  description: string;
  category: FeedCategory;
  status: FeedStatus;
  postedBy: mongoose.Types.ObjectId;
  price?: number;
  imageUrl?: string;
  contactPhone?: string;
  unit?: string;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CommunityFeedSchema = new Schema<ICommunityFeed>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: Object.values(FeedCategory), required: true },
    status: { type: String, enum: Object.values(FeedStatus), default: FeedStatus.ACTIVE },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number },
    imageUrl: { type: String },
    contactPhone: { type: String },
    unit: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model<ICommunityFeed>('CommunityFeed', CommunityFeedSchema);
