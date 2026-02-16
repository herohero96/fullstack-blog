import { Request, Response } from 'express';
import prisma from '../config/db';

export const search = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const tag = req.query.tag as string;
    const category = req.query.category as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

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
      prisma.article.findMany({
        where,
        include: {
          tags: { include: { tag: true } },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
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
  } catch (error) {
    console.error('Search failed:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};
