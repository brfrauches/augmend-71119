
import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  title: string;
  description: string;
  icon: string;
  criteria: Record<string, any>;
  pointsValue: number;
  category: string;
  isRepeatable: boolean;
  cooldownPeriod: number;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    criteria: {
      type: Schema.Types.Mixed,
      required: true,
    },
    pointsValue: {
      type: Number,
      default: 10,
    },
    category: {
      type: String,
      required: true,
      enum: ['STREAK', 'COUNT', 'MILESTONE', 'SPECIAL'],
    },
    isRepeatable: {
      type: Boolean,
      default: false,
    },
    cooldownPeriod: {
      type: Number,
      default: 0, // In days
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
AchievementSchema.index({ category: 1 });
AchievementSchema.index({ isRepeatable: 1 });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
