import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-gray-500 mb-6">页面未找到</p>
      <Link to="/" className="text-blue-600 hover:underline">
        返回首页
      </Link>
    </div>
  );
}
