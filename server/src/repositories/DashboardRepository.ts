
import { format, subDays } from 'date-fns';
import AnalyticsRepository from './AnalyticsRepository';
import UserContentRepository from './UserContentRepository';
import ContentRepository from './ContentRepository';
import UserAchievementRepository from './UserAchievementRepository';
import UserStats from '../models/UserStats';
import mongoose from 'mongoose';

export class DashboardRepository {
  private analyticsRepository: typeof AnalyticsRepository;
  private userContentRepository: typeof UserContentRepository;
  private contentRepository: typeof ContentRepository;
  private userAchievementRepository: typeof UserAchievementRepository;

  constructor() {
    this.analyticsRepository = AnalyticsRepository;
    this.userContentRepository = UserContentRepository;
    this.contentRepository = ContentRepository;
    this.userAchievementRepository = UserAchievementRepository;
  }

  async getDashboardData(userId: string): Promise<Record<string, any>> {
    const userStats = await this.analyticsRepository.calculateUserStats(userId);
    const todaysFocus = await this.getTodaysFocus(userId);
    const wellnessScoreData = await this.getWellnessScore(userId, 'daily');
    const treatmentProgress = await this.getTreatmentProgress(userId);
    const recentSessions = await this.getRecentSessions(userId);
    
    return {
      weeklyProgress: userStats.weeklyProgress,
      streak: userStats.streak,
      goalsCompleted: userStats.goalsCompleted,
      totalGoals: userStats.totalGoals,
      todaysFocus,
      wellnessScore: wellnessScoreData,
      treatmentProgress,
      recentSessions,
    };
  }

  async getTodaysFocus(userId: string): Promise<Array<Record<string, any>>> {
    // Get incomplete content with highest priority for the user
    const userContent = await this.userContentRepository.getUserContent(userId, {});
    const incompleteContent = userContent.filter(item => item.progress < 100);
    
    // If no incomplete content, get recommended content
    let focusContent;
    if (incompleteContent.length > 0) {
      focusContent = incompleteContent.slice(0, 2);
    } else {
      const allContent = await this.contentRepository.getAllContent({});
      focusContent = allContent.slice(0, 2).map(content => ({
        contentId: content,
        progress: 0,
        isBookmarked: false,
      }));
    }
    
    return focusContent.map(item => ({
      id: item.contentId._id || item.contentId.id,
      title: item.contentId.title,
      type: item.contentId.type,
      duration: `${item.contentId.duration} min`,
    }));
  }

  async getWellnessScore(userId: string, timeframe: 'daily' | 'weekly'): Promise<Record<string, any>> {
    const userStats = await UserStats.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!userStats) {
      return {
        currentScore: 75,
        data: this._generateDefaultWellnessData(timeframe),
      };
    }
    
    const today = new Date();
    const data: Array<Record<string, any>> = [];
    
    if (timeframe === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const day = subDays(today, i);
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayData = userStats.weeklyBreakdown[dateKey];
        
        data.push({
          day: format(day, 'EEE'),
          score: dayData ? dayData.wellnessScore : 75 + Math.floor(Math.random() * 15),
        });
      }
    } else {
      // Last 4 weeks
      for (let i = 0; i < 4; i++) {
        data.push({
          day: `Week ${i + 1}`,
          score: 75 + Math.floor(Math.random() * 15),
        });
      }
    }
    
    return {
      currentScore: userStats.wellnessScore || 75,
      data,
    };
  }

  private _generateDefaultWellnessData(timeframe: 'daily' | 'weekly'): Array<Record<string, any>> {
    const data: Array<Record<string, any>> = [];
    
    if (timeframe === 'daily') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      days.forEach(day => {
        data.push({
          day,
          score: 75 + Math.floor(Math.random() * 15),
        });
      });
    } else {
      for (let i = 0; i < 4; i++) {
        data.push({
          day: `Week ${i + 1}`,
          score: 75 + Math.floor(Math.random() * 15),
        });
      }
    }
    
    return data;
  }

  async getTreatmentProgress(userId: string): Promise<Array<Record<string, any>>> {
    // For now, return simulated data
    return [
      { date: 'Week 1', progress: 30 },
      { date: 'Week 2', progress: 45 },
      { date: 'Week 3', progress: 65 },
      { date: 'Week 4', progress: 85 },
    ];
  }

  async getRecentSessions(userId: string): Promise<Array<Record<string, any>>> {
    const recentLogs = await this.analyticsRepository.getUserActivityLogs(userId, {
      limit: 5,
    });
    
    return recentLogs.map(log => ({
      id: log._id,
      activityType: log.activityType,
      timestamp: log.timestamp,
      duration: log.duration || 0,
      details: log.details,
    }));
  }
}

export default new DashboardRepository();
