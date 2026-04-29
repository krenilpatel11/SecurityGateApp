import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  RESIDENT = 'resident',
  SECURITY = 'security',
  ADMIN = 'admin',
  STAFF = 'staff',
  SUPERUSER = 'superuser',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  createdAt: Date;
  avatar?: string;
  role: UserRole;
  activeRole?: UserRole; // SUPERUSER can impersonate any role
  unit?: string;
  phone?: string;
  residentSince?: Date;
  updatedAt: Date;
  id: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  avatar: { type: String },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.RESIDENT },
  activeRole: { type: String, enum: Object.values(UserRole) }, // current impersonated role
  createdAt: { type: Date, default: Date.now },
  unit: { type: String },
  phone: { type: String },
  residentSince: { type: Date },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
