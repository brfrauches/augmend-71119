
import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { protect } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();
const authController = new AuthController();

// Apply rate limiting to auth routes
router.use(authLimiter);

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

export default router;
