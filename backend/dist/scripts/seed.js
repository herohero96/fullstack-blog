"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../config/db"));
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
        await db_1.default.$connect();
        console.log('Connected to MySQL');
        // Upsert categories (create if not exists, skip if exists)
        for (const cat of categories) {
            await db_1.default.category.upsert({
                where: { slug: cat.slug },
                update: {},
                create: cat,
            });
        }
        console.log('Categories seeded');
        // Upsert tags
        for (const tag of tags) {
            await db_1.default.tag.upsert({
                where: { slug: tag.slug },
                update: {},
                create: tag,
            });
        }
        console.log('Tags seeded');
        // Upsert admin user
        const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
        await db_1.default.user.upsert({
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
    }
    catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};
seed();
//# sourceMappingURL=seed.js.map