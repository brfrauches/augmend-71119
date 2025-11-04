
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserStats extends Document {
  userId: Schema.Types.ObjectId;
  weeklyProgress: number;
  streak: number;
  goalsCompleted: number;
  totalGoals: number;
  lastCalculated: Date;
  wellnessScore: number;
  weeklyBreakdown: {
    [key: string]: {
      activities: number;
      duration: number;
      wellnessScore: number;
    };
  };
  contentProgress: {
    article: number;
    video: number;
    exercise: number;
    audio: number;
  };
}

const UserStatsSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  weeklyProgress: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  goalsCompleted: {
    type: Number,
    default: 0,
  },
  totalGoals: {
    type: Number,
    default: 15, // Default number of goals
  },
  wellnessScore: {
    type: Number,
    default: 75, // Default wellness score
  },
  lastCalculated: {
    type: Date,
    default: Date.now,
  },
  weeklyBreakdown: {
    type: Schema.Types.Mixed,
    default: {},
  },
  contentProgress: {
    article: { type: Number, default: 0 },
    video: { type: Number, default: 0 },
    exercise: { type: Number, default: 0 },
    audio: { type: Number, default: 0 },
  },
});

export default mongoose.model<IUserStats>('UserStats', UserStatsSchema);
