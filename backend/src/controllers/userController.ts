import { Request, Response } from 'express';
import prisma from '../config/db';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const where: any = {};
    if (req.query.status) {
      where.status = req.query.status as string;
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true, username: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('GetUsers error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, username: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
    });

    res.json(user);
  } catch (error) {
    console.error('UpdateUserStatus error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (id === req.user!.userId) {
      res.status(400).json({ message: 'Cannot delete yourself' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('DeleteUser error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
