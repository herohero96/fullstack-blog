import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { remarkPlugins, rehypePlugins, markdownComponents } from '../components/editor/markdownConfig';
import { getArticleBySlug, deleteArticle } from '../lib/api';
import type { Article } from '../types';
import { useToast } from '../components/ui/Toast';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import CommentSection from '../components/CommentSection';
import LikeButton from '../components/ui/LikeButton';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isApproved } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useDocumentTitle(article?.title);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getArticleBySlug(slug)
      .then(setArticle)
      .catch(() => setError('文章未找到。'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Manage OG meta tags
  useEffect(() => {
    if (!article) return;
    const metas: HTMLMetaElement[] = [];
    const ogTags: Record<string, string> = {
      'og:title': article.title,
      'og:description': article.summary || '',
      'og:type': 'article',
    };
    for (const [property, content] of Object.entries(ogTags)) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
      metas.push(meta);
    }
    return () => {
      metas.forEach(m => m.remove());
    };
  }, [article]);

  const handleDelete = async () => {
    if (!article) return;
    setDeleting(true);
    try {
      await deleteArticle(article.slug);
      showToast('文章已删除', 'success');
      navigate('/');
    } catch {
      showToast('删除文章失败', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || '文章未找到。'}</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">返回首页</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          返回
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{article.title}</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          {article.category && (
            <Link to={`/category/${article.category.slug}`} className="text-blue-600 hover:underline">
              {article.category.name}
            </Link>
          )}
          <span>{article.viewCount} 次浏览</span>
          {!article.published && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">草稿</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {article.tags.map((tag) => (
            <Link key={tag.id} to={`/tag/${tag.slug}`} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full hover:bg-gray-200">
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={markdownComponents}
        >
          {article.content}
        </ReactMarkdown>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
        <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">返回列表</Link>
        {isApproved && (
          <>
            <Link to={`/edit/${article.slug}`} className="text-sm text-blue-600 hover:underline">编辑</Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-red-600 hover:underline"
            >
              删除
            </button>
          </>
        )}
      </div>

      <div className="flex justify-center my-6">
        <LikeButton articleId={article.id} />
      </div>
      <CommentSection slug={article.slug} />

      {showDeleteConfirm && (
        <ConfirmModal
       title="删除文章"
          message={`确定要删除「${article.title}」吗？此操作无法撤销。`}
          confirming={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </article>
  );
}
