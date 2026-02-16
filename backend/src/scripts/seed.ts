import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import prisma from '../config/db';

const categories = [
  { name: '技术', slug: 'tech', description: '技术相关文章' },
  { name: '生活', slug: 'life', description: '生活随记' },
  { name: '随笔', slug: 'essay', description: '随笔杂谈' },
];

const tags = [
  { name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' },
  { name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
  { name: 'React', slug: 'react', color: '#61DAFB' },
  { name: 'Node.js', slug: 'nodejs', color: '#339933' },
  { name: 'MySQL', slug: 'mysql', color: '#4479A1' },
];

const seed = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to MySQL');

    // Upsert categories (create if not exists, skip if exists)
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
    }
    console.log('Categories seeded');

    // Upsert tags
    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      });
    }
    console.log('Tags seeded');

    // Upsert admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@blog.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@blog.com',
        password: adminPassword,
        role: 'admin',
        status: 'approved',
      },
    });
    console.log('Admin user seeded');

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
