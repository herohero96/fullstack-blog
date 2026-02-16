import { Router } from 'express';
import { requireAuth, requireApproved } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTagSchema, updateTagSchema } from '../schemas/taxonomySchema';
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tagController';

const router = Router();

router.get('/', getTags);
router.post('/', requireAuth, requireApproved, validate(createTagSchema), createTag);
router.put('/:id', requireAuth, requireApproved, validate(updateTagSchema), updateTag);
router.delete('/:id', requireAuth, requireApproved, deleteTag);

export default router;
