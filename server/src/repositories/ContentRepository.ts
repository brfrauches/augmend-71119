
import Content, { IContent } from '../models/Content';
import mongoose from 'mongoose';

class ContentRepository {
  async getAllContent(filters: any = {}): Promise<IContent[]> {
    const query: any = { isPublished: true };
    
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.category) {
      query.category = { $in: [filters.category] };
    }
    
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }
    
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } }
      ];
    }
    
    return Content.find(query).sort({ createdAt: -1 });
  }
  
  async getContentById(id: string): Promise<IContent | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Content.findById(id);
  }
  
  async getContentByCategory(category: string): Promise<IContent[]> {
    return Content.find({ 
      category: { $in: [category] },
      isPublished: true 
    }).sort({ createdAt: -1 });
  }
  
  async getContentByType(type: string): Promise<IContent[]> {
    return Content.find({ 
      type,
      isPublished: true 
    }).sort({ createdAt: -1 });
  }
  
  async searchContent(query: string): Promise<IContent[]> {
    return Content.find({
      $and: [
        { isPublished: true },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
          ]
        }
      ]
    }).sort({ createdAt: -1 });
  }
  
  async createContent(data: Partial<IContent>): Promise<IContent> {
    const content = new Content(data);
    return content.save();
  }
  
  async updateContent(id: string, data: Partial<IContent>): Promise<IContent | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Content.findByIdAndUpdate(id, data, { new: true });
  }
  
  async deleteContent(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await Content.findByIdAndDelete(id);
    return !!result;
  }
}

export default new ContentRepository();
