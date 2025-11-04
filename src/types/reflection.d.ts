
export interface Reflection {
  id: string;
  text: string;
  mood: string;
  date: string; // ISO string
  tags?: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ReflectionStreaks {
  currentStreak: number;
  longestStreak: number;
  streaks: Array<{
    start: string;
    end: string;
    length: number;
  }>;
}

export interface MoodStatistic {
  mood: string;
  count: number;
}
