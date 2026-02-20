import { Request, Response } from 'express';
import prisma from '../config/db';

// 点赞 / 取消点赞
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const userId = (req as any).user.userId;

    const article = await prisma.article.findUnique({ where: { slug } });
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const existing = await prisma.like.findUnique({
      where: { articleId_userId: { articleId: article.id, userId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { articleId: article.id } });
      return res.json({ liked: false, count });
    } else {
      await prisma.like.create({ data: { articleId: article.id, userId } });
      const count = await prisma.like.count({ where: { articleId: article.id } });
      return res.json({ liked: true, count });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};

// 获取点赞状态
export const getLikeStatus = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const userId = (req as any).user?.userId;

    const article = await prisma.article.findUnique({ where: { slug } });
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const count = await prisma.like.count({ where: { articleId: article.id } });
    const liked = userId
      ? !!(await prisma.like.findUnique({
          where: { articleId_userId: { articleId: article.id, userId } },
        }))
      : false;

    res.json({ liked, count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get like status' });
  }
};
