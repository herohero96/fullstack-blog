import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
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
router.post('/', apiKeyAuth, validate(createArticleSchema), createArticle);
router.put('/:slug', apiKeyAuth, validate(updateArticleSchema), updateArticle);
router.delete('/:slug', apiKeyAuth, deleteArticle);

export default router;
