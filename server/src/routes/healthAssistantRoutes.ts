
import express from 'express';
import { HealthAssistantController } from '../controllers/healthAssistantController';

const router = express.Router();
const controller = new HealthAssistantController();

// Health Assistant chat endpoint
router.post('/chat', controller.processMessage);

// Get suggested questions
router.get('/suggested-questions', controller.getSuggestedQuestions);

export default router;
