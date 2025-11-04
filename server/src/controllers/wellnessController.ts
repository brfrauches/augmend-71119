
import { Request, Response } from 'express';
import * as wellnessService from '../services/wellnessService';

export const recordMood = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mood } = req.body;
    
    if (!mood) {
      res.status(400).json({ message: 'Mood is required' });
      return;
    }
    
    const result = await wellnessService.recordMood(mood);
    res.status(201).json({
      message: 'Mood recorded successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in recordMood controller:', error);
    res.status(500).json({ message: 'Error recording mood' });
  }
};

export const recordBreathingSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { duration, completedBreaths } = req.body;
    
    if (typeof duration !== 'number' || typeof completedBreaths !== 'number') {
      res.status(400).json({ message: 'Duration and completedBreaths are required and must be numbers' });
      return;
    }
    
    const result = await wellnessService.recordBreathingSession(duration, completedBreaths);
    res.status(201).json({
      message: 'Breathing session recorded successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in recordBreathingSession controller:', error);
    res.status(500).json({ message: 'Error recording breathing session' });
  }
};

export const getRecentMoods = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const recentMoods = await wellnessService.getRecentMoods(limit);
    
    res.status(200).json(recentMoods);
  } catch (error) {
    console.error('Error in getRecentMoods controller:', error);
    res.status(500).json({ message: 'Error fetching recent moods' });
  }
};

export const getBreathingStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await wellnessService.getBreathingStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getBreathingStats controller:', error);
    res.status(500).json({ message: 'Error fetching breathing stats' });
  }
};
