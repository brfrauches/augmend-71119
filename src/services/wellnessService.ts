
import api from './api';
import { toast } from 'sonner';

const RESOURCE_URL = '/wellness';

export interface BreathingSession {
  duration: number; // in seconds
  completedBreaths: number;
}

export interface MoodEntry {
  mood: string;
  timestamp: string;
}

export interface BreathingStats {
  totalSessions: number;
  totalMinutes: number;
  totalBreaths: number;
}

export interface SleepData {
  date: string;
  hoursSlept: number;
  quality: number; // 1-10 scale
}

export interface MeditationSession {
  date: string;
  duration: number; // in minutes
  type: string; // guided, unguided, etc.
}

export interface WellnessStats {
  breathingStats: BreathingStats;
  averageSleepHours: number;
  totalMeditationMinutes: number;
  moodTrend: string;
}

// Record a mood entry
export const recordMood = async (mood: string): Promise<boolean> => {
  try {
    const response = await api.post(`${RESOURCE_URL}/mood`, { mood });
    
    // Notify the user on successful save
    toast.success("Mood recorded successfully");
    
    return true;
  } catch (error) {
    console.error('Error recording mood:', error);
    
    // Notify the user of failure
    toast.error("Failed to record mood. Please try again.");
    
    return false;
  }
};

// Record a breathing session
export const recordBreathingSession = async (
  duration: number,
  completedBreaths: number
): Promise<boolean> => {
  try {
    await api.post(`${RESOURCE_URL}/breathing-session`, {
      duration,
      completedBreaths
    });
    
    toast.success("Breathing session recorded");
    return true;
  } catch (error) {
    console.error('Error recording breathing session:', error);
    toast.error("Failed to save breathing session");
    return false;
  }
};

// Get recent mood entries
export const getRecentMoods = async (limit: number = 5): Promise<MoodEntry[]> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/moods/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent moods:', error);
    toast.error("Unable to load recent moods");
    return [];
  }
};

// Get breathing statistics
export const getBreathingStats = async (): Promise<BreathingStats> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/breathing/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching breathing stats:', error);
    return {
      totalSessions: 0,
      totalMinutes: 0,
      totalBreaths: 0
    };
  }
};

// Record sleep data
export const recordSleepData = async (hoursSlept: number, quality: number): Promise<boolean> => {
  try {
    await api.post(`${RESOURCE_URL}/sleep`, {
      hoursSlept,
      quality,
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    });
    
    toast.success("Sleep data recorded");
    return true;
  } catch (error) {
    console.error('Error recording sleep data:', error);
    toast.error("Failed to save sleep data");
    return false;
  }
};

// Get sleep history
export const getSleepHistory = async (days: number = 7): Promise<SleepData[]> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/sleep/history?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sleep history:', error);
    // Return some mock data if the API is not available
    const mockData: SleepData[] = [];
    const today = new Date();
    
    // Generate mock data for the past 'days' days
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        hoursSlept: 6 + Math.random() * 3, // Random hours between 6-9
        quality: 5 + Math.floor(Math.random() * 5) // Random quality between 5-10
      });
    }
    
    return mockData.reverse(); // Return in chronological order
  }
};

// Record meditation session
export const recordMeditationSession = async (
  duration: number,
  type: string
): Promise<boolean> => {
  try {
    await api.post(`${RESOURCE_URL}/meditation`, {
      duration,
      type,
      date: new Date().toISOString()
    });
    
    toast.success("Meditation session recorded");
    return true;
  } catch (error) {
    console.error('Error recording meditation session:', error);
    toast.error("Failed to save meditation session");
    return false;
  }
};

// Get meditation history
export const getMeditationHistory = async (limit: number = 10): Promise<MeditationSession[]> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/meditation/history?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meditation history:', error);
    
    // Return some mock data if the API is not available
    const mockData: MeditationSession[] = [];
    const today = new Date();
    
    // Generate mock data for the past 'limit' days
    const types = ["guided", "unguided", "focus", "body scan", "mindfulness"];
    
    for (let i = 0; i < limit; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      mockData.push({
        date: date.toISOString(),
        duration: 5 + Math.floor(Math.random() * 20), // 5-25 minutes
        type: types[Math.floor(Math.random() * types.length)]
      });
    }
    
    return mockData;
  }
};

// Get overall wellness stats
export const getWellnessStats = async (): Promise<WellnessStats> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wellness stats:', error);
    
    // If API fails, try to compute stats from individual endpoints
    try {
      const breathingStats = await getBreathingStats();
      const sleepData = await getSleepHistory(14); // 2 weeks
      const meditationData = await getMeditationHistory();
      
      // Calculate average sleep
      const totalSleep = sleepData.reduce((acc, day) => acc + day.hoursSlept, 0);
      const avgSleep = sleepData.length > 0 ? totalSleep / sleepData.length : 0;
      
      // Calculate total meditation minutes
      const totalMeditationMins = meditationData.reduce((acc, session) => 
        acc + session.duration, 0);
      
      return {
        breathingStats,
        averageSleepHours: avgSleep,
        totalMeditationMinutes: totalMeditationMins,
        moodTrend: 'neutral' // Default without mood data
      };
    } catch (innerError) {
      console.error('Error computing fallback stats:', innerError);
      
      // Final fallback
      return {
        breathingStats: {
          totalSessions: 0,
          totalMinutes: 0,
          totalBreaths: 0
        },
        averageSleepHours: 0,
        totalMeditationMinutes: 0,
        moodTrend: 'neutral'
      };
    }
  }
};
