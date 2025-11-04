
import ContentRepository from '../repositories/ContentRepository';
import UserContentRepository from '../repositories/UserContentRepository';
import { IContent } from '../models/Content';
import { IUserContent } from '../models/UserContent';

class ContentService {
  async getAllContent(filters?: any): Promise<IContent[]> {
    return ContentRepository.getAllContent(filters);
  }

  async getContentById(id: string): Promise<IContent | null> {
    return ContentRepository.getContentById(id);
  }

  async getContentByCategory(category: string): Promise<IContent[]> {
    return ContentRepository.getContentByCategory(category);
  }

  async getContentByType(type: string): Promise<IContent[]> {
    return ContentRepository.getContentByType(type);
  }

  async searchContent(query: string): Promise<IContent[]> {
    return ContentRepository.searchContent(query);
  }

  async createContent(data: Partial<IContent>): Promise<IContent> {
    return ContentRepository.createContent(data);
  }

  async updateContent(id: string, data: Partial<IContent>): Promise<IContent | null> {
    return ContentRepository.updateContent(id, data);
  }

  async deleteContent(id: string): Promise<boolean> {
    return ContentRepository.deleteContent(id);
  }

  async getUserContent(userId: string, filters?: any): Promise<IUserContent[]> {
    return UserContentRepository.getUserContent(userId, filters);
  }

  async updateUserProgress(userId: string, contentId: string, progress: number): Promise<IUserContent | null> {
    return UserContentRepository.updateUserProgress(userId, contentId, progress);
  }

  async toggleBookmark(userId: string, contentId: string): Promise<IUserContent | null> {
    return UserContentRepository.toggleBookmark(userId, contentId);
  }

  async getUserBookmarks(userId: string): Promise<IUserContent[]> {
    return UserContentRepository.getUserBookmarks(userId);
  }

  async getRecentContent(userId: string, limit: number = 5): Promise<IUserContent[]> {
    return UserContentRepository.getRecentContent(userId, limit);
  }

  async getRecommendedContent(userId: string): Promise<any[]> {
    return UserContentRepository.getRecommendedContent(userId);
  }

  async getContentCategories(): Promise<string[]> {
    const contents = await ContentRepository.getAllContent();
    const categories = new Set<string>();
    
    contents.forEach(content => {
      if (content.category) {
        content.category.forEach(cat => categories.add(cat));
      }
    });
    
    return Array.from(categories).sort();
  }

  async getContentTypes(): Promise<string[]> {
    const contents = await ContentRepository.getAllContent();
    const types = new Set<string>();
    
    contents.forEach(content => {
      if (content.type) {
        types.add(content.type);
      }
    });
    
    return Array.from(types).sort();
  }
}

export default new ContentService();
