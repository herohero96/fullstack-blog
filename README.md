# Fullstack Blog

全栈博客系统：React + TypeScript + Tailwind CSS 前端，Node.js + Express + TypeScript 后端，MySQL (Prisma ORM) 数据库。

## 快速开始（本地开发）

```bash
# 后端
cd backend
npm install
npx prisma db push    # 同步数据库结构
npm run seed          # 初始化种子数据（管理员账号等）
npm run dev           # 启动后端 http://localhost:5000

# 前端
cd frontend
npm install
npm run dev           # 启动前端 http://localhost:5173
```

默认管理员账号：admin@blog.com / admin123

---

## 服务器部署（Docker Compose）

服务器需要安装 Docker 和 Docker Compose。

```bash
# 首次部署
git clone git@github.com:herohero96/fullstack-blog.git
cd fullstack-blog

# 配置环境变量
cp .env.example .env  # 然后编辑 .env 填写数据库密码等

# 启动服务
docker compose up -d --build
```

服务包含三个容器：
- `fullstack-blog-mysql-1` — MySQL 8.0（端口 3307）
- `fullstack-blog-backend-1` — Node.js API（端口 5000，内部）
- `fullstack-blog-frontend-1` — Nginx 静态托管 + 反向代理（端口 80）

---

## 运维脚本

### 一键发布：deploy.sh

本地代码提交后，一键推送并在服务器上重新构建部署。

```bash
# 完整流程：git push → 服务器 pull → 构建镜像 → 重启服务 → 健康检查
bash deploy.sh

# 跳过 git push（代码已推送，只需服务器重建）
bash deploy.sh --skip-push
```

### 数据库同步：sync-db.sh

将本地数据库同步到服务器（通过 SSH + Docker exec）。

```bash
# 完整同步（结构 + 数据，会覆盖服务器数据）
bash sync-db.sh

# 只同步数据（不含表结构）
bash sync-db.sh --data-only
```

同步前会自动备份服务器数据库到 `/tmp/backup_*.sql`。

---

## 常用命令

| 操作 | 命令 |
|------|------|
| 本地启动后端 | `cd backend && npm run dev` |
| 本地启动前端 | `cd frontend && npm run dev` |
| 构建后端 | `cd backend && npm run build` |
| 构建前端 | `cd frontend && npm run build` |
| 同步数据库结构 | `cd backend && npx prisma db push` |
| 运行种子数据 | `cd backend && npm run seed` |
| 一键发布 | `bash deploy.sh` |
| 同步数据库到服务器 | `bash sync-db.sh` |
| 查看服务器容器状态 | `ssh root@120.55.183.31 "docker compose -f /root/fullstack-blog/docker-compose.yml ps"` |
