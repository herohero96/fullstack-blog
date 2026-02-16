"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const tagRoutes_1 = __importDefault(require("./routes/tagRoutes"));
const articleRoutes_1 = __importDefault(require("./routes/articleRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express_1.default.json({ limit: '1mb' }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// Routes
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/tags', tagRoutes_1.default);
app.use('/api/articles', articleRoutes_1.default);
app.use('/api/search', searchRoutes_1.default);
// Start server
const start = async () => {
    await db_1.default.$connect();
    console.log('MySQL connected via Prisma');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};
start();
exports.default = app;
//# sourceMappingURL=index.js.map