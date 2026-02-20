"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, '评论内容不能为空').max(2000),
    parentId: zod_1.z.number().int().positive().nullable().optional(),
});
//# sourceMappingURL=commentSchema.js.map