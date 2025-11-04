
import mongoose, { Document, Schema } from 'mongoose';

// Interface for chat history
export interface IChatMessage extends Document {
  userId?: string; // For future authentication
  userMessage: string;
  assistantResponse: string;
  createdAt: Date;
}

// Interface for suggested questions
export interface ISuggestedQuestion extends Document {
  question: string;
  category: string;
  priority: number;
  isActive: boolean;
}

// Schema for chat history
const ChatMessageSchema: Schema = new Schema({
  userId: { type: String },
  userMessage: { type: String, required: true },
  assistantResponse: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Schema for suggested questions
const SuggestedQuestionSchema: Schema = new Schema({
  question: { type: String, required: true },
  category: { type: String, default: 'general' },
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

// Create models
export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
export const SuggestedQuestion = mongoose.model<ISuggestedQuestion>('SuggestedQuestion', SuggestedQuestionSchema);
