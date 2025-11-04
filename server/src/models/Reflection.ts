
import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IReflection extends Document {
  user: mongoose.Types.ObjectId | IUser;
  text: string;
  mood: string;
  date: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReflectionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    mood: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
ReflectionSchema.index({ user: 1, date: -1 });
ReflectionSchema.index({ mood: 1 });
ReflectionSchema.index({ tags: 1 });

// Text index for search functionality
ReflectionSchema.index({ text: 'text' });

export default mongoose.model<IReflection>('Reflection', ReflectionSchema);
