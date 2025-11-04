
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserContent extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  progress: number;
  isBookmarked: boolean;
  lastAccessed: Date;
  completedAt: Date;
  notes: string;
}

const UserContentSchema: Schema = new Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    contentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Content', 
      required: true 
    },
    progress: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100 
    },
    isBookmarked: { 
      type: Boolean, 
      default: false 
    },
    lastAccessed: { 
      type: Date,
      default: Date.now 
    },
    completedAt: { 
      type: Date 
    },
    notes: { 
      type: String 
    }
  },
  { timestamps: true }
);

// Ensure each user can only have one record per content item
UserContentSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export default mongoose.model<IUserContent>('UserContent', UserContentSchema);
