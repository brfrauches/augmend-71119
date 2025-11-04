
import UserAchievement, { IUserAchievement } from '../models/UserAchievement';
import mongoose from 'mongoose';

class UserAchievementRepository {
  async getUserAchievements(userId: string): Promise<IUserAchievement[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    
    return UserAchievement.find({ userId })
      .populate('achievementId')
      .sort({ dateUnlocked: -1 })
      .exec();
  }

  async getUserAchievementById(userId: string, achievementId: string): Promise<IUserAchievement | null> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(achievementId)) {
      return null;
    }
    
    return UserAchievement.findOne({
      userId,
      achievementId
    }).populate('achievementId').exec();
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<IUserAchievement> {
    const now = new Date();
    
    // Try to find an existing record
    const existing = await UserAchievement.findOne({ userId, achievementId });
    
    if (existing) {
      // Update the existing record
      existing.dateUnlocked = existing.dateUnlocked || now;
      existing.completionCount += 1;
      existing.lastCompleted = now;
      return existing.save();
    }
    
    // Create a new user achievement record
    const userAchievement = new UserAchievement({
      userId,
      achievementId,
      dateUnlocked: now,
      completionCount: 1,
      lastCompleted: now,
    });
    
    return userAchievement.save();
  }

  async updateProgress(userId: string, achievementId: string, progress: Record<string, any>): Promise<IUserAchievement> {
    // Try to find an existing record
    const existing = await UserAchievement.findOne({ userId, achievementId });
    
    if (existing) {
      // Update the existing progress
      existing.progress = { ...existing.progress, ...progress };
      return existing.save();
    }
    
    // Create a new user achievement record with progress
    const userAchievement = new UserAchievement({
      userId,
      achievementId,
      progress,
    });
    
    return userAchievement.save();
  }

  async getCompletedAchievements(userId: string): Promise<IUserAchievement[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    
    return UserAchievement.find({
      userId,
      dateUnlocked: { $exists: true, $ne: null }
    })
      .populate('achievementId')
      .sort({ dateUnlocked: -1 })
      .exec();
  }

  async getPendingAchievements(userId: string): Promise<IUserAchievement[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    
    return UserAchievement.find({
      userId,
      dateUnlocked: { $exists: false }
    })
      .populate('achievementId')
      .sort({ 'progress.percent': -1 })
      .exec();
  }
}

export default new UserAchievementRepository();
