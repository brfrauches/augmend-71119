
import Reflection, { IReflection } from '../models/Reflection';
import mongoose from 'mongoose';

export default class ReflectionRepository {
  // Find all reflections for a user
  async findByUser(userId: string, query: any = {}): Promise<IReflection[]> {
    const { startDate, endDate, mood, search, limit = 100, page = 1 } = query;
    
    const filter: any = { user: new mongoose.Types.ObjectId(userId) };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Add mood filter if provided
    if (mood) filter.mood = mood;
    
    // Add text search if provided
    const searchOptions = search ? { $text: { $search: search } } : {};
    
    const skip = (page - 1) * parseInt(limit);
    
    return Reflection.find({ ...filter, ...searchOptions })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();
  }
  
  // Find a reflection by ID
  async findById(id: string): Promise<IReflection | null> {
    return Reflection.findById(id).exec();
  }
  
  // Create a new reflection
  async create(data: Partial<IReflection>): Promise<IReflection> {
    return Reflection.create(data);
  }
  
  // Update a reflection
  async update(id: string, data: Partial<IReflection>): Promise<IReflection | null> {
    return Reflection.findByIdAndUpdate(id, data, { new: true }).exec();
  }
  
  // Delete a reflection
  async delete(id: string): Promise<IReflection | null> {
    return Reflection.findByIdAndDelete(id).exec();
  }
  
  // Get reflection streaks for a user
  async getStreaks(userId: string): Promise<any> {
    const reflections = await Reflection.find({ user: new mongoose.Types.ObjectId(userId) })
      .sort({ date: 1 })
      .select('date')
      .exec();
    
    // Calculate streaks (consecutive days with reflections)
    const dates = reflections.map(r => new Date(r.date).toISOString().split('T')[0]);
    const uniqueDates = [...new Set(dates)].map(d => new Date(d));
    
    const streaks: any[] = [];
    let currentStreak: any = { start: null, end: null, length: 0 };
    
    uniqueDates.forEach((date, index) => {
      if (index === 0) {
        currentStreak.start = date;
        currentStreak.end = date;
        currentStreak.length = 1;
      } else {
        const prevDate = uniqueDates[index - 1];
        const diffDays = Math.round((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Continue the streak
          currentStreak.end = date;
          currentStreak.length++;
        } else {
          // End the previous streak and start a new one
          streaks.push({ ...currentStreak });
          currentStreak = { start: date, end: date, length: 1 };
        }
      }
      
      // Add the last streak if we're at the end
      if (index === uniqueDates.length - 1) {
        streaks.push({ ...currentStreak });
      }
    });
    
    return {
      currentStreak: streaks.length > 0 ? streaks[streaks.length - 1].length : 0,
      longestStreak: streaks.reduce((max, streak) => Math.max(max, streak.length), 0),
      streaks
    };
  }
  
  // Get mood statistics for a user
  async getMoodStats(userId: string, period?: string): Promise<any> {
    const filter: any = { user: new mongoose.Types.ObjectId(userId) };
    
    // Add date filter for the specified period
    if (period) {
      const now = new Date();
      filter.date = { $gte: new Date() };
      
      switch (period) {
        case 'week':
          filter.date.$gte = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          filter.date.$gte = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          filter.date.$gte = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
    }
    
    // Group by mood and count occurrences
    const moodStats = await Reflection.aggregate([
      { $match: filter },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).exec();
    
    return moodStats.map(stat => ({
      mood: stat._id,
      count: stat.count
    }));
  }
}
