import { useState, useEffect } from 'react';
import { database } from '../supabase';
import { useAuth } from '../../contexts/AuthContext';

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    checkAdminStatus();
  }, [user, isLoggedIn]);

  const checkAdminStatus = async () => {
    if (!isLoggedIn || !user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await database.getUserProfile(user.id);
      
      if (error) {
        throw error;
      }
      
      setIsAdmin(data?.is_admin || false);
    } catch (err: any) {
      setError(err.message || 'Failed to check admin status');
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { isAdmin, isLoading, error, refetch: checkAdminStatus };
}