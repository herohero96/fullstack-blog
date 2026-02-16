import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  requireApproved?: boolean;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireApproved, requireAdmin }: Props) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireApproved && user.status !== 'approved') {
    return <div className="text-center py-20"><p className="text-gray-500 text-lg">您的账号尚未通过审核，请等待管理员审批。</p></div>;
  }
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}
