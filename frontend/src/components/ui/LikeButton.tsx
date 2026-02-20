import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

interface LikeButtonProps {
  articleId: number;
}

export default function LikeButton({ articleId }: LikeButtonProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/articles/${articleId}/like`)
      .then((res) => {
        setLiked(res.data.liked);
        setCount(res.data.count);
      })
      .catch(() => {});
  }, [articleId]);

  const handleToggle = async () => {
    if (!user) return alert('请先登录后再点赞');
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post(`/articles/${articleId}/like`);
      setLiked(res.data.liked);
      setCount(res.data.count);
    } catch {
      alert('操作失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium
        ${liked
          ? 'bg-red-50 border-red-300 text-red-500 hover:bg-red-100'
          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-gray-400'
        } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="text-base">{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  );
}
