import { z } from 'zod';

const httpUrlOrEmpty = z.string().refine(
  (val) => !val || /^https?:\/\//.test(val),
  { message: 'Cover image must be a valid http/https URL' }
);

export const createArticleSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  content: z.string().min(1, '内容不能为空'),
  summary: z.string().max(500).optional().default(''),
  tags: z.array(z.union([z.string(), z.number()])).optional().default([]),
  categoryId: z.number().int().positive().nullable().optional(),
  category: z.union([z.string(), z.number()]).nullable().optional(),
  coverImage: httpUrlOrEmpty.optional().default(''),
  published: z.boolean().optional().default(false),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  summary: z.string().max(500).optional(),
  tags: z.array(z.union([z.string(), z.number()])).optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  category: z.union([z.string(), z.number()]).nullable().optional(),
  coverImage: httpUrlOrEmpty.optional(),
  published: z.boolean().optional(),
});
