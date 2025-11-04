
import ActivityLog, { IActivityLog } from '../models/ActivityLog';
import UserStats, { IUserStats } from '../models/UserStats';
import { startOfDay, subDays, format, parseISO } from 'date-fns';
import mongoose from 'mongoose';

export class AnalyticsRepository {
  async logUserActivity(
    userId: string,
    activityType: IActivityLog['activityType'],
    details: Record<string, any>,
    duration?: number
  ): Promise<IActivityLog> {
    const newLog = new ActivityLog({
      userId,
      activityType,
      details,
      duration,
      timestamp: new Date(),
    });

    return await newLog.save();
  }

  async getUserActivityLogs(
    userId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      activityType?: IActivityLog['activityType'];
      limit?: number;
    } = {}
  ): Promise<IActivityLog[]> {
    const { startDate, endDate, activityType, limit = 10 } = filters;
    
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }
    
    if (activityType) {
      query.activityType = activityType;
    }
    
    return await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async calculateUserStats(userId: string): Promise<IUserStats> {
    let userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      userStats = new UserStats({
        userId,
        weeklyProgress: 0,
        streak: 0,
        goalsCompleted: 0,
        totalGoals: 15,
        lastCalculated: new Date(),
        weeklyBreakdown: {},
        contentProgress: {
          article: 0,
          video: 0,
          exercise: 0,
          audio: 0,
        },
      });
    }

    // Calculate weekly breakdown
    const today = new Date();
    const sevenDaysAgo = subDays(today, 6);
    const logs = await this.getUserActivityLogs(userId, {
      startDate: sevenDaysAgo,
      endDate: today,
    });

    const weeklyBreakdown: Record<string, any> = {};
    
    // Initialize days
    for (let i = 0; i <= 6; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      weeklyBreakdown[date] = {
        activities: 0,
        duration: 0,
        wellnessScore: 75 + Math.floor(Math.random() * 15), // Simulated score for now
      };
    }

    // Populate with actual data
    logs.forEach(log => {
      const date = format(log.timestamp, 'yyyy-MM-dd');
      if (weeklyBreakdown[date]) {
        weeklyBreakdown[date].activities += 1;
        if (log.duration) {
          weeklyBreakdown[date].duration += log.duration;
        }
      }
    });

    // Calculate streak
    let streak = 0;
    for (let i = 0; i <= 30; i++) { // Check last 30 days maximum
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const dayLogs = await ActivityLog.find({
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: {
          $gte: startOfDay(parseISO(date)),
          $lt: startOfDay(parseISO(date + 'T23:59:59')),
        },
      });
      
      if (dayLogs.length > 0) {
        streak += 1;
      } else if (i > 0) { // If it's not today and no activity, break the streak
        break;
      }
    }

    // Update stats
    userStats.weeklyProgress = Math.min(100, Math.floor(Math.random() * 100)); // Simulated for now
    userStats.streak = streak;
    userStats.weeklyBreakdown = weeklyBreakdown;
    userStats.lastCalculated = new Date();
    
    return await userStats.save();
  }

  async getWeeklyProgress(userId: string): Promise<number> {
    const userStats = await this.calculateUserStats(userId);
    return userStats.weeklyProgress;
  }

  async getCurrentStreak(userId: string): Promise<number> {
    const userStats = await this.calculateUserStats(userId);
    return userStats.streak;
  }

  async getDailyBreakdown(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    const userStats = await this.calculateUserStats(userId);
    
    const result: Record<string, any> = {};
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      result[dateKey] = userStats.weeklyBreakdown[dateKey] || {
        activities: 0,
        duration: 0,
        wellnessScore: 75,
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  }
}

export default new AnalyticsRepository();
