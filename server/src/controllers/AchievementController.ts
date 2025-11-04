
import { Request, Response } from 'express';
import AchievementService from '../services/AchievementService';
import { handleApiError } from '../middleware/errorHandler';

class AchievementController {
  // Achievement management
  async getAllAchievements(req: Request, res: Response): Promise<void> {
    try {
      const achievements = await AchievementService.getAllAchievements();
      res.status(200).json({ 
        success: true, 
        data: achievements 
      });
    } catch (error) {
      handleApiError(error, req, res);
    }
  }

  async getAchievementById(req: Request, res: Response): Promise<void> {
    try {
      const achievement = await AchievementService.getAchievementById(req.params.id);
      
      if (!achievement) {
        res.status(404).json({ 
          success: false, 
          message: 'Achievement not found' 
        });
        return;
      }
      
      res.status(200).json({ 
        success: true, 
        data: achievement 
      });
    } catch (error) {
      handleApiError(error, req, res);
    }
  }

  async createAchievement(req: Request, res: Response): Promise<void> {
    try {
      // Validate admin role here if needed
      const achievement = await AchievementService.createAchievement(req.body);
      res.status(201).json({ 
        success: true, 
        data: achievement 
      });
    } catch (error) {
      handleApiError(error, req, res);
    }
  }

  async updateAchievement(req: Request, res: Response): Promise<void> {
    try {
      // Validate admin role here if needed
      const achievement = await AchievementService.updateAchievement(req.params.id, req.body);
      
      if (!achievement) {
        res.status(404).json({ 
          success: false, 
          message: 'Achievement not found' 
        });
        return;
      }
      
      res.status(200).json({ 
        success: true, 
        data: achievement 
      });
    } catch (error) {
      handleApiError(error, req, res);
    }
  }

  async deleteAchievement(req: Request, res: Response): Promise<void> {
    try {
      // Validate admin role here if needed
      const deleted = await AchievementService.deleteAchievement(req.params.id);
      
      if (!deleted) {
        res.status(404).json({ 
          success: false, 
          message: 'Achievement not found' 
        });
        return;
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Achievement deleted successfully' 
      });
    } catch (error) {
      handleApiError(error, req, res);
    }
  }

  // User achievement endpoints
  async getUserAchievements(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const achievements = await AchievementService.getUserAchievements(userId);
      
      res.status(200).json({ 
        success: true, 
        data: achievements 
      });
    } catch (error) {
      handleApiError(error, req, res);
    }
  }

  async getCompletedAchievements(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const achievements = await AchievementService.getCompletedAchievements(userId);
      
      res.status(200).json({ 
        success: true, 
        data: achievements 
      });
    } catch (error) {
      handleApiError(error, req, res);
    }
  }

  async getPendingAchievements(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const achievements = await AchievementService.getPendingAchievements(userId);
      
      res.status(200).json({ 
        success: true, 
        data: achievements 
      });
    } catch (error) {
      handleApiError(error, req, res);
    }
  }

  async processUserActivity(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { action, metadata } = req.body;
      
      if (!action) {
        res.status(400).json({
          success: false,
          message: 'Action is required'
        });
        return;
      }
      
      const unlockedAchievements = await AchievementService.checkAndProcessAchievements(
        userId,
        action,
        metadata
      );
      
      res.status(200).json({
        success: true,
        data: {
          unlockedAchievements,
          totalUnlocked: unlockedAchievements.length
        }
      });
    } catch (error) {
      handleApiError(error, req, res);
    }
  }

  async updateAchievementProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId, achievementId } = req.params;
      const { progress } = req.body;
      
      if (!progress) {
        res.status(400).json({
          success: false,
          message: 'Progress data is required'
        });
        return;
      }
      
      const userAchievement = await AchievementService.getUserAchievementById(userId, achievementId);
      
      if (!userAchievement) {
        res.status(404).json({
          success: false,
          message: 'User achievement not found'
        });
        return;
      }
      
      // This would typically be an admin-only or system endpoint
      // Add authorization checks as needed
      
      const updatedAchievement = await AchievementService.updateAchievement(achievementId, { progress });
      
      res.status(200).json({
        success: true,
        data: updatedAchievement
      });
    } catch (error) {
      handleApiError(error, req, res);
    }
  }
}

export default new AchievementController();
