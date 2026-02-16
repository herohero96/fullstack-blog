import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserStatusSchema } from '../schemas/authSchema';
import { getUsers, updateUserStatus, deleteUser } from '../controllers/userController';

const router = Router();

router.get('/', requireAuth, requireAdmin, getUsers);
router.patch('/:id/status', requireAuth, requireAdmin, validate(updateUserStatusSchema), updateUserStatus);
router.delete('/:id', requireAuth, requireAdmin, deleteUser);

export default router;
