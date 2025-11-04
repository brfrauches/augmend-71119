
import AnalyticsRepository from '../repositories/AnalyticsRepository';
import { IActivityLog } from '../models/ActivityLog';
import { IUserStats } from '../models/UserStats';
import { format, subDays } from 'date-fns';

export class AnalyticsService {
  private analyticsRepository: typeof AnalyticsRepository;

  constructor() {
    this.analyticsRepository = AnalyticsRepository;
  }

  async logActivity(
    userId: string,
    activityType: IActivityLog['activityType'],
    details: Record<string, any>,
    duration?: number
  ): Promise<IActivityLog> {
    return await this.analyticsRepository.logUserActivity(
      userId,
      activityType,
      details,
      duration
    );
  }

  async getUserStats(userId: string): Promise<IUserStats> {
    return await this.analyticsRepository.calculateUserStats(userId);
  }

  async getActivityLogs(
    userId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      activityType?: IActivityLog['activityType'];
      limit?: number;
    } = {}
  ): Promise<IActivityLog[]> {
    return await this.analyticsRepository.getUserActivityLogs(userId, filters);
  }

  async getWeeklyProgress(userId: string): Promise<number> {
    return await this.analyticsRepository.getWeeklyProgress(userId);
  }

  async getCurrentStreak(userId: string): Promise<number> {
    return await this.analyticsRepository.getCurrentStreak(userId);
  }

  async getWellnessData(userId: string, timeframe: 'daily' | 'weekly'): Promise<any> {
    const today = new Date();
    const startDate = timeframe === 'daily' 
      ? subDays(today, 6) 
      : subDays(today, 28);
    
    const dailyBreakdown = await this.analyticsRepository.getDailyBreakdown(
      userId,
      startDate,
      today
    );
    
    if (timeframe === 'daily') {
      return Object.entries(dailyBreakdown).map(([date, data]) => ({
        day: format(new Date(date), 'EEE'),
        score: (data as any).wellnessScore,
      }));
    } else {
      // Group by week
      const weeklyData: Record<string, any> = {};
      Object.entries(dailyBreakdown).forEach(([date, data]) => {
        const weekNumber = Math.ceil(
          (new Date(date).getDate() - 1 + new Date(date).getDay()) / 7
        );
        const weekKey = `Week ${weekNumber}`;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            totalScore: 0,
            count: 0,
          };
        }
        
        weeklyData[weekKey].totalScore += (data as any).wellnessScore;
        weeklyData[weekKey].count += 1;
      });
      
      return Object.entries(weeklyData).map(([week, data]) => ({
        day: week,
        score: Math.round((data as any).totalScore / (data as any).count),
      }));
    }
  }
}

export default new AnalyticsService();
