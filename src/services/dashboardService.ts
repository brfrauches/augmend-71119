
import api, { handleApiError } from './api';
import { toast } from "@/hooks/use-toast";

// Define types for dashboard data
export interface WellnessScoreData {
  day: string;
  score: number;
}

export interface TreatmentProgressData {
  date: string;
  progress: number;
}

export interface FocusItem {
  id: string;
  title: string;
  type: string;
  duration: string;
}

export interface DashboardData {
  weeklyProgress: number;
  streak: number;
  goalsCompleted: number;
  totalGoals: number;
  todaysFocus: FocusItem[];
  wellnessScore: {
    currentScore: number;
    data: WellnessScoreData[];
  };
  treatmentProgress: TreatmentProgressData[];
  recentSessions: any[];
}

// Fetch dashboard data
export const fetchDashboardData = async (userId?: string): Promise<DashboardData> => {
  try {
    const endpoint = userId ? `/dashboard/${userId}` : '/dashboard';
    const response = await api.get(endpoint);
    return response.data.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    toast({
      title: "Error fetching dashboard data",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};

// Fetch wellness score
export const fetchWellnessScore = async (userId: string, timeframe: 'daily' | 'weekly'): Promise<{
  currentScore: number;
  data: WellnessScoreData[];
}> => {
  try {
    const response = await api.get(`/dashboard/${userId}/wellness-score`, {
      params: { timeframe }
    });
    return response.data.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    toast({
      title: "Error fetching wellness score",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};

// Fetch treatment progress
export const fetchTreatmentProgress = async (userId: string): Promise<TreatmentProgressData[]> => {
  try {
    const response = await api.get(`/dashboard/${userId}/treatment-progress`);
    return response.data.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    toast({
      title: "Error fetching treatment progress",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};

// Fetch today's focus
export const fetchTodaysFocus = async (userId: string): Promise<FocusItem[]> => {
  try {
    const response = await api.get(`/dashboard/${userId}/focus`);
    return response.data.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    toast({
      title: "Error fetching today's focus",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};

// Fetch recent sessions
export const fetchRecentSessions = async (userId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/dashboard/${userId}/recent-sessions`);
    return response.data.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    toast({
      title: "Error fetching recent sessions",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};

// Update progress dashboard component to use the API data
export const updateProgressDashboard = () => {
  return fetchDashboardData();
};

// Fallback data in case the API fails
export const getFallbackDashboardData = (): DashboardData => {
  return {
    weeklyProgress: 85,
    streak: 7,
    goalsCompleted: 12,
    totalGoals: 15,
    todaysFocus: [
      {
        id: "1",
        title: "Morning Mindfulness",
        type: "meditation",
        duration: "10 min"
      },
      {
        id: "2",
        title: "Stress Relief Exercise",
        type: "exercise",
        duration: "15 min"
      }
    ],
    wellnessScore: {
      currentScore: 85,
      data: [
        { day: 'Mon', score: 75 },
        { day: 'Tue', score: 82 },
        { day: 'Wed', score: 78 },
        { day: 'Thu', score: 85 },
        { day: 'Fri', score: 80 },
        { day: 'Sat', score: 88 },
        { day: 'Sun', score: 85 }
      ]
    },
    treatmentProgress: [
      { date: 'Week 1', progress: 30 },
      { date: 'Week 2', progress: 45 },
      { date: 'Week 3', progress: 65 },
      { date: 'Week 4', progress: 85 }
    ],
    recentSessions: []
  };
};
