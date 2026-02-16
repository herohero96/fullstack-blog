# Fullstack Blog - Project Instructions

## Project Context

全栈博客系统，使用 React + TypeScript + Tailwind CSS 构建前端，Node.js + Express + TypeScript 构建后端，MongoDB 作为数据库。

支持功能：文章 CRUD、标签分类、Markdown 编辑与实时预览、全文搜索。

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

### Step 4: Test Thoroughly

- API changes: test with curl
- UI changes: verify renders correctly
- All changes: `npm run build` succeeds in both frontend and backend

### Step 5: Update Progress

Append to `progress.txt`.

### Step 6: Commit Changes

```bash
git add .
git commit -m "[task description] - completed"
```

---

## Project Structure

```
fullstack-blog/
├── CLAUDE.md
├── task.json
├── progress.txt
├── init.sh
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── scripts/
│   ├── package.json
│   └── tsconfig.json
└── frontend/              # React + Vite
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── components/
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

# Frontend (in frontend/)
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build
```

## Coding Conventions

- TypeScript strict mode
- Functional React components with hooks
- Tailwind CSS for styling
- API calls through `frontend/src/lib/api.ts`
- RESTful API: /api/articles, /api/tags, /api/categories, /api/search
- One component per file

## Key Rules

1. Test before marking complete
2. One commit per task
3. Never remove tasks
4. Stop if blocked
5. Respect dependsOn
