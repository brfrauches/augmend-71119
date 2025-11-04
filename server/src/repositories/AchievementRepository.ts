
import Achievement, { IAchievement } from '../models/Achievement';
import mongoose from 'mongoose';

class AchievementRepository {
  async getAllAchievements(): Promise<IAchievement[]> {
    return Achievement.find({}).sort({ category: 1, pointsValue: 1 }).exec();
  }

  async getAchievementById(id: string): Promise<IAchievement | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Achievement.findById(id).exec();
  }

  async getAchievementsByCategory(category: string): Promise<IAchievement[]> {
    return Achievement.find({ category }).sort({ pointsValue: 1 }).exec();
  }

  async createAchievement(data: Partial<IAchievement>): Promise<IAchievement> {
    const achievement = new Achievement(data);
    return achievement.save();
  }

  async updateAchievement(id: string, data: Partial<IAchievement>): Promise<IAchievement | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Achievement.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteAchievement(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await Achievement.findByIdAndDelete(id).exec();
    return !!result;
  }
}

export default new AchievementRepository();
