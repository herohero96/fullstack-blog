# Fullstack Blog - Project Instructions

## Project Context

全栈博客系统，使用 React + TypeScript + Tailwind CSS 构建前端，Node.js + Express + TypeScript 构建后端，MySQL (Prisma ORM) 作为数据库。

支持功能：文章 CRUD、标签分类、Markdown 编辑与实时预览、全文搜索、用户认证（JWT）、管理员审核。

---

## Environment Configuration

**重要：agent 必须读取此配置，不得猜测或覆盖 .env 中的值。**

### Database (MySQL 8)
- Host: localhost
- Port: 3306
- User: root
- Password: hero1234
- Database: fullstack_blog
- DATABASE_URL: mysql://root:hero1234@localhost:3306/fullstack_blog

### Backend (port 5000)
- JWT_SECRET: your_jwt_secret_key
- API_KEY: your_api_key (已弃用，已切换为 JWT)

### Frontend (Vite, port 5173)
- API 代理: /api → http://localhost:5000

### Default Admin Account
- Email: admin@blog.com
- Password: admin123

### .env Template (backend/.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=hero1234
DB_NAME=fullstack_blog
DATABASE_URL=mysql://root:hero1234@localhost:3306/fullstack_blog
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
API_KEY=your_api_key
```

**规则：修改 .env 时只允许新增字段，不得修改已有字段的值（尤其是 DB_PASSWORD）。**

---

## MANDATORY: Agent Workflow

Every new agent session MUST follow this workflow:

### Step 1: Initialize Environment

```bash
./init.sh
```

### Step 2: Select Next Task

Read `task.json` and select ONE task to work on (lowest id with `passes: false` and all `dependsOn` completed).

### Step 3: Implement the Task

### Step 4: Test Thoroughly (MANDATORY - DO NOT SKIP)

每个任务完成后必须执行以下验证，全部通过才能标记为完成：

**后端改动：**
```bash
# 1. TypeScript 编译
cd backend && npm run build

# 2. 数据库连接验证
mysql -u root -phero1234 -e "SELECT 1" 2>/dev/null || echo "DB connection failed"

# 3. API 端到端测试（如果涉及新增/修改 API）
# 确保后端在运行，然后 curl 测试关键接口
curl -s http://localhost:5000/api/health | grep -q "ok" || echo "Backend not running"

# 4. 如果涉及数据库 schema 变更
cd backend && npx prisma db push
# 如果涉及种子数据变更
cd backend && npm run seed
```

**前端改动：**
```bash
# 1. TypeScript 编译 + Vite 构建
cd frontend && npm run build
```

**集成验证（涉及前后端联动的任务）：**
```bash
# 确保后端运行后，curl 测试完整流程
# 例如：注册 → 登录 → 获取用户信息
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blog.com","password":"admin123"}' | grep -q "token" || echo "Login API failed"
```

### Step 5: Update Progress

Append to `progress.txt`.

### Step 6: Commit Changes

```bash
git add .
git commit -m "[task description] - completed"
```

---

## MANDATORY: Team Mode Rules

当使用团队模式（多 agent 并行）时，必须遵守：

1. **不得修改 .env 已有值** — 多个 agent 可能同时读写 .env，只允许追加新字段
2. **不得启动/停止 dev server** — dev server 由用户手动管理，agent 不要尝试启动后台进程
3. **数据库迁移串行执行** — 涉及 `prisma migrate` 或 `prisma db push` 的任务不能并行
4. **Lead agent 必须做集成验证** — 所有 agent 完成后，lead agent 必须：
   - 运行 `npm run build`（前后端）
   - 运行 `npm run seed`（如果有 schema/seed 变更）
   - curl 测试关键 API 接口
   - 确认所有 task.json 中的 passes 状态正确
5. **前端 agent 不改后端代码，后端 agent 不改前端代码**

---

## Project Structure

```
fullstack-blog/
├── CLAUDE.md
├── task.json
├── progress.txt
├── init.sh
├── run-tasks.sh
├── backend/               # Node.js + Express API (Prisma + MySQL)
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   ├── middleware/    # auth.ts, apiKeyAuth.ts, validate.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── schemas/       # Zod validation schemas
│   │   └── scripts/       # seed.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
└── frontend/              # React + Vite
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── components/
    │   ├── contexts/      # AuthContext.tsx
    │   ├── pages/
    │   ├── types/
    │   ├── lib/
    │   └── hooks/
    ├── package.json
    └── vite.config.ts
```

## Commands

```bash
# Backend (in backend/)
npm run dev          # Start dev server (port 5000)
npm run build        # TypeScript build
npm run seed         # Seed database (categories, tags, admin user)

# Frontend (in frontend/)
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build

# Database
cd backend && npx prisma db push      # Sync schema to database
cd backend && npx prisma studio        # Open Prisma Studio GUI
```

## Coding Conventions

- TypeScript strict mode
- Functional React components with hooks
- Tailwind CSS for styling
- API calls through `frontend/src/lib/api.ts`
- RESTful API: /api/articles, /api/tags, /api/categories, /api/search, /api/auth, /api/users
- One component per file
- JWT Bearer token authentication (Authorization header)
- Zod schemas for request validation
- bcryptjs for password hashing

## Key Rules

1. Test before marking complete — build 通过 + curl 验证 API
2. One commit per task
3. Never remove tasks
4. Stop if blocked
5. Respect dependsOn
6. **Never overwrite .env existing values** — only append new fields
7. **Never start dev servers in background** — user manages servers manually
8. **Always run seed after schema changes** that add new models
