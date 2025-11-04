
import { Request, Response, NextFunction } from 'express';
import ReflectionService from '../services/ReflectionService';
import { logger } from '../config/logger';

export default class ReflectionController {
  private service: ReflectionService;
  
  constructor() {
    this.service = new ReflectionService();
  }
  
  // Get all reflections for the authenticated user
  getReflections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const reflections = await this.service.getReflections(userId, req.query);
      
      return res.status(200).json(reflections);
    } catch (error) {
      logger.error('Error fetching reflections:', error);
      next(error);
    }
  };
  
  // Get a single reflection by ID
  getReflectionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const reflection = await this.service.getReflectionById(id);
      
      if (!reflection) {
        return res.status(404).json({ message: 'Reflection not found' });
      }
      
      // Ensure the reflection belongs to the authenticated user
      if (reflection.user.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to access this reflection' });
      }
      
      return res.status(200).json(reflection);
    } catch (error) {
      logger.error(`Error fetching reflection ${req.params.id}:`, error);
      next(error);
    }
  };
  
  // Create a new reflection
  createReflection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { text, mood, date, tags } = req.body;
      
      // Basic validation
      if (!text || !mood || !date) {
        return res.status(400).json({ message: 'Missing required fields: text, mood, or date' });
      }
      
      const reflection = await this.service.createReflection(userId, {
        text,
        mood,
        date: new Date(date),
        tags: tags || []
      });
      
      return res.status(201).json(reflection);
    } catch (error) {
      logger.error('Error creating reflection:', error);
      next(error);
    }
  };
  
  // Update an existing reflection
  updateReflection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // First, check if the reflection exists and belongs to the user
      const existingReflection = await this.service.getReflectionById(id);
      
      if (!existingReflection) {
        return res.status(404).json({ message: 'Reflection not found' });
      }
      
      if (existingReflection.user.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this reflection' });
      }
      
      // Update the reflection
      const updatedReflection = await this.service.updateReflection(id, req.body);
      
      return res.status(200).json(updatedReflection);
    } catch (error) {
      logger.error(`Error updating reflection ${req.params.id}:`, error);
      next(error);
    }
  };
  
  // Delete a reflection
  deleteReflection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // First, check if the reflection exists and belongs to the user
      const existingReflection = await this.service.getReflectionById(id);
      
      if (!existingReflection) {
        return res.status(404).json({ message: 'Reflection not found' });
      }
      
      if (existingReflection.user.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this reflection' });
      }
      
      // Delete the reflection
      await this.service.deleteReflection(id);
      
      return res.status(200).json({ message: 'Reflection deleted successfully' });
    } catch (error) {
      logger.error(`Error deleting reflection ${req.params.id}:`, error);
      next(error);
    }
  };
  
  // Get reflection streaks for the authenticated user
  getStreaks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const streaks = await this.service.getReflectionStreaks(userId);
      
      return res.status(200).json(streaks);
    } catch (error) {
      logger.error('Error fetching reflection streaks:', error);
      next(error);
    }
  };
  
  // Get mood statistics for the authenticated user
  getMoodStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const period = req.query.period as string | undefined;
      const stats = await this.service.getMoodStatistics(userId, period);
      
      return res.status(200).json(stats);
    } catch (error) {
      logger.error('Error fetching mood statistics:', error);
      next(error);
    }
  };
}
