
import { Router } from 'express';
import ContentController from '../controllers/contentController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', ContentController.getAllContent);
router.get('/categories', ContentController.getContentCategories);
router.get('/types', ContentController.getContentTypes);
router.get('/:id', ContentController.getContentById);
router.get('/category/:category', ContentController.getContentByCategory);
router.get('/type/:type', ContentController.getContentByType);

// Protected routes requiring authentication
router.post('/', authMiddleware, ContentController.createContent);
router.put('/:id', authMiddleware, ContentController.updateContent);
router.delete('/:id', authMiddleware, ContentController.deleteContent);

// User content routes
router.get('/users/:userId/content', authMiddleware, ContentController.getUserContent);
router.put('/users/:userId/content/:contentId/progress', authMiddleware, ContentController.updateUserProgress);
router.post('/users/:userId/content/:contentId/bookmark', authMiddleware, ContentController.toggleBookmark);
router.get('/users/:userId/bookmarks', authMiddleware, ContentController.getUserBookmarks);
router.get('/users/:userId/recent', authMiddleware, ContentController.getRecentContent);
router.get('/users/:userId/recommendations', authMiddleware, ContentController.getRecommendedContent);

export default router;
