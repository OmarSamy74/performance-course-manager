import { useState, useEffect } from 'react';
import { authApi, getAuthToken, setAuthToken } from '../api/client';
import { User, UserRole } from '../../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken();
    if (token) {
      authApi.getCurrentUser()
        .then(({ user }) => setUser(user))
        .catch(() => {
          setAuthToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { user, token } = await authApi.login(username, password);
      setUser(user);
      return { user, token };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  return { user, loading, login, logout };
}
