import { useState, useEffect } from 'react';
import { getComments, createComment, deleteComment } from '../lib/api';
import type { Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ui/Toast';
import ConfirmModal from './ui/ConfirmModal';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(dateStr).toLocaleDateString();
}

function CommentItem({
  comment,
  slug,
  onDeleted,
  onReplyAdded,
  isReply = false,
}: {
  comment: Comment;
  slug: string;
  onDeleted: (id: number) => void;
  onReplyAdded: (parentId: number, reply: Comment) => void;
  isReply?: boolean;
}) {
  const { user, isApproved } = useAuth();
  const { showToast } = useToast();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canDelete = user && (user.id === comment.authorId || user.role === 'admin');

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const reply = await createComment(slug, { content: replyContent.trim(), parentId: comment.id });
      onReplyAdded(comment.id, reply);
      setReplyContent('');
      setShowReplyForm(false);
      showToast('回复成功', 'success');
    } catch {
      showToast('回复失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    setDeleting(true);
    try {
      await deleteComment(slug, deleteTarget);
      onDeleted(deleteTarget);
      showToast('评论已删除', 'success');
    } catch {
      showToast('删除失败', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
            {comment.author.username[0].toUpperCase()}
          </span>
          <span className="text-sm font-medium text-gray-800">{comment.author.username}</span>
          <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap ml-8">{comment.content}</p>
        <div className="flex gap-3 ml-8 mt-1">
          {isApproved && !isReply && (
            <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-xs text-gray-400 hover:text-blue-500">
              回复
            </button>
          )}
          {canDelete && (
            <button onClick={() => setDeleteTarget(comment.id)} className="text-xs text-gray-400 hover:text-red-500">
              删除
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="ml-8 mt-2">
      <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder="写下你的回复..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleReply}
                disabled={submitting || !replyContent.trim()}
                className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting ? '提交中...' : '回复'}
              </button>
              <button onClick={() => { setShowReplyForm(false); setReplyContent(''); }} className="text-xs px-3 py-1 text-gray-500 hover:text-gray-700">
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} slug={slug} onDeleted={onDeleted} onReplyAdded={onReplyAdded} isReply />
      ))}

      {deleteTarget !== null && (
        <ConfirmModal
          title="删除评论"
          message="确定要删除这条评论吗？"
          confirming={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default function CommentSection({ slug }: { slug: string }) {
  const { user, isApproved } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getComments(slug)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const comment = await createComment(slug, { content: content.trim() });
      setComments(prev => [comment, ...prev]);
      setContent('');
      showToast('评论成功', 'success');
    } catch {
      showToast('评论失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleted = (id: number) => {
    setComments(prev =>
      prev
        .filter(c => c.id !== id)
        .map(c => ({ ...c, replies: c.replies.filter(r => r.id !== id) }))
    );
  };

  const handleReplyAdded = (parentId: number, reply: Comment) => {
    setComments(prev =>
      prev.map(c => c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c)
    );
  };

  const totalCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="mt-10 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">评论 ({totalCount})</h3>

      {user && isApproved ? (
        <div className="mb-6">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="mt-2 px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? '提交中...' : '发表评论'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-6">
          {user ? '账号审核通过后即可评论' : '登录后即可评论'}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">暂无评论，来抢沙发吧</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              slug={slug}
              onDeleted={handleDeleted}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
