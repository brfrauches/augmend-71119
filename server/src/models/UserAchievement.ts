
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  dateUnlocked: Date;
  completionCount: number;
  lastCompleted: Date;
  progress: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UserAchievementSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    achievementId: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true,
    },
    dateUnlocked: {
      type: Date,
    },
    completionCount: {
      type: Number,
      default: 0,
    },
    lastCompleted: {
      type: Date,
    },
    progress: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to quickly find user achievements
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
UserAchievementSchema.index({ userId: 1, dateUnlocked: 1 });

export default mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);
