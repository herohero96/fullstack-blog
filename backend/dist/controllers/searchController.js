"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const db_1 = __importDefault(require("../config/db"));
const search = async (req, res) => {
    try {
        const q = req.query.q;
        const tag = req.query.tag;
        const category = req.query.category;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const skip = (page - 1) * limit;
        const where = {};
        if (q) {
            where.OR = [
                { title: { contains: q } },
                { content: { contains: q } },
            ];
        }
        if (tag) {
            where.tags = {
                some: { tagId: parseInt(tag) },
            };
        }
        if (category) {
            where.categoryId = parseInt(category);
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
        const transformedArticles = articles.map((article) => {
            const { tags, ...rest } = article;
            return {
                ...rest,
                tags: tags.map((at) => at.tag),
            };
        });
        res.json({
            articles: transformedArticles,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        console.error('Search failed:', error);
        res.status(500).json({ message: 'Search failed' });
    }
};
exports.search = search;
//# sourceMappingURL=searchController.js.map