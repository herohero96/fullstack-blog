import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isApproved, isAdmin } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const statusBadge = user && user.status !== 'approved' ? (
    user.status === 'pending'
      ? <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">待审核</span>
      : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">已拒绝</span>
  ) : null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-gray-900 shrink-0">
            全栈博客
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              首页
            </Link>
            {isApproved && (
              <Link to="/create" className="text-gray-600 hover:text-gray-900 transition-colors">
                写文章
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin/users" className="text-gray-600 hover:text-gray-900 transition-colors">
                用户管理
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{user.username}</span>
                {statusBadge}
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  退出
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm text-blue-600 hover:underline">
                登录
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2 pt-3">
              <Link to="/" className="px-2 py-1.5 text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(false)}>
                首页
              </Link>
              {isApproved && (
                <Link to="/create" className="px-2 py-1.5 text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(false)}>
                  写文章
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin/users" className="px-2 py-1.5 text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(false)}>
                  用户管理
                </Link>
              )}
            </nav>
            <div className="mt-3 px-2 space-y-3">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{user.username}</span>
                  {statusBadge}
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-sm text-blue-600 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  登录
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
