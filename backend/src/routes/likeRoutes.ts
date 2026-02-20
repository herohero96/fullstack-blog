import { Router } from 'express';
import { toggleLike, getLikeStatus } from '../controllers/likeController';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/articles/:slug/like', optionalAuth, getLikeStatus);
router.post('/articles/:slug/like', requireAuth, toggleLike);

export default router;
