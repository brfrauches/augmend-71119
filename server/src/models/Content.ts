
import mongoose, { Document, Schema } from 'mongoose';

export interface IContent extends Document {
  title: string;
  description: string;
  type: 'article' | 'video' | 'exercise' | 'audio';
  category: string[];
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  thumbnailUrl: string;
  contentUrl: string;
  contentBody: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

const ContentSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: ['article', 'video', 'exercise', 'audio'] 
    },
    category: [{ type: String }],
    tags: [{ type: String }],
    difficulty: { 
      type: String, 
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    duration: { type: Number, required: true },
    thumbnailUrl: { type: String },
    contentUrl: { type: String },
    contentBody: { type: String },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<IContent>('Content', ContentSchema);
