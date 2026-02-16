export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string;
  category?: Category;
  categoryId?: number | null;
  tags: Tag[];
  published: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  articles: T[];
  total: number;
  page: number;
  totalPages: number;
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
