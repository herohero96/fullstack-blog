import { Router } from 'express';
import { requireAuth, requireApproved } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../schemas/taxonomySchema';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';

const router = Router();

router.get('/', getCategories);
router.post('/', requireAuth, requireApproved, validate(createCategorySchema), createCategory);
router.put('/:id', requireAuth, requireApproved, validate(updateCategorySchema), updateCategory);
router.delete('/:id', requireAuth, requireApproved, deleteCategory);

export default router;
