
import express from 'express';
import AchievementController from '../controllers/AchievementController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/achievements', AchievementController.getAllAchievements);
router.get('/achievements/:id', AchievementController.getAchievementById);

// Protected routes
router.post('/achievements', authenticate, AchievementController.createAchievement);
router.put('/achievements/:id', authenticate, AchievementController.updateAchievement);
router.delete('/achievements/:id', authenticate, AchievementController.deleteAchievement);

// User achievement routes
router.get('/users/:userId/achievements', authenticate, AchievementController.getUserAchievements);
router.get('/users/:userId/achievements/completed', authenticate, AchievementController.getCompletedAchievements);
router.get('/users/:userId/achievements/pending', authenticate, AchievementController.getPendingAchievements);

// Process activity and update progress
router.post('/users/:userId/activity', authenticate, AchievementController.processUserActivity);
router.post('/users/:userId/achievements/:achievementId/progress', authenticate, AchievementController.updateAchievementProgress);

export default router;
