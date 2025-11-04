
import mongoose, { Document, Schema } from 'mongoose';

export interface ISuggestedQuestion extends Document {
  category: string;
  text: string;
  displayOrder: number;
  isActive: boolean;
}

const SuggestedQuestionSchema: Schema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISuggestedQuestion>('SuggestedQuestion', SuggestedQuestionSchema);
