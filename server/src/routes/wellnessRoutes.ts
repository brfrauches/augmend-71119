
import express from 'express';
import * as wellnessController from '../controllers/wellnessController';

const router = express.Router();

// Record a mood entry
router.post('/mood', wellnessController.recordMood);

// Record a breathing session
router.post('/breathing-session', wellnessController.recordBreathingSession);

// Get recent mood entries
router.get('/moods/recent', wellnessController.getRecentMoods);

// Get breathing exercise statistics
router.get('/breathing/stats', wellnessController.getBreathingStats);

export default router;
