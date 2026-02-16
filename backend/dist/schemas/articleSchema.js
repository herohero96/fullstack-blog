"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateArticleSchema = exports.createArticleSchema = void 0;
const zod_1 = require("zod");
const httpUrlOrEmpty = zod_1.z.string().refine((val) => !val || /^https?:\/\//.test(val), { message: 'Cover image must be a valid http/https URL' });
exports.createArticleSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, '标题不能为空').max(200),
    content: zod_1.z.string().min(1, '内容不能为空'),
    summary: zod_1.z.string().max(500).optional().default(''),
    tags: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).optional().default([]),
    categoryId: zod_1.z.number().int().positive().nullable().optional(),
    category: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable().optional(),
    coverImage: httpUrlOrEmpty.optional().default(''),
    published: zod_1.z.boolean().optional().default(false),
});
exports.updateArticleSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    content: zod_1.z.string().min(1).optional(),
    summary: zod_1.z.string().max(500).optional(),
    tags: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).optional(),
    categoryId: zod_1.z.number().int().positive().nullable().optional(),
    category: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable().optional(),
    coverImage: httpUrlOrEmpty.optional(),
    published: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=articleSchema.js.map