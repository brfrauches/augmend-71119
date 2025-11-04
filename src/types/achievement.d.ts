
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  pointsValue: number;
  isRepeatable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: Achievement;
  dateUnlocked?: string;
  completionCount: number;
  lastCompleted?: string;
  progress: {
    count?: number;
    percent?: number;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AchievementStats {
  totalAchievements: number;
  completedAchievements: number;
  totalPoints: number;
  earnedPoints: number;
  recentUnlocks: UserAchievement[];
}
