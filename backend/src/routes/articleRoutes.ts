import { Router } from 'express';
import { requireAuth, requireApproved } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createArticleSchema, updateArticleSchema } from '../schemas/articleSchema';
import {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController';

const router = Router();

router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);
router.post('/', requireAuth, requireApproved, validate(createArticleSchema), createArticle);
router.put('/:slug', requireAuth, requireApproved, validate(updateArticleSchema), updateArticle);
router.delete('/:slug', requireAuth, requireApproved, deleteArticle);

export default router;
