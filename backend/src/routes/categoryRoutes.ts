import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../schemas/taxonomySchema';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';

const router = Router();

router.get('/', getCategories);
router.post('/', apiKeyAuth, validate(createCategorySchema), createCategory);
router.put('/:id', apiKeyAuth, validate(updateCategorySchema), updateCategory);
router.delete('/:id', apiKeyAuth, deleteCategory);

export default router;
