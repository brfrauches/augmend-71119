
import { Request, Response } from 'express';
import ContentService from '../services/contentService';
import logger from '../config/logger';

class ContentController {
  // Get all content with filtering
  async getAllContent(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const content = await ContentService.getAllContent(filters);
      res.status(200).json(content);
    } catch (error) {
      logger.error('Error fetching content:', error);
      res.status(500).json({ message: 'Error fetching content' });
    }
  }

  // Get content by ID
  async getContentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const content = await ContentService.getContentById(id);
      
      if (!content) {
        res.status(404).json({ message: 'Content not found' });
        return;
      }
      
      res.status(200).json(content);
    } catch (error) {
      logger.error(`Error fetching content with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Error fetching content' });
    }
  }

  // Get content by category
  async getContentByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const content = await ContentService.getContentByCategory(category);
      res.status(200).json(content);
    } catch (error) {
      logger.error(`Error fetching content for category ${req.params.category}:`, error);
      res.status(500).json({ message: 'Error fetching content by category' });
    }
  }

  // Get content by type
  async getContentByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const content = await ContentService.getContentByType(type);
      res.status(200).json(content);
    } catch (error) {
      logger.error(`Error fetching content for type ${req.params.type}:`, error);
      res.status(500).json({ message: 'Error fetching content by type' });
    }
  }

  // Get content categories
  async getContentCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await ContentService.getContentCategories();
      res.status(200).json(categories);
    } catch (error) {
      logger.error('Error fetching content categories:', error);
      res.status(500).json({ message: 'Error fetching content categories' });
    }
  }

  // Get content types
  async getContentTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = await ContentService.getContentTypes();
      res.status(200).json(types);
    } catch (error) {
      logger.error('Error fetching content types:', error);
      res.status(500).json({ message: 'Error fetching content types' });
    }
  }

  // Create new content
  async createContent(req: Request, res: Response): Promise<void> {
    try {
      const content = await ContentService.createContent(req.body);
      res.status(201).json(content);
    } catch (error) {
      logger.error('Error creating content:', error);
      res.status(500).json({ message: 'Error creating content' });
    }
  }

  // Update existing content
  async updateContent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const content = await ContentService.updateContent(id, req.body);
      
      if (!content) {
        res.status(404).json({ message: 'Content not found' });
        return;
      }
      
      res.status(200).json(content);
    } catch (error) {
      logger.error(`Error updating content with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Error updating content' });
    }
  }

  // Delete content
  async deleteContent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ContentService.deleteContent(id);
      
      if (!result) {
        res.status(404).json({ message: 'Content not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting content with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Error deleting content' });
    }
  }

  // Get user content
  async getUserContent(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const filters = req.query;
      const content = await ContentService.getUserContent(userId, filters);
      res.status(200).json(content);
    } catch (error) {
      logger.error(`Error fetching content for user ${req.params.userId}:`, error);
      res.status(500).json({ message: 'Error fetching user content' });
    }
  }

  // Update user progress
  async updateUserProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId, contentId } = req.params;
      const { progress } = req.body;
      
      if (progress === undefined || progress < 0 || progress > 100) {
        res.status(400).json({ message: 'Invalid progress value' });
        return;
      }
      
      const result = await ContentService.updateUserProgress(userId, contentId, progress);
      
      if (!result) {
        res.status(404).json({ message: 'User or content not found' });
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error(`Error updating progress for user ${req.params.userId} on content ${req.params.contentId}:`, error);
      res.status(500).json({ message: 'Error updating progress' });
    }
  }

  // Toggle bookmark
  async toggleBookmark(req: Request, res: Response): Promise<void> {
    try {
      const { userId, contentId } = req.params;
      const result = await ContentService.toggleBookmark(userId, contentId);
      
      if (!result) {
        res.status(404).json({ message: 'User or content not found' });
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error(`Error toggling bookmark for user ${req.params.userId} on content ${req.params.contentId}:`, error);
      res.status(500).json({ message: 'Error toggling bookmark' });
    }
  }

  // Get user bookmarks
  async getUserBookmarks(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const bookmarks = await ContentService.getUserBookmarks(userId);
      res.status(200).json(bookmarks);
    } catch (error) {
      logger.error(`Error fetching bookmarks for user ${req.params.userId}:`, error);
      res.status(500).json({ message: 'Error fetching bookmarks' });
    }
  }

  // Get recent content
  async getRecentContent(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const content = await ContentService.getRecentContent(userId, limit);
      res.status(200).json(content);
    } catch (error) {
      logger.error(`Error fetching recent content for user ${req.params.userId}:`, error);
      res.status(500).json({ message: 'Error fetching recent content' });
    }
  }

  // Get recommended content
  async getRecommendedContent(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const content = await ContentService.getRecommendedContent(userId);
      res.status(200).json(content);
    } catch (error) {
      logger.error(`Error fetching recommendations for user ${req.params.userId}:`, error);
      res.status(500).json({ message: 'Error fetching recommendations' });
    }
  }
}

export default new ContentController();
