"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArticle = exports.updateArticle = exports.createArticle = exports.getArticleBySlug = exports.getArticles = void 0;
const db_1 = __importDefault(require("../config/db"));
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now().toString(36);
};
const transformArticleTags = (article) => {
    if (!article)
        return article;
    const { tags, ...rest } = article;
    return {
        ...rest,
        tags: tags ? tags.map((at) => at.tag) : [],
    };
};
const getArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const skip = (page - 1) * limit;
        const where = {};
        if (req.query.published === 'true')
            where.published = true;
        if (req.query.category)
            where.categoryId = parseInt(req.query.category);
        if (req.query.tag) {
            where.tags = {
                some: { tagId: parseInt(req.query.tag) },
            };
        }
        const [articles, total] = await Promise.all([
            db_1.default.article.findMany({
                where,
                include: {
                    tags: { include: { tag: true } },
                    category: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            db_1.default.article.count({ where }),
        ]);
        res.json({
            articles: articles.map(transformArticleTags),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        console.error('Failed to fetch articles:', error);
        res.status(500).json({ message: 'Failed to fetch articles' });
    }
};
exports.getArticles = getArticles;
const getArticleBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const article = await db_1.default.article.findUnique({
            where: { slug },
            include: {
                tags: { include: { tag: true } },
                category: true,
            },
        });
        if (!article) {
            res.status(404).json({ message: 'Article not found' });
            return;
        }
        // Fire-and-forget view count increment
        db_1.default.article.update({
            where: { id: article.id },
            data: { viewCount: { increment: 1 } },
        }).catch(() => { });
        res.json(transformArticleTags({ ...article, viewCount: article.viewCount + 1 }));
    }
    catch (error) {
        console.error('Failed to fetch article:', error);
        res.status(500).json({ message: 'Failed to fetch article' });
    }
};
exports.getArticleBySlug = getArticleBySlug;
const createArticle = async (req, res) => {
    try {
        const { title, content, summary, tags, categoryId, category, coverImage, published } = req.body;
        const slug = generateSlug(title);
        const tagIds = tags ? tags.map((t) => typeof t === 'string' ? parseInt(t) : t) : [];
        const resolvedCategoryId = categoryId != null ? Number(categoryId) : (category != null ? Number(category) : null);
        const validCategoryId = resolvedCategoryId && !isNaN(resolvedCategoryId) ? resolvedCategoryId : null;
        const article = await db_1.default.$transaction(async (tx) => {
            const created = await tx.article.create({
                data: {
                    title,
                    content,
                    summary: summary || '',
                    slug,
                    categoryId: validCategoryId,
                    coverImage: coverImage || '',
                    published: published || false,
                    tags: tagIds.length > 0 ? {
                        create: tagIds.map((tagId) => ({ tagId })),
                    } : undefined,
                },
                include: {
                    tags: { include: { tag: true } },
                    category: true,
                },
            });
            if (tagIds.length > 0) {
                await tx.tag.updateMany({
                    where: { id: { in: tagIds } },
                    data: { articleCount: { increment: 1 } },
                });
            }
            if (validCategoryId) {
                await tx.category.update({
                    where: { id: validCategoryId },
                    data: { articleCount: { increment: 1 } },
                });
            }
            return created;
        });
        res.status(201).json(transformArticleTags(article));
    }
    catch (error) {
        console.error('Failed to create article:', error);
        res.status(500).json({ message: 'Failed to create article' });
    }
};
exports.createArticle = createArticle;
const updateArticle = async (req, res) => {
    try {
        const slug = req.params.slug;
        const existing = await db_1.default.article.findUnique({
            where: { slug },
            include: { tags: true },
        });
        if (!existing) {
            res.status(404).json({ message: 'Article not found' });
            return;
        }
        const oldTagIds = existing.tags.map((t) => t.tagId);
        const oldCategoryId = existing.categoryId;
        const updateData = {};
        if (req.body.title !== undefined)
            updateData.title = req.body.title;
        if (req.body.content !== undefined)
            updateData.content = req.body.content;
        if (req.body.summary !== undefined)
            updateData.summary = req.body.summary;
        if (req.body.coverImage !== undefined)
            updateData.coverImage = req.body.coverImage;
        if (req.body.published !== undefined)
            updateData.published = req.body.published;
        if (req.body.categoryId !== undefined || req.body.category !== undefined) {
            const rawCat = req.body.categoryId !== undefined ? req.body.categoryId : req.body.category;
            updateData.categoryId = rawCat ? Number(rawCat) : null;
        }
        const updated = await db_1.default.$transaction(async (tx) => {
            // Handle tags update
            if (req.body.tags !== undefined) {
                const newTagIds = req.body.tags.map((t) => typeof t === 'string' ? parseInt(t) : t);
                await tx.articleTag.deleteMany({ where: { articleId: existing.id } });
                if (newTagIds.length > 0) {
                    await tx.articleTag.createMany({
                        data: newTagIds.map((tagId) => ({
                            articleId: existing.id,
                            tagId,
                        })),
                    });
                }
                const removedTags = oldTagIds.filter((t) => !newTagIds.includes(t));
                const addedTags = newTagIds.filter((t) => !oldTagIds.includes(t));
                if (removedTags.length > 0) {
                    await tx.tag.updateMany({
                        where: { id: { in: removedTags } },
                        data: { articleCount: { decrement: 1 } },
                    });
                }
                if (addedTags.length > 0) {
                    await tx.tag.updateMany({
                        where: { id: { in: addedTags } },
                        data: { articleCount: { increment: 1 } },
                    });
                }
            }
            const result = await tx.article.update({
                where: { id: existing.id },
                data: updateData,
                include: {
                    tags: { include: { tag: true } },
                    category: true,
                },
            });
            // Update category articleCount if changed
            const rawNewCat = req.body.categoryId !== undefined ? req.body.categoryId : req.body.category;
            const newCategoryId = (req.body.categoryId !== undefined || req.body.category !== undefined)
                ? (rawNewCat ? Number(rawNewCat) : null)
                : oldCategoryId;
            if (newCategoryId !== oldCategoryId) {
                if (oldCategoryId) {
                    await tx.category.update({
                        where: { id: oldCategoryId },
                        data: { articleCount: { decrement: 1 } },
                    });
                }
                if (newCategoryId) {
                    await tx.category.update({
                        where: { id: newCategoryId },
                        data: { articleCount: { increment: 1 } },
                    });
                }
            }
            return result;
        });
        res.json(transformArticleTags(updated));
    }
    catch (error) {
        console.error('Failed to update article:', error);
        res.status(500).json({ message: 'Failed to update article' });
    }
};
exports.updateArticle = updateArticle;
const deleteArticle = async (req, res) => {
    try {
        const slug = req.params.slug;
        const article = await db_1.default.article.findUnique({
            where: { slug },
            include: { tags: true },
        });
        if (!article) {
            res.status(404).json({ message: 'Article not found' });
            return;
        }
        await db_1.default.$transaction(async (tx) => {
            await tx.article.delete({ where: { id: article.id } });
            const tagIds = article.tags.map((t) => t.tagId);
            if (tagIds.length > 0) {
                await tx.tag.updateMany({
                    where: { id: { in: tagIds } },
                    data: { articleCount: { decrement: 1 } },
                });
            }
            if (article.categoryId) {
                await tx.category.update({
                    where: { id: article.categoryId },
                    data: { articleCount: { decrement: 1 } },
                });
            }
        });
        res.json({ message: 'Article deleted' });
    }
    catch (error) {
        console.error('Failed to delete article:', error);
        res.status(500).json({ message: 'Failed to delete article' });
    }
};
exports.deleteArticle = deleteArticle;
//# sourceMappingURL=articleController.js.map