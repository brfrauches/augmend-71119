
import express from 'express';
import DashboardController from '../controllers/DashboardController';

const router = express.Router();

// Get full dashboard data
router.get('/:userId?', DashboardController.getDashboardData.bind(DashboardController));

// Get wellness score
router.get('/:userId/wellness-score', DashboardController.getWellnessScore.bind(DashboardController));

// Get treatment progress
router.get('/:userId/treatment-progress', DashboardController.getTreatmentProgress.bind(DashboardController));

// Get today's focus
router.get('/:userId/focus', DashboardController.getTodaysFocus.bind(DashboardController));

// Get recent sessions
router.get('/:userId/recent-sessions', DashboardController.getRecentSessions.bind(DashboardController));

export default router;
