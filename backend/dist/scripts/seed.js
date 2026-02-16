"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
        await db_1.default.articleTag.deleteMany({});
        await db_1.default.article.deleteMany({});
        await db_1.default.category.deleteMany({});
        await db_1.default.tag.deleteMany({});
        await db_1.default.category.createMany({ data: categories });
        console.log('Categories seeded');
        await db_1.default.tag.createMany({ data: tags });
        console.log('Tags seeded');
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