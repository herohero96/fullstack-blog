import { Request, Response } from 'express';
import prisma from '../config/db';

const authorSelect = { id: true, username: true };

// GET /api/articles/:slug/comments
export const getComments = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const article = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
    if (!article) { res.status(404).json({ message: '文章不存在' }); return; }

    const comments = await prisma.comment.findMany({
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
  } catch (err) {
    res.status(500).json({ message: '获取评论失败' });
  }
};

// POST /api/articles/:slug/comments
export const createComment = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const { content, parentId } = req.body;
    const userId = req.user!.userId;

    const article = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
    if (!article) { res.status(404).json({ message: '文章不存在' }); return; }

    if (parentId) {
      const parent = await prisma.comment.findFirst({ where: { id: parentId, articleId: article.id, parentId: null } });
      if (!parent) { res.status(400).json({ message: '父评论不存在' }); return; }
    }

    const comment = await prisma.comment.create({
      data: { content, articleId: article.id, authorId: userId, parentId: parentId || null },
      include: {
        author: { select: authorSelect },
        replies: { include: { author: { select: authorSelect } } },
      },
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: '创建评论失败' });
  }
};

// DELETE /api/articles/:slug/comments/:id
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) { res.status(404).json({ message: '评论不存在' }); return; }

    const isOwner = comment.authorId === req.user!.userId;
    const isAdmin = req.user!.role === 'admin';
    if (!isOwner && !isAdmin) { res.status(403).json({ message: '无权删除此评论' }); return; }

    await prisma.comment.delete({ where: { id } });
    res.json({ message: '评论已删除' });
  } catch (err) {
    res.status(500).json({ message: '删除评论失败' });
  }
};
