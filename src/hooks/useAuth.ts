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

  const loginWithOAuth = useCallback(async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError(null);
    
    // NOTA: Para usar el login real de Supabase, primero debes habilitar Google y Facebook 
    // en tu panel de Supabase (Authentication -> Providers) y poner tus Client ID / Secrets.
    // Como aún no están configurados, ejecutamos la simulación visual premium.
    
    console.warn(`Simulating ${provider} login because providers are not enabled in Supabase yet...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockFanUser = {
      id: `oauth-fan-${provider}-${Math.random().toString(36).substring(2, 9)}`,
      email: `hincha.${provider}@ligapro.ec`,
      name: `Hincha ${provider === 'google' ? 'Google' : 'Facebook'}`,
      role: 'Fans / Admiradores' as const,
      avatar: provider === 'google' 
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' 
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
    };
    
    setUser(mockFanUser);
    setLoading(false);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  return { user, loading, error, login, register, update, logout, loginWithOAuth, setError };
}

