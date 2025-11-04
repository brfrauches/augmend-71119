
import { Request, Response } from 'express';
import DashboardService from '../services/DashboardService';
import logger from '../config/logger';

export class DashboardController {
  private dashboardService: typeof DashboardService;

  constructor() {
    this.dashboardService = DashboardService;
  }

  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || '645ac32d9587542223f82140'; // Default for development
      
      // Log the dashboard view
      await this.dashboardService.logDashboardView(userId);
      
      const dashboardData = await this.dashboardService.getDashboardData(userId);
      
      res.status(200).json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      logger.error('Error getting dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard data',
        error: (error as Error).message,
      });
    }
  }

  async getWellnessScore(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || '645ac32d9587542223f82140';
      const timeframe = (req.query.timeframe as 'daily' | 'weekly') || 'daily';
      
      const wellnessData = await this.dashboardService.getWellnessScore(userId, timeframe);
      
      res.status(200).json({
        success: true,
        data: wellnessData,
      });
    } catch (error) {
      logger.error('Error getting wellness score:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wellness score',
        error: (error as Error).message,
      });
    }
  }

  async getTreatmentProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || '645ac32d9587542223f82140';
      
      const progressData = await this.dashboardService.getTreatmentProgress(userId);
      
      res.status(200).json({
        success: true,
        data: progressData,
      });
    } catch (error) {
      logger.error('Error getting treatment progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get treatment progress',
        error: (error as Error).message,
      });
    }
  }

  async getTodaysFocus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || '645ac32d9587542223f82140';
      
      const focusData = await this.dashboardService.getTodaysFocus(userId);
      
      res.status(200).json({
        success: true,
        data: focusData,
      });
    } catch (error) {
      logger.error('Error getting today\'s focus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get today\'s focus',
        error: (error as Error).message,
      });
    }
  }

  async getRecentSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || '645ac32d9587542223f82140';
      
      const sessionsData = await this.dashboardService.getRecentSessions(userId);
      
      res.status(200).json({
        success: true,
        data: sessionsData,
      });
    } catch (error) {
      logger.error('Error getting recent sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent sessions',
        error: (error as Error).message,
      });
    }
  }
}

export default new DashboardController();
