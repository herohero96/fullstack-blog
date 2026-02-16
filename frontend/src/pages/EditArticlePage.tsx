import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug } from '../lib/api';
import type { Article } from '../types';
import ArticleForm from '../components/article/ArticleForm';

export default function EditArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [initialData, setInitialData] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    getArticleBySlug(slug)
      .then(setInitialData)
      .catch(() => setError('加载文章失败。'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="animate-pulse max-w-4xl">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || '文章未找到。'}</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">返回首页</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">编辑文章</h1>
      <ArticleForm mode="edit" initialData={initialData} />
    </div>
  );
}
