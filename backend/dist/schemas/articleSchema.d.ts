import { z } from 'zod';
export declare const createArticleSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    summary: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>>;
    categoryId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    category: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    coverImage: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    published: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateArticleSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    categoryId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    category: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    coverImage: z.ZodOptional<z.ZodString>;
    published: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
//# sourceMappingURL=articleSchema.d.ts.map