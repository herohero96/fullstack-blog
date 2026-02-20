import { Request, Response } from 'express';
import prisma from '../config/db';

// 点赞 / 取消点赞
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const articleId = parseInt(req.params.id as string);
    const userId = (req as any).user.userId;

    const existing = await prisma.like.findUnique({
      where: { articleId_userId: { articleId, userId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { articleId } });
      return res.json({ liked: false, count });
    } else {
      await prisma.like.create({ data: { articleId, userId } });
      const count = await prisma.like.count({ where: { articleId } });
      return res.json({ liked: true, count });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};

// 获取点赞状态
export const getLikeStatus = async (req: Request, res: Response) => {
  try {
    const articleId = parseInt(req.params.id as string);
    const userId = (req as any).user?.userId;

    const count = await prisma.like.count({ where: { articleId } });
    const liked = userId
      ? !!(await prisma.like.findUnique({
          where: { articleId_userId: { articleId, userId } },
        }))
      : false;

    res.json({ liked, count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get like status' });
  }
};
