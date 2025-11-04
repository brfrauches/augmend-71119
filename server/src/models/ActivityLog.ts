
import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId: Schema.Types.ObjectId;
  activityType: 'reflection' | 'content' | 'exercise' | 'login' | 'assessment';
  timestamp: Date;
  details: Record<string, any>;
  duration?: number;
}

const ActivityLogSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  activityType: {
    type: String,
    enum: ['reflection', 'content', 'exercise', 'login', 'assessment'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: Schema.Types.Mixed,
    default: {},
  },
  duration: {
    type: Number,
  },
});

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
