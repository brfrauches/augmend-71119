
import { IAchievement } from '../models/Achievement';
import { IUserAchievement } from '../models/UserAchievement';
import AchievementRepository from '../repositories/AchievementRepository';
import UserAchievementRepository from '../repositories/UserAchievementRepository';
import { format, subDays, isWithinInterval } from 'date-fns';

class AchievementService {
  // Achievement management
  async getAllAchievements(): Promise<IAchievement[]> {
    return AchievementRepository.getAllAchievements();
  }

  async getAchievementById(id: string): Promise<IAchievement | null> {
    return AchievementRepository.getAchievementById(id);
  }

  async createAchievement(data: Partial<IAchievement>): Promise<IAchievement> {
    return AchievementRepository.createAchievement(data);
  }

  async updateAchievement(id: string, data: Partial<IAchievement>): Promise<IAchievement | null> {
    return AchievementRepository.updateAchievement(id, data);
  }

  async deleteAchievement(id: string): Promise<boolean> {
    return AchievementRepository.deleteAchievement(id);
  }

  // User achievement management
  async getUserAchievements(userId: string): Promise<IUserAchievement[]> {
    return UserAchievementRepository.getUserAchievements(userId);
  }

  async getUserAchievementById(userId: string, achievementId: string): Promise<IUserAchievement | null> {
    return UserAchievementRepository.getUserAchievementById(userId, achievementId);
  }

  async getCompletedAchievements(userId: string): Promise<IUserAchievement[]> {
    return UserAchievementRepository.getCompletedAchievements(userId);
  }

  async getPendingAchievements(userId: string): Promise<IUserAchievement[]> {
    return UserAchievementRepository.getPendingAchievements(userId);
  }

  // Achievement criteria evaluation
  async checkAndProcessAchievements(userId: string, action: string, metadata: Record<string, any> = {}): Promise<IUserAchievement[]> {
    const achievements = await AchievementRepository.getAllAchievements();
    const unlockedAchievements: IUserAchievement[] = [];
    
    for (const achievement of achievements) {
      if (await this.evaluateAchievementCriteria(userId, achievement, action, metadata)) {
        const userAchievement = await UserAchievementRepository.unlockAchievement(userId, achievement._id.toString());
        unlockedAchievements.push(userAchievement);
      }
    }
    
    return unlockedAchievements;
  }

  private async evaluateAchievementCriteria(
    userId: string, 
    achievement: IAchievement, 
    action: string, 
    metadata: Record<string, any>
  ): Promise<boolean> {
    const { criteria } = achievement;
    
    // Skip if action doesn't match what this achievement is looking for
    if (criteria.action && criteria.action !== action) {
      return false;
    }
    
    // Check if user can earn this achievement again (if repeatable)
    const existingAchievement = await UserAchievementRepository.getUserAchievementById(
      userId, 
      achievement._id.toString()
    );
    
    if (existingAchievement?.dateUnlocked) {
      // Already unlocked, check if repeatable
      if (!achievement.isRepeatable) {
        return false;
      }
      
      // Check cooldown period
      if (achievement.cooldownPeriod > 0 && existingAchievement.lastCompleted) {
        const cooldownEndDate = new Date(existingAchievement.lastCompleted);
        cooldownEndDate.setDate(cooldownEndDate.getDate() + achievement.cooldownPeriod);
        
        if (new Date() < cooldownEndDate) {
          return false; // Still in cooldown period
        }
      }
    }
    
    // Evaluate based on achievement category
    switch (achievement.category) {
      case 'STREAK':
        return this.evaluateStreakAchievement(userId, achievement, metadata);
      case 'COUNT':
        return this.evaluateCountAchievement(userId, achievement, action, metadata);
      case 'MILESTONE':
        return this.evaluateMilestoneAchievement(userId, achievement, metadata);
      case 'SPECIAL':
        return this.evaluateSpecialAchievement(userId, achievement, action, metadata);
      default:
        return false;
    }
  }

  private async evaluateStreakAchievement(
    userId: string,
    achievement: IAchievement,
    metadata: Record<string, any>
  ): Promise<boolean> {
    // Implementation for streak-based achievements
    if (metadata.streakDays && achievement.criteria.requiredStreakDays) {
      return metadata.streakDays >= achievement.criteria.requiredStreakDays;
    }
    return false;
  }

  private async evaluateCountAchievement(
    userId: string,
    achievement: IAchievement,
    action: string,
    metadata: Record<string, any>
  ): Promise<boolean> {
    // Implementation for count-based achievements
    // For example: "Complete 5 reflections in a week"
    
    if (!achievement.criteria.requiredCount) {
      return false;
    }
    
    const currentProgress = await this.getActionCount(userId, action, achievement.criteria.timeframe);
    
    // Update progress
    const userAchievement = await UserAchievementRepository.getUserAchievementById(
      userId, 
      achievement._id.toString()
    ) || { progress: {} };
    
    await UserAchievementRepository.updateProgress(
      userId, 
      achievement._id.toString(), 
      { 
        count: currentProgress,
        percent: Math.min(100, (currentProgress / achievement.criteria.requiredCount) * 100)
      }
    );
    
    return currentProgress >= achievement.criteria.requiredCount;
  }

  private async evaluateMilestoneAchievement(
    userId: string,
    achievement: IAchievement,
    metadata: Record<string, any>
  ): Promise<boolean> {
    // Implementation for milestone-based achievements
    // For example: "Reach 50 total reflections"
    
    if (!metadata.totalCount || !achievement.criteria.requiredTotal) {
      return false;
    }
    
    // Update progress
    await UserAchievementRepository.updateProgress(
      userId, 
      achievement._id.toString(), 
      { 
        count: metadata.totalCount,
        percent: Math.min(100, (metadata.totalCount / achievement.criteria.requiredTotal) * 100)
      }
    );
    
    return metadata.totalCount >= achievement.criteria.requiredTotal;
  }

  private async evaluateSpecialAchievement(
    userId: string,
    achievement: IAchievement,
    action: string,
    metadata: Record<string, any>
  ): Promise<boolean> {
    // Implementation for special achievements
    // For example: "First reflection"
    
    if (achievement.criteria.specialType === 'FIRST_ACTION') {
      return action === achievement.criteria.action;
    }
    
    return false;
  }

  private async getActionCount(userId: string, action: string, timeframe?: string): Promise<number> {
    // This would typically query your action logs or related collections
    // For demonstration, using a simpler approach
    
    // For example, if tracking reflection completions:
    if (action === 'COMPLETE_REFLECTION') {
      // Implementation would depend on your database structure
      const today = new Date();
      let startDate: Date;
      
      switch (timeframe) {
        case 'DAY':
          startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'WEEK':
          startDate = subDays(today, 7);
          break;
        case 'MONTH':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        default:
          // No timeframe, count all
          return 1; // Simplified for this example
      }
      
      // Implementation would depend on your actual data model
      // This is a placeholder that should be replaced with actual query
      return 5; // Placeholder count
    }
    
    return 0;
  }
}

export default new AchievementService();
