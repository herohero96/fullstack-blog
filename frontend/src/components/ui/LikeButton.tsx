import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from './Toast';
import api from '../../lib/api';

interface LikeButtonProps {
  slug: string;
}

export default function LikeButton({ slug }: LikeButtonProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/articles/${slug}/like`)
      .then((res) => {
        setLiked(res.data.liked);
        setCount(res.data.count);
      })
      .catch(() => {});
  }, [slug]);

  const handleToggle = async () => {
    if (!user) {
      showToast('请先登录后再点赞', 'error');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post(`/articles/${slug}/like`);
      setLiked(res.data.liked);
      setCount(res.data.count);
    } catch {
      showToast('操作失败，请稍后再试', 'error');
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
