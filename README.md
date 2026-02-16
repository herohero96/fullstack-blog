# Fullstack Blog - 部署与数据库迁移指南

## 项目构建

### 后端构建

```bash
cd backend
npm install
npm run build
```

构建产物在 `backend/dist/` 目录下。

### 前端构建

```bash
cd frontend
npm install
npm run build
```

构建产物在 `frontend/dist/` 目录下，是纯静态文件（HTML/CSS/JS）。

---

## 服务器部署

### 1. 环境准备

服务器需要安装：

- Node.js 18+
- MySQL 8.x
- Nginx（用于反向代理和托管前端静态文件）
- PM2（用于后端进程管理）

```bash
# 安装 PM2
npm install -g pm2
```

### 2. 上传代码到服务器

```bash
# 方式一：git clone
ssh your-server
git clone your-repo-url /var/www/fullstack-blog
cd /var/www/fullstack-blog

# 方式二：本地打包上传
# 本地执行
tar -czf blog-deploy.tar.gz backend/dist backend/package.json backend/prisma frontend/dist
scp blog-deploy.tar.gz user@your-server:/var/www/fullstack-blog/

# 服务器上解压
ssh your-server
cd /var/www/fullstack-blog
tar -xzf blog-deploy.tar.gz
```

### 3. 服务器上配置后端

```bash
cd /var/www/fullstack-blog/backend

# 安装生产依赖
npm install --production

# 创建 .env 文件
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的服务器数据库密码
DB_NAME=fullstack_blog
DATABASE_URL=mysql://root:你的服务器数据库密码@localhost:3306/fullstack_blog
JWT_SECRET=改成一个随机长字符串
JWT_EXPIRES_IN=7d
EOF

# 同步数据库结构
npx prisma db push

# 生成 Prisma Client
npx prisma generate

# 运行种子数据（首次部署时执行，创建管理员账号）
npm run seed
```

### 4. 用 PM2 启动后端

```bash
cd /var/www/fullstack-blog/backend

# 启动
pm2 start dist/index.js --name blog-api

# 常用 PM2 命令
pm2 status          # 查看状态
pm2 logs blog-api   # 查看日志
pm2 restart blog-api # 重启
pm2 stop blog-api   # 停止

# 设置开机自启
pm2 save
pm2 startup
```

### 5. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /var/www/fullstack-blog/frontend/dist;
    index index.html;

    # 前端路由 - 所有非文件请求都返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 测试配置并重载
nginx -t
nginx -s reload
```

### 6. 更新部署

每次有代码更新时：

```bash
# 服务器上执行
cd /var/www/fullstack-blog
git pull

# 重新构建后端
cd backend
npm install
npm run build
pm2 restart blog-api

# 重新构建前端
cd ../frontend
npm install
npm run build

# 如果有数据库 schema 变更
cd ../backend
npx prisma db push
npx prisma generate
pm2 restart blog-api
```

---

## 数据库迁移：本地 → 服务器

### 方式一：mysqldump 导出导入（推荐）

#### 本地导出

```bash
# 导出完整数据库（结构 + 数据）
mysqldump -u root -phero1234 fullstack_blog > fullstack_blog_backup.sql

# 只导出数据（不含建表语句，适合表结构已同步的情况）
mysqldump -u root -phero1234 --no-create-info fullstack_blog > fullstack_blog_data.sql

# 导出指定表
mysqldump -u root -phero1234 fullstack_blog article category tag articletag user > tables_backup.sql
```

#### 上传到服务器

```bash
scp fullstack_blog_backup.sql user@your-server:/tmp/
```

#### 服务器上导入

```bash
# 先确保数据库存在
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS fullstack_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入完整备份（会覆盖已有数据）
mysql -u root -p fullstack_blog < /tmp/fullstacklog_backup.sql

# 如果只导入数据（表结构已通过 prisma db push 同步）
mysql -u root -p fullstack_blog < /tmp/fullstack_blog_data.sql
```

### 方式二：Prisma 同步结构 + mysqldump 同步数据

适合服务器是全新环境的情况：

```bash
# 1. 服务器上：用 Prisma 创建表结构
cd /var/www/fullstack-blog/backend
npx prisma db push

# 2. 本地：只导出数据
mysqldump -u root -phero1234 --no-create-info --complete-insert fullstack_blog > data_only.sql

# 3. 上传并导入
scp data_only.sql user@your-server:/tmp/
ssh your-server "mysql -u root -p fullstack_blog < /tmp/data_only.sql"
```

### 方式三：逐表迁移（精细控制）

当你只想同步部分数据时：

```bash
# 本地：导出文章相关数据（注意顺序，先导父表再导子表）
mysqldump -root -phero1234 --no-create-info fullstack_blog category tag user article articletag > content_data.sql

# 上传并导入
scp content_data.sql user@your-server:/tmp/
ssh your-server "mysql -u root -p fullstack_blog < /tmp/content_data.sql"
```

### 注意事项

1. 导入前建议先备份服务器数据库：
   ```bash
   # 服务器上
   mysqldump -u root -p fullstack_blog > /tmp/server_backup_$(date +%Y%m%d).sql
   ```

2. 如果本地和服务器的自增 ID 冲突，导入时会报错。解决方法：
   ```bash
   # 导出时加 --replace 参数，用 REPLACE INTO 代替 INSERT INTO
   mysqldump -u root -phero1234 --no-create-info --replace fullstack_blog > data_replace.sql
   ```

3. 用户表的密码是 bcrypt 哈希，直接迁移即可，不需要特殊处理。

4. 导出时排除敏感的 user 表（如果服务器已有独立的用户数据）：
   ```bash
   mysqldump -u root -phero1234 --no-create-info fullstack_blog --ignore-table=fullstack_blog.user > data_no_users.sql
   ```

---

## 快速参考

| 操作 | 命令 |
|------|------|
| 本地启动后端 | `cd backend && npm run dev` |
| 本地启动前端 | `cd frontend && npm run dev` |
| 构建后端 | `cd backend && npm run build` |
| 构建前端 | `cd frontend && npm run build` |
| 同步数据库结构 | `cd backend && npx prisma db push` |
| 运行种子数据 | `cd backend && npm run seed` |
| 导出本地数据库 | `mysqldump -u root -phero1234 fullstack_blog > backup.sql` |
| 导入到服务器 | `mysql -u root -p fullstack_blog < backup.sql` |
| PM2 启动后端 | `pm2 start dist/index.js --napi` |
| PM2 查看日志 | `pm2 logs blog-api` |
| PM2 重启 | `pm2 restart blog-api` |

## 默认账号

- 管理员：admin@blog.com / admin123
- 部署到生产环境后请立即修改密码
