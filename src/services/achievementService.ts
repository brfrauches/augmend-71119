
import api, { handleApiError } from './api';
import { Achievement, UserAchievement, AchievementStats } from '@/types/achievement';

// Local storage keys
const ACHIEVEMENTS_STORAGE_KEY = 'augmend_achievements';
const USER_ACHIEVEMENTS_STORAGE_KEY = 'augmend_user_achievements';

// Helper to get achievements from local storage
const getLocalAchievements = (): Achievement[] => {
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving achievements from localStorage:', error);
    return [];
  }
};

// Helper to save achievements to local storage
const saveLocalAchievements = (achievements: Achievement[]): void => {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error('Error saving achievements to localStorage:', error);
  }
};

// Helper to get user achievements from local storage
const getLocalUserAchievements = (): UserAchievement[] => {
  try {
    const stored = localStorage.getItem(USER_ACHIEVEMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving user achievements from localStorage:', error);
    return [];
  }
};

// Helper to save user achievements to local storage
const saveLocalUserAchievements = (achievements: UserAchievement[]): void => {
  try {
    localStorage.setItem(USER_ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error('Error saving user achievements to localStorage:', error);
  }
};

// Get all achievements
export const getAllAchievements = async (): Promise<Achievement[]> => {
  try {
    const response = await api.get('/api/v1/achievements');
    const achievements: Achievement[] = response.data.data;
    
    // Save to local storage for offline use
    saveLocalAchievements(achievements);
    
    return achievements;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    
    // Fallback to local storage
    return getLocalAchievements();
  }
};

// Get achievement by ID
export const getAchievementById = async (id: string): Promise<Achievement | null> => {
  try {
    const response = await api.get(`/api/v1/achievements/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching achievement ${id}:`, error);
    
    // Fallback to local storage
    const localAchievements = getLocalAchievements();
    return localAchievements.find(a => a.id === id) || null;
  }
};

// Get user achievements
export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    const response = await api.get(`/api/v1/users/${userId}/achievements`);
    const achievements: UserAchievement[] = response.data.data;
    
    // Save to local storage for offline use
    saveLocalUserAchievements(achievements);
    
    return achievements;
  } catch (error) {
    console.error(`Error fetching user achievements for ${userId}:`, error);
    
    // Fallback to local storage
    return getLocalUserAchievements();
  }
};

// Get completed achievements
export const getCompletedAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    const response = await api.get(`/api/v1/users/${userId}/achievements/completed`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching completed achievements for ${userId}:`, error);
    
    // Fallback to local storage
    const local = getLocalUserAchievements();
    return local.filter(a => a.dateUnlocked);
  }
};

// Get pending achievements
export const getPendingAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    const response = await api.get(`/api/v1/users/${userId}/achievements/pending`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching pending achievements for ${userId}:`, error);
    
    // Fallback to local storage
    const local = getLocalUserAchievements();
    return local.filter(a => !a.dateUnlocked);
  }
};

// Process user activity (which might trigger achievements)
export const processUserActivity = async (
  userId: string, 
  action: string, 
  metadata: Record<string, any> = {}
): Promise<UserAchievement[]> => {
  try {
    const response = await api.post(`/api/v1/users/${userId}/activity`, {
      action,
      metadata
    });
    
    return response.data.data.unlockedAchievements;
  } catch (error) {
    console.error(`Error processing user activity for ${userId}:`, error);
    return [];
  }
};

// Calculate achievement statistics
export const getAchievementStats = async (userId: string): Promise<AchievementStats> => {
  try {
    const [allAchievements, userAchievements] = await Promise.all([
      getAllAchievements(),
      getUserAchievements(userId)
    ]);
    
    const completed = userAchievements.filter(ua => ua.dateUnlocked);
    
    const totalPoints = allAchievements.reduce((sum, a) => sum + a.pointsValue, 0);
    const earnedPoints = completed.reduce((sum, ua) => {
      const achievement = ua.achievementId as Achievement;
      return sum + (achievement?.pointsValue || 0);
    }, 0);
    
    // Sort by unlock date, most recent first
    const recentUnlocks = [...completed]
      .sort((a, b) => {
        const dateA = a.dateUnlocked ? new Date(a.dateUnlocked).getTime() : 0;
        const dateB = b.dateUnlocked ? new Date(b.dateUnlocked).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
    
    return {
      totalAchievements: allAchievements.length,
      completedAchievements: completed.length,
      totalPoints,
      earnedPoints,
      recentUnlocks
    };
  } catch (error) {
    console.error(`Error calculating achievement stats for ${userId}:`, error);
    
    // Return default stats
    return {
      totalAchievements: 0,
      completedAchievements: 0,
      totalPoints: 0,
      earnedPoints: 0,
      recentUnlocks: []
    };
  }
};

// Helper for backward compatibility with the old achievement system
export const getMilestonesForUI = async (userId: string): Promise<any[]> => {
  try {
    const achievements = await getCompletedAchievements(userId);
    const pendingAchievements = await getPendingAchievements(userId);
    
    // Map from API format to the format expected by the UI
    const milestones = [
      ...achievements.map(ua => {
        const achievement = ua.achievementId as Achievement;
        return {
          id: ua.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          achieved: true,
          date: ua.dateUnlocked
        };
      }),
      ...pendingAchievements.map(ua => {
        const achievement = ua.achievementId as Achievement;
        return {
          id: ua.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          achieved: false
        };
      })
    ];
    
    // For backward compatibility, add these default achievements if not present
    const defaultAchievements = [
      {
        id: "1",
        title: "First Step",
        description: "Completed your first exercise",
        icon: "🎯",
        achieved: true,
        date: "2024-03-15"
      },
      {
        id: "2",
        title: "Weekly Warrior",
        description: "Completed 5 exercises in a week",
        icon: "⚡",
        achieved: true,
        date: "2024-03-16"
      },
      {
        id: "3",
        title: "Mindfulness Master",
        description: "Completed 10 meditation sessions",
        icon: "🧘",
        achieved: false
      },
      {
        id: "4",
        title: "Consistency Champion",
        description: "Used the app for 30 consecutive days",
        icon: "🏆",
        achieved: false
      }
    ];
    
    // If no achievements yet, return the default ones for UI compatibility
    if (milestones.length === 0) {
      return defaultAchievements;
    }
    
    return milestones;
  } catch (error) {
    console.error('Error getting milestones for UI:', error);
    
    // Fallback to default achievements
    return [
      {
        id: "1",
        title: "First Step",
        description: "Completed your first exercise",
        icon: "🎯",
        achieved: true,
        date: "2024-03-15"
      },
      {
        id: "2",
        title: "Weekly Warrior",
        description: "Completed 5 exercises in a week",
        icon: "⚡",
        achieved: true,
        date: "2024-03-16"
      },
      {
        id: "3",
        title: "Mindfulness Master",
        description: "Completed 10 meditation sessions",
        icon: "🧘",
        achieved: false
      },
      {
        id: "4",
        title: "Consistency Champion",
        description: "Used the app for 30 consecutive days",
        icon: "🏆",
        achieved: false
      }
    ];
  }
};
