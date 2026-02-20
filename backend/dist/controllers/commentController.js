"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.createComment = exports.getComments = void 0;
const db_1 = __importDefault(require("../config/db"));
const authorSelect = { id: true, username: true };
// GET /api/articles/:slug/comments
const getComments = async (req, res) => {
    try {
        const slug = req.params.slug;
        const article = await db_1.default.article.findUnique({ where: { slug }, select: { id: true } });
        if (!article) {
            res.status(404).json({ message: '文章不存在' });
            return;
        }
        const comments = await db_1.default.comment.findMany({
            where: { articleId: article.id, parentId: null },
            include: {
                author: { select: authorSelect },
                replies: {
                    include: { author: { select: authorSelect } },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(comments);
    }
    catch (err) {
        res.status(500).json({ message: '获取评论失败' });
    }
};
exports.getComments = getComments;
// POST /api/articles/:slug/comments
const createComment = async (req, res) => {
    try {
        const slug = req.params.slug;
        const { content, parentId } = req.body;
        const userId = req.user.userId;
        const article = await db_1.default.article.findUnique({ where: { slug }, select: { id: true } });
        if (!article) {
            res.status(404).json({ message: '文章不存在' });
            return;
        }
        if (parentId) {
            const parent = await db_1.default.comment.findFirst({ where: { id: parentId, articleId: article.id, parentId: null } });
            if (!parent) {
                res.status(400).json({ message: '父评论不存在' });
                return;
            }
        }
        const comment = await db_1.default.comment.create({
            data: { content, articleId: article.id, authorId: userId, parentId: parentId || null },
            include: {
                author: { select: authorSelect },
                replies: { include: { author: { select: authorSelect } } },
            },
        });
        res.status(201).json(comment);
    }
    catch (err) {
        res.status(500).json({ message: '创建评论失败' });
    }
};
exports.createComment = createComment;
// DELETE /api/articles/:slug/comments/:id
const deleteComment = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const comment = await db_1.default.comment.findUnique({ where: { id } });
        if (!comment) {
            res.status(404).json({ message: '评论不存在' });
            return;
        }
        const isOwner = comment.authorId === req.user.userId;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            res.status(403).json({ message: '无权删除此评论' });
            return;
        }
        await db_1.default.comment.delete({ where: { id } });
        res.json({ message: '评论已删除' });
    }
    catch (err) {
        res.status(500).json({ message: '删除评论失败' });
    }
};
exports.deleteComment = deleteComment;
//# sourceMappingURL=commentController.js.map