import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import api from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isApproved: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isApproved: user?.status === 'approved', isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}
