
import mongoose, { Document, Schema } from 'mongoose';

export interface IMoodEntry extends Document {
  mood: string;
  timestamp: Date;
}

export interface IBreathingSession extends Document {
  duration: number; // in seconds
  completedBreaths: number;
  timestamp: Date;
}

export interface IWellnessData extends Document {
  userId: string; // For future auth implementation
  moodEntries: IMoodEntry[];
  breathingSessions: IBreathingSession[];
  createdAt: Date;
  updatedAt: Date;
}

const MoodEntrySchema: Schema = new Schema({
  mood: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const BreathingSessionSchema: Schema = new Schema({
  duration: { type: Number, required: true },
  completedBreaths: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const WellnessDataSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    moodEntries: [MoodEntrySchema],
    breathingSessions: [BreathingSessionSchema]
  },
  { timestamps: true }
);

export default mongoose.model<IWellnessData>('WellnessData', WellnessDataSchema);
