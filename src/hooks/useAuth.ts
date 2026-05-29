import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getSession, signIn, signOut, signUp, updateProfile, signInWithOAuth, type AuthUser } from '../lib/services/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    getSession().then((sessionUser) => {
      if (sessionUser) {
        setUser(sessionUser);
      } else {
        const mockSession = localStorage.getItem('ligapro_mock_session');
        if (mockSession) {
          try {
            setUser(JSON.parse(mockSession));
          } catch (e) {}
        }
      }
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
        localStorage.removeItem('ligapro_mock_session');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync user state to localStorage for mock persistence
  useEffect(() => {
    if (user) {
      localStorage.setItem('ligapro_mock_session', JSON.stringify(user));
    }
  }, [user]);

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

  const loginWithOAuth = useCallback(async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError(null);
    
    const result = await signInWithOAuth(provider);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return false;
    }
    
    // Supabase will automatically redirect to the provider's page.
    // If we reach this line, the redirect is happening.
    return true;
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    localStorage.removeItem('ligapro_mock_session');
    setUser(null);
  }, []);

  return { user, loading, error, login, register, update, logout, loginWithOAuth, setError };
}

