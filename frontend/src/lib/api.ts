import axios from 'axios';
import type { Article, Category, Tag, PaginatedResponse, Comment } from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Articles
export const getArticles = (params?: { page?: number; limit?: number; category?: string; tag?: string }) =>
  api.get<PaginatedResponse<Article>>('/articles', { params }).then(res => res.data);

export const getArticleBySlug = (slug: string) =>
  api.get<Article>(`/articles/${slug}`).then(res => res.data);

// Helper to transform frontend article data to backend format
const transformArticleData = (data: Partial<Article>) => {
  const payload: Record<string, unknown> = { ...data };
  // Transform category object to categoryId number
  if (data.category !== undefined) {
    payload.categoryId = data.category ? data.category.id : null;
    delete payload.category;
  }
  // Transform tag objects to tag ID array
  if (data.tags !== undefined) {
    payload.tags = data.tags.map((t: Tag) => t.id);
  }
  return payload;
};

export const createArticle = (data: Partial<Article>) =>
  api.post<Article>('/articles', transformArticleData(data)).then(res => res.data);

export const updateArticle = (slug: string, data: Partial<Article>) =>
  api.put<Article>(`/articles/${slug}`, transformArticleData(data)).then(res => res.data);

export const deleteArticle = (slug: string) =>
  api.delete(`/articles/${slug}`).then(res => res.data);

// Categories
export const getCategories = () =>
  api.get<Category[]>('/categories').then(res => res.data);

export const getCategoryBySlug = (slug: string) =>
  api.get<Category>(`/categories/${slug}`).then(res => res.data);

// Tags
export const getTags = () =>
  api.get<Tag[]>('/tags').then(res => res.data);

export const getTagBySlug = (slug: string) =>
  api.get<Tag>(`/tags/${slug}`).then(res => res.data);

// Search
export const searchArticles = (q: string, params?: { page?: number; limit?: number }) =>
  api.get<PaginatedResponse<Article>>('/search', { params: { q, ...params } }).then(res => res.data);

export default api;

// Comments
export const getComments = (slug: string) =>
  api.get<Comment[]>(`/articles/${slug}/comments`).then(res => res.data);

export const createComment = (slug: string, data: { content: string; parentId?: number | null }) =>
  api.post<Comment>(`/articles/${slug}/comments`, data).then(res => res.data);

export const deleteComment = (slug: string, id: number) =>
  api.delete(`/articles/${slug}/comments/${id}`).then(res => res.data);
