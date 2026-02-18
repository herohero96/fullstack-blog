import { useState, useEffect, useCallback } from 'react';
import { getArticles } from '../lib/api';
import type { Article } from '../types';
import ArticleCard from '../components/article/ArticleCard';
import Pagination from '../components/ui/Pagination';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle();
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchArticles = useCallback((p: number) => {
    setLoading(true);
    getArticles({ page: p, limit: 10 })
      .then((res) => {
        setArticles(res.articles);
        setTotalPages(res.totalPages);
      })
      .catch(() => {
        setError('加载文章失败，后端服务可能未启动。');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchArticles(page);
  }, [page, fetchArticles]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-1" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <h3 className="mt-3 text-sm font-medium text-gray-900">暂无文章</h3>
        <p className="mt-1 text-sm text-gray-500">开始创建你的第一篇文章吧。</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} onDeleted={() => fetchArticles(page)} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
