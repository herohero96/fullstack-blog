import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空').max(2000),
  parentId: z.number().int().positive().nullable().optional(),
});
