import { Request, Response } from 'express';
import prisma from '../config/db';

export const getTags = async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(tags);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    res.status(500).json({ message: 'Failed to fetch tags' });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, slug, color } = req.body;
    const tag = await prisma.tag.create({
      data: { name, slug, color: color || '#3B82F6' },
    });
    res.status(201).json(tag);
  } catch (error) {
    console.error('Failed to create tag:', error);
    res.status(500).json({ message: 'Failed to create tag' });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }
    const { name, slug, color } = req.body;
    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(color !== undefined && { color }),
      },
    });
    res.json(tag);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }
    console.error('Failed to update tag:', error);
    res.status(500).json({ message: 'Failed to update tag' });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }
    await prisma.tag.delete({ where: { id } });
    res.json({ message: 'Tag deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }
    console.error('Failed to delete tag:', error);
    res.status(500).json({ message: 'Failed to delete tag' });
  }
};
