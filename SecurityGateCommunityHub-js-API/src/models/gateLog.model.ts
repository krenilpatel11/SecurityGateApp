import mongoose, { Document, Schema } from 'mongoose';

export enum GateLogAction {
  VISITOR_CHECKIN = 'visitor_checkin',
  VISITOR_CHECKOUT = 'visitor_checkout',
  VISITOR_DENIED = 'visitor_denied',
  DELIVERY_APPROVED = 'delivery_approved',
  DELIVERY_REJECTED = 'delivery_rejected',
  DELIVERY_LEFT_AT_GATE = 'delivery_left_at_gate',
  STAFF_CHECKIN = 'staff_checkin',
  STAFF_CHECKOUT = 'staff_checkout',
  SOS_TRIGGERED = 'sos_triggered',
  GATE_OPENED = 'gate_opened',
  GATE_CLOSED = 'gate_closed',
  LOCKDOWN = 'lockdown',
  LOCKDOWN_LIFTED = 'lockdown_lifted',
}

export interface IGateLog extends Document {
  action: GateLogAction;
  performedBy: mongoose.Types.ObjectId; // security guard
  relatedUser?: mongoose.Types.ObjectId; // resident involved
  visitorName?: string;
  unit?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const GateLogSchema = new Schema<IGateLog>(
  {
    action: { type: String, enum: Object.values(GateLogAction), required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    relatedUser: { type: Schema.Types.ObjectId, ref: 'User' },
    visitorName: { type: String },
    unit: { type: String },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Index for fast dashboard queries
GateLogSchema.index({ createdAt: -1 });
GateLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model<IGateLog>('GateLog', GateLogSchema);
