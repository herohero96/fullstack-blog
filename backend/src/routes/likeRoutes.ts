import { Router } from 'express';
import { toggleLike, getLikeStatus } from '../controllers/likeController';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/articles/:id/like', optionalAuth, getLikeStatus);
router.post('/articles/:id/like', requireAuth, toggleLike);

export default router;
