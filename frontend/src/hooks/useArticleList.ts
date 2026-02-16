import { useState, useEffect, useCallback } from 'react';
import { getArticles } from '../lib/api';
import type { Article } from '../types';

interface UseArticleListOptions {
  category?: string;
  tag?: string;
}

export function useArticleList({ category, tag }: UseArticleListOptions) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback((p: number) => {
    setLoading(true);
    const params: Record<string, unknown> = { page: p, limit: 10 };
    if (category) params.category = category;
    if (tag) params.tag = tag;
    getArticles(params as any)
      .then((res) => {
        setArticles(res.articles);
        setTotalPages(res.totalPages);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [category, tag]);

  useEffect(() => {
    setPage(1);
    fetchArticles(1);
  }, [fetchArticles]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    fetchArticles(newPage);
  }, [fetchArticles]);

  const refresh = useCallback(() => {
    fetchArticles(page);
  }, [fetchArticles, page]);

  return { articles, page, totalPages, loading, onPageChange: handlePageChange, refresh };
}
