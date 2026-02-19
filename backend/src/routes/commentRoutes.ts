import { Router } from 'express';
import { requireAuth, requireApproved } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema } from '../schemas/commentSchema';
import { getComments, createComment, deleteComment } from '../controllers/commentController';

const router = Router({ mergeParams: true });

router.get('/', getComments);
router.post('/', requireAuth, requireApproved, validate(createCommentSchema), createComment);
router.delete('/:id', requireAuth, deleteComment);

export default router;
