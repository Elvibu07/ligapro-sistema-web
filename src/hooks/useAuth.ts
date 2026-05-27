import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getSession, signIn, signOut, signUp, updateProfile, type AuthUser } from '../lib/services/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    getSession().then((sessionUser) => {
      setUser(sessionUser);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = session.user.user_metadata;
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: profile?.name ?? session.user.email?.split('@')[0] ?? 'Usuario',
          role: profile?.role ?? 'Administrador General',
          avatar: profile?.avatar ?? `https://ui-avatars.com/api/?name=Usuario&background=CCFF00&color=0a0a0a&size=150`,
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return false;
    }
    setUser(result.user);
    setLoading(false);
    return true;
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: AuthUser['role']
  ) => {
    setLoading(true);
    setError(null);
    const result = await signUp(email, password, name, role);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return false;
    }
    setUser(result.user);
    setLoading(false);
    return true;
  }, []);

  const update = useCallback(async (
    name: string,
    role: AuthUser['role'],
    avatar?: string
  ) => {
    setLoading(true);
    setError(null);
    const result = await updateProfile(name, role, avatar, user?.email);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return false;
    }
    setUser(result.user);
    setLoading(false);
    return true;
  }, [user]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  return { user, loading, error, login, register, update, logout, setError };
}

