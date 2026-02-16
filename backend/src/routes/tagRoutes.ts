import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { validate } from '../middleware/validate';
import { createTagSchema, updateTagSchema } from '../schemas/taxonomySchema';
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tagController';

const router = Router();

router.get('/', getTags);
router.post('/', apiKeyAuth, validate(createTagSchema), createTag);
router.put('/:id', apiKeyAuth, validate(updateTagSchema), updateTag);
router.delete('/:id', apiKeyAuth, deleteTag);

export default router;
