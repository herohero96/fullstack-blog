# Fullstack Blog - Code Architecture Map

## Project Overview
Full-stack blog system with React frontend and Node.js backend, migrated from MongoDB/Mongoose to MySQL/Prisma ORM.

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS + React Router
- Backend: Node.js + Express 5 + TypeScript + Prisma ORM
- Database: MySQL/MariaDB
- Key Libraries: axios, react-markdown, react-syntax-highlighter

---

## Project Structure

```
fullstack-blog/
├── backend/                    # Node.js Express API
│   ├── prisma/
│   │   └── schema.prisma      # Database schema (MySQL)
│   └── src/
│       ├── index.ts           # Express app entry, middleware, routes
│       ├── config/
│       │   └── db.ts          # Prisma client with MariaDB adapter
│       ├── controllers/       # Business logic
│       │   ├── articleController.ts
│       │   ├── categoryController.ts
│       │   ├── tagController.ts
│       │   └── searchController.ts
│       ├── routes/            # Route definitions
│       │   ├── articleRoutes.ts
│       │   ├── categoryRoutes.ts
│       │   ├── tagRoutes.ts
│       │   └── searchRoutes.ts
│       └── scripts/
│           └── seed.ts        # Database seeding
│
└── frontend/                   # React SPA
    └── src/
        ├── main.tsx           # React entry point
        ├── App.tsx            # Router setup, ToastProvider
        ├── components/
        │   ├── article/
        │   │   └── ArticleCard.tsx       # Article preview card
        │   ├── editor/
        │   │   └── MarkdownEditor.tsx    # Markdown editor with preview
        │   ├── layout/
        │   │   ├── Layout.tsx            # Main layout wrapper
        │   │   ├── Header.tsx            # Top navigation
        │   │   ├── Sidebar.tsx           # Categories/tags sidebar
        │   │   └── Footer.tsx            # Footer
        │   └── ui/
        │       ├── Pagination.tsx        # Pagination component
        │       └── Toast.tsx             # Toast notifications
        ├── pages/
        │   ├── HomePage.tsx              # Article list
        │   ├── ArticlePage.tsx           # Single article view
        │   ├── CreateArticlePage.tsx     # Create article
        │   ├── EditArticlePage.tsx       # Edit article
        │   ├── CategoryPage.tsx          # Articles by category
        │   ├── TagPage.tsx               # Articles by tag
        │   └── SearchPage.tsx            # Search results
        ├── lib/
        │   └── api.ts                    # Axios API client
        └── types/
            └── index.ts                  # TypeScript interfaces
```

---

## Database Schema (Prisma)

```
Category (1:N Article)
├── id, name, slug (unique)
├── description, articleCount
└── timestamps

Tag (N:M Article via ArticleTag)
├── id, name, slug (unique)
├── color, articleCount
└── timestamps

Article
├── id, title, slug (unique)
├── content (LongText), summary (Text)
├── categoryId (FK → Category)
├── coverImage, published, viewCount
├── timestamps
└── fulltext index on [title, content]

ArticleTag (junction table)
├── articleId (FK → Article, cascade delete)
├── tagId (FK → Tag, cascade delete)
└── composite PK [articleId, tagId]
```

---

## Backend Architecture

### API Routes (RESTful)

**Articles** (`/api/articles`)
- `GET /` - List articles (pagination, filters: category, tag, published)
- `GET /:slug` - Get single article (increments viewCount)
- `POST /` - Create article
- `PUT /:slug` - Update article
- `DELETE /:slug` - Delete article

**Categories** (`/api/categories`)
- `GET /` - List all categories
- `POST /` - Create category
- `PUT /:id` - Update category
- `DELETE /:id` - Delete category

**Tags** (`/api/tags`)
- `GET /` - List all tags
- `POST /` - Create tag
- `PUT /:id` - Update tag
- `DELETE /:id` - Delete tag

**Search** (`/api/search`)
- `GET /?q=...` - Full-text search (title/content, with filters)

### Controllers

**articleController.ts**
- Handles CRUD operations
- Manages ArticleTag junction table
- Auto-updates articleCount on Category/Tag
- Transforms ArticleTag[] → Tag[] in responses
- Generates unique slugs (title + timestamp)

**categoryController.ts / tagController.ts**
- Simple CRUD operations
- Returns sorted lists (by name)

**searchController.ts**
- Prisma `contains` search on title/content
- Supports category/tag filters
- Pagination support

### Database Layer

**db.ts**
- Initializes PrismaClient with MariaDB adapter
- Connection pooling (limit: 5)
- Environment-based config

---

## Frontend Architecture

### Routing (React Router v7)

```
/ → HomePage (article list)
/article/:slug → ArticlePage (single article)
/create → CreateArticlePage (new article form)
/edit/:slug → EditArticlePage (edit form)
/category/:slug → CategoryPage (filtered list)
/tag/:slug → TagPage (filtered list)
/search?q=... → SearchPage (search results)
```

### Pages

**HomePage** - Fetches paginated articles, renders ArticleCard grid
**ArticlePage** - Single article with markdown rendering + syntax highlighting
**CreateArticlePage / EditArticlePage** - MarkdownEditor, category/tag selection, draft/publish toggle
**CategoryPage / TagPage** - Filtered article lists
**SearchPage** - Search input + results with query parameter handling

### Components

**ArticleCard** - Preview card with cover image, category badge, tags, edit/delete actions
**MarkdownEditor** - Split-pane editor with real-time markdown preview
**Layout** - Header (nav, search, create) + Sidebar (categories, tags) + Footer
**Pagination** - Page navigation with current page highlighting
**Toast** - Context-based notification system (success/error/info, auto-dismiss)

### API Client (lib/api.ts)

Axios instance with `/api` base URL.

**Data transformation:**
- Frontend `Article.category` (object) ↔ Backend `categoryId` (number)
- Frontend `Article.tags` (Tag[]) ↔ Backend `tags` (number[])

**Exported functions:**
- `getArticles()`, `getArticleBySlug()`, `createArticle()`, `updateArticle()`, `deleteArticle()`
- `getCategories()`, `getCategoryBySlug()`
- `getTags()`, `getTagBySlug()`
- `searchArticles()`

### Type System (types/index.ts)

```typescript
Category { id, name, slug, description, timestamps }
Tag { id, name, slug, timestamps }
Article { id, title, slug, summary, content, coverImage,
          category?, categoryId?, tags[], published,
          viewCount, timestamps }
PaginatedResponse<T> { articles, total, page, totalPages }
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                                                             │
│  Pages (HomePage, ArticlePage, etc.)                       │
│    ↓ useState/useEffect                                    │
│  API Client (lib/api.ts)                                   │
│    ↓ axios.get/post/put/delete                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Request → /api/*
                           ↓ CORS, JSON parsing
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│                                                             │
│  Express App (index.ts)                                    │
│    ↓ Route matching                                        │
│  Routes → Controllers → Prisma Client → MyL              │
│    ↓ Response transformation                               │
└──────────────────────────┬──────────────────────────────────┘
                           │ JSON response
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                                                             │
│  API Client receives data → Pages update state              │
│    → React re-render → Components display data              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Flows

### Article CRUD
- **Create:** CreateArticlePage → api.createArticle() → POST /api/articles → Prisma creates Article + ArticleTag → updates articleCount
- **Read:** HomePage → api.getArticles() → GET /api/articles → Prisma query with joins → transforms ArticleTag[] → Tag[]
- **Update:** EditArticlePage → api.updateArticle() → PUT /api/articles/:slug → deletes old + creates new ArticleTag → recalculates articleCount
- **Delete:** ArticleCard → confirmation → api.deleteArticle() → DELETE /api/articles/:slug → cascade deletes ArticleTag → decrements articleCount

### Search
Header search → /search?q=... → api.searchArticles() → GET /api/search → Prisma `contains` on title/content → paginated results

### Category/Tag Filtering
Sidebar links → /category/:slug or /tag/:slug → fetch by slug → api.getArticles({ filter }) → filtered list

---

## Module Dependencies

**Backend:** index.ts → routes → controllers → db.ts → Prisma → MySQL
**Frontend:** main.tsx → App.tsx → Layout → Pages → Components, all pages depend on lib/api.ts and types/index.ts
**Cross-cutting:** Toast context wraps entire app, Pagination reused across list pages, ArticleCard shared by HomePage/CategoryPage/TagPage/SearchPage
