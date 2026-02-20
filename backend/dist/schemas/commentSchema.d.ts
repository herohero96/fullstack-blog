import { z } from 'zod';
export declare const createCommentSchema: z.ZodObject<{
    content: z.ZodString;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
//# sourceMappingURL=commentSchema.d.ts.map