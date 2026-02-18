import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchArticles } from '../lib/api';
import type { Article } from '../types';
import Pagination from '../components/ui/Pagination';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function SearchPage() {
  useDocumentTitle('搜索结果');
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(query);

  const doSearch = useCallback((q: string, p: number) => {
    if (!q.trim()) {
      setArticles([]);
      return;
    }
    setLoading(true);
    searchArticles(q, { page: p, limit: 10 })
      .then((res) => {
        setArticles(res.articles);
        setTotalPages(res.totalPages);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    doSearch(query, page);
  }, [query, page, doSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim() !== query) {
        setPage(1);
        setSearchParams(inputValue.trim() ? { q: inputValue.trim() } : {});
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, query, setSearchParams]);

  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part
    );
  };

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="搜索文章..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : query && articles.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <h3 className="mt-3 text-sm font-medium text-gray-900">未找到结果</h3>
          <p className="mt-1 text-sm text-gray-500">请尝试其他关键词或检查拼写。</p>
        </div>
      ) : !query ? (
        <p className="text-gray-500 text-center py-12">输入关键词搜索文章。</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            找到 {articles.length} 条关于"{query}"的结果
          </p>
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow">
                <Link to={`/article/${article.slug}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                  {highlightText(article.title, query)}
                </Link>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {highlightText(article.summary, query)}
            </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  {article.category && <span>{article.category.name}</span>}
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
