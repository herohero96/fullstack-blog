import { Link } from 'react-router-dom';
import type { Article } from '../../types';
import { deleteArticle } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { useState } from 'react';
import ConfirmModal from '../ui/ConfirmModal';

interface ArticleCardProps {
  article: Article;
  onDeleted?: () => void;
}

export default function ArticleCard({ article, onDeleted }: ArticleCardProps) {
  const { showToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteArticle(article.slug);
      showToast('文章已删除', 'success');
      onDeleted?.();
    } catch {
      showToast('删除文章失败', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <article className="bg-white rounded-lg border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow">
      {article.coverImage && (
        <Link to={`/article/${article.slug}`}>
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        </Link>
      )}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {article.category && (
          <Link
            to={`/category/${article.category.slug}`}
            className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded"
          >
            {article.category.name}
          </Link>
        )}
        {!article.published && (
          <span className="text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">草稿</span>
        )}
        <span className="text-xs text-gray-400">
          {new Date(article.createdAt).toLocaleDateString()}
        </span>
      </div>
      <Link to={`/article/${article.slug}`}>
        <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
          {article.title}
        </h2>
      </Link>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.summary}</p>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/tag/${tag.slug}`}
              className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <Link
            to={`/edit/${article.slug}`}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
          >
            编辑
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            删除
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="删除文章"
          message={`确定要删除「${article.title}」吗？`}
          confirming={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </article>
  );
}
