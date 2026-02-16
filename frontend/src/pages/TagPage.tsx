import { useParams } from 'react-router-dom';
import ArticleCard from '../components/article/ArticleCard';
import Pagination from '../components/ui/Pagination';
import { useArticleList } from '../hooks/useArticleList';

export default function TagPage() {
  const { slug } = useParams<{ slug: string }>();
  const { articles, page, totalPages, loading, onPageChange, refresh } = useArticleList({ tag: slug });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        标签: <span className="text-blue-600">#{slug}</span>
      </h1>
      {articles.length === 0 ? (
        <p className="text-gray-500 text-center py-12">该标签下暂无文章。</p>
      ) : (
        <>
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} onDeleted={refresh} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}
