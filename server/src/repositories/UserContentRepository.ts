
import UserContent, { IUserContent } from '../models/UserContent';
import Content from '../models/Content';
import mongoose from 'mongoose';

class UserContentRepository {
  async getUserContent(userId: string, filters: any = {}): Promise<IUserContent[]> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    return UserContent.find(query)
      .populate('contentId')
      .sort({ lastAccessed: -1 });
  }
  
  async getUserContentById(userId: string, contentId: string): Promise<IUserContent | null> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(contentId)) {
      return null;
    }
    
    return UserContent.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      contentId: new mongoose.Types.ObjectId(contentId)
    }).populate('contentId');
  }
  
  async updateUserProgress(userId: string, contentId: string, progress: number): Promise<IUserContent | null> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(contentId)) {
      return null;
    }
    
    const update: any = { 
      progress, 
      lastAccessed: new Date() 
    };
    
    // If progress is 100%, mark as completed
    if (progress === 100) {
      update.completedAt = new Date();
    }
    
    return UserContent.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        contentId: new mongoose.Types.ObjectId(contentId)
      },
      update,
      { 
        new: true,
        upsert: true
      }
    );
  }
  
  async toggleBookmark(userId: string, contentId: string): Promise<IUserContent | null> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(contentId)) {
      return null;
    }
    
    // Find existing user content record
    const userContent = await UserContent.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      contentId: new mongoose.Types.ObjectId(contentId)
    });
    
    if (userContent) {
      // Toggle bookmark status
      userContent.isBookmarked = !userContent.isBookmarked;
      userContent.lastAccessed = new Date();
      return userContent.save();
    } else {
      // Create new record with bookmark enabled
      return UserContent.create({
        userId: new mongoose.Types.ObjectId(userId),
        contentId: new mongoose.Types.ObjectId(contentId),
        isBookmarked: true,
        lastAccessed: new Date()
      });
    }
  }
  
  async getUserBookmarks(userId: string): Promise<IUserContent[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    
    return UserContent.find({
      userId: new mongoose.Types.ObjectId(userId),
      isBookmarked: true
    }).populate('contentId').sort({ lastAccessed: -1 });
  }
  
  async getRecentContent(userId: string, limit: number = 5): Promise<IUserContent[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    
    return UserContent.find({
      userId: new mongoose.Types.ObjectId(userId)
    })
    .sort({ lastAccessed: -1 })
    .limit(limit)
    .populate('contentId');
  }
  
  async getRecommendedContent(userId: string): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    
    // Get user's content history
    const userContent = await UserContent.find({
      userId: new mongoose.Types.ObjectId(userId)
    }).populate('contentId');
    
    // Extract categories from user's content
    const userCategories = new Set<string>();
    const userTypes = new Set<string>();
    const userContentIds = new Set<string>();
    
    userContent.forEach(uc => {
      if (uc.contentId) {
        const content = uc.contentId as any;
        if (content.category) {
          content.category.forEach((cat: string) => userCategories.add(cat));
        }
        if (content.type) {
          userTypes.add(content.type);
        }
        userContentIds.add(content._id.toString());
      }
    });
    
    // Get recommended content based on user's interests
    const recommendations = await Content.find({
      $and: [
        { isPublished: true },
        { _id: { $nin: Array.from(userContentIds) } }, // Exclude already viewed content
        {
          $or: [
            { category: { $in: Array.from(userCategories) } },
            { type: { $in: Array.from(userTypes) } }
          ]
        }
      ]
    }).limit(10);
    
    return recommendations;
  }
}

export default new UserContentRepository();
