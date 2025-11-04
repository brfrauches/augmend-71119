
import express from 'express';
import ReflectionController from '../controllers/ReflectionController';
import { authenticate } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';

const router = express.Router();
const controller = new ReflectionController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply a specific rate limiter for this resource
const reflectionLimiter = rateLimiter(100, 15 * 60); // 100 requests per 15 minutes

// Get all reflections with filtering options
router.get('/', reflectionLimiter, controller.getReflections);

// Get reflection streaks
router.get('/streaks', reflectionLimiter, controller.getStreaks);

// Get mood statistics
router.get('/mood-stats', reflectionLimiter, controller.getMoodStats);

// Get a specific reflection by ID
router.get('/:id', reflectionLimiter, controller.getReflectionById);

// Create a new reflection
router.post('/', reflectionLimiter, controller.createReflection);

// Update a reflection
router.put('/:id', reflectionLimiter, controller.updateReflection);

// Delete a reflection
router.delete('/:id', reflectionLimiter, controller.deleteReflection);

export default router;
