import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCategories, getTags } from '../../lib/api';

interface SidebarItem {
  id: number;
  name: string;
  slug: string;
}

export default function Sidebar() {
  const [categories, setCategories] = useState<SidebarItem[]>([]);
  const [tags, setTags] = useState<SidebarItem[]>([]);
  const [collapsed, setCollapsed] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const location = useLocation();

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setLoadError(true));
    getTags().then(setTags).catch(() => setLoadError(true));
  }, []);

  return (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`${collapsed ? 'translate-x-full' : 'translate-x-0'} lg:translate-x-0 fixed lg:static right-0 top-16 w-64 h-[calc(100vh-4rem)] lg:h-auto bg-white border-l lg:border-l-0 lg:border-r border-gray-200 p-5 overflow-y-auto transition-transform z-30 shrink-0`}>
        {loadError && (
          <p className="text-xs text-red-400 mb-4">加载分类/标签失败</p>
        )}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">分类</h3>
          {categories.length === 0 ? (
            <p className="text-xs text-gray-400 px-3">暂无分类</p>
          ) : (
            <ul className="space-y-1">
              {categories.map((cat) => {
                const isActive = location.pathname === `/category/${cat.slug}`;
                return (
                  <li key={cat.id}>
                    <Link
                      to={`/category/${cat.slug}`}
                      className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setCollapsed(true)}
                    >
                      {cat.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">标签</h3>
          {tags.length === 0 ? (
            <p className="text-xs text-gray-400 px-3">暂无标签</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isActive = location.pathname === `/tag/${tag.slug}`;
                return (
                  <Link
                    key={tag.id}
                    to={`/tag/${tag.slug}`}
                    className={`inline-block px-2.5 py-1 rounded-full text-xs transition-colors ${isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => setCollapsed(true)}
                  >
                    {tag.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-20"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
}
