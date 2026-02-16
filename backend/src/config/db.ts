import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const requiredEnv = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
};

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: requiredEnv('DB_PASSWORD'),
  database: process.env.DB_NAME || 'fullstack_blog',
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
