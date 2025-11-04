
import { Request, Response } from 'express';
import HealthAssistantService from '../services/HealthAssistantService';

export class HealthAssistantController {
  async processMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      
      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }
      
      // Using a temporary user ID until auth is fully implemented
      const userId = req.user?.id || '6523c1f3a85543abcd123456';
      
      const response = await HealthAssistantService.processUserMessage(userId, message);
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  }
  
  async getSuggestedQuestions(req: Request, res: Response): Promise<void> {
    try {
      const questions = await HealthAssistantService.getSuggestedQuestions();
      res.status(200).json({ questions });
    } catch (error) {
      console.error('Error getting suggested questions:', error);
      res.status(500).json({ error: 'Failed to get suggested questions' });
    }
  }
}
