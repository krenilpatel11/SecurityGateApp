import { Router } from 'express';
import { getFeed, createPost, updatePostStatus, toggleLike, deletePost } from '../controllers/communityFeed.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, getFeed);
router.post('/', authenticateJWT, createPost);
router.patch('/:id/status', authenticateJWT, updatePostStatus);
router.patch('/:id/like', authenticateJWT, toggleLike);
router.delete('/:id', authenticateJWT, deletePost);

export default router;
