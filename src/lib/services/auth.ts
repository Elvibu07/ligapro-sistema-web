import { supabase } from '../supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'Administrador General' | 'Registrador de Clubes' | 'Auditor Disciplinario' | 'Coordinador VAR' | 'Comisión Arbitral';
  avatar: string;
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  // Predefined authorized demo accounts
  const demoAccounts: Record<string, { name: string, role: AuthUser['role'] }> = {
    'admin@ligapro.ec': { name: 'Abg. Carlos Manzur', role: 'Administrador General' },
    'clubes@ligapro.ec': { name: 'Ing. María José Flores', role: 'Registrador de Clubes' },
    'disciplina@ligapro.ec': { name: 'Dr. Roberto Ochoa', role: 'Auditor Disciplinario' },
    'var@ligapro.ec': { name: 'Ing. Wilson Ávila', role: 'Coordinador VAR' },
    'arbitros@ligapro.ec': { name: 'Ltc. Nestor Pitana', role: 'Comisión Arbitral' }
  };

  const isDemoEmail = email.toLowerCase() in demoAccounts;

  // Check if a password was recently recovered via the visual simulator
  const recoveredJson = localStorage.getItem('ligapro_recovered_passwords');
  let recoveredPasswords: Record<string, string> = {};
  try {
    if (recoveredJson) {
      recoveredPasswords = JSON.parse(recoveredJson);
    }
  } catch (e) {}

  const recoveredPassword = recoveredPasswords[email.toLowerCase()];

  // 1. If there is a recovered password for this email:
  if (recoveredPassword) {
    if (password === recoveredPassword) {
      // Try to find if there is a saved name for this email in localStorage
      let userName = email.split('@')[0];
      try {
        const registeredNamesJson = localStorage.getItem('ligapro_registered_names');
        if (registeredNamesJson) {
          const registeredNames = JSON.parse(registeredNamesJson);
          if (registeredNames[email.toLowerCase()]) {
            userName = registeredNames[email.toLowerCase()];
          }
        }
      } catch (e) {}

      const demo = demoAccounts[email.toLowerCase()] || { name: userName, role: 'Administrador General' as const };
      return {
        user: {
          id: isDemoEmail ? `demo-${demo.role.replace(/\s+/g, '-').toLowerCase()}` : `recovered-${email.replace(/[@.]/g, '-')}`,
          email: email.toLowerCase(),
          name: demo.name,
          role: demo.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(demo.name)}&background=CCFF00&color=0a0a0a&size=150&bold=true`,
        },
        error: null
      };
    } else {
      return {
        user: null,
        error: 'Contraseña de acceso incorrecta. Su contraseña ha sido restablecida y la anterior ha sido invalidada.'
      };
    }
  }

  // 2. If no recovered password, and it is a demo account, use default password
  if (isDemoEmail) {
    if (password === 'ligapro2026') {
      const demo = demoAccounts[email.toLowerCase()];
      return {
        user: {
          id: `demo-${demo.role.replace(/\s+/g, '-').toLowerCase()}`,
          email: email.toLowerCase(),
          name: demo.name,
          role: demo.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(demo.name)}&background=CCFF00&color=0a0a0a&size=150&bold=true`,
        },
        error: null
      };
    } else {
      return {
        user: null,
        error: 'Contraseña de demostración incorrecta (debe ser "ligapro2026").'
      };
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (isDemoEmail) {
        return { user: null, error: 'Contraseña de demostración incorrecta (debe ser "ligapro2026").' };
      }
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'No se pudo autenticar el usuario.' };
    }

    const profile = data.user.user_metadata;
    const name = profile?.name ?? email.split('@')[0];

    // Save the name in localStorage to preserve it during password recovery
    try {
      const registeredNamesJson = localStorage.getItem('ligapro_registered_names') || '{}';
      const registeredNames = JSON.parse(registeredNamesJson);
      registeredNames[email.toLowerCase()] = name;
      localStorage.setItem('ligapro_registered_names', JSON.stringify(registeredNames));
    } catch (e) {}

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
        name,
        role: profile?.role ?? 'Administrador General',
        avatar: profile?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=CCFF00&color=0a0a0a&size=150`,
      },
      error: null,
    };
  } catch (err: any) {
    // If Supabase is offline or not configured, let them bypass using demo credentials
    if (isDemoEmail && password === 'ligapro2026') {
      const demo = demoAccounts[email.toLowerCase()];
      return {
        user: {
          id: `demo-${demo.role.replace(/\s+/g, '-').toLowerCase()}`,
          email: email.toLowerCase(),
          name: demo.name,
          role: demo.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(demo.name)}&background=CCFF00&color=0a0a0a&size=150&bold=true`,
        },
        error: null
      };
    }
    return { user: null, error: 'Error de conexión. Inicialice su panel de Supabase o use las credenciales de demostración con contraseña "ligapro2026".' };
  }
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: AuthUser['role']
): Promise<{ user: AuthUser | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=CCFF00&color=0a0a0a&size=150`,
      },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: 'Error al crear el usuario.' };
  }

  // Save the name in localStorage to preserve it during password recovery
  try {
    const registeredNamesJson = localStorage.getItem('ligapro_registered_names') || '{}';
    const registeredNames = JSON.parse(registeredNamesJson);
    registeredNames[email.toLowerCase()] = name;
    localStorage.setItem('ligapro_registered_names', JSON.stringify(registeredNames));
  } catch (e) {}

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      name,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=CCFF00&color=0a0a0a&size=150`,
    },
    error: null,
  };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession(): Promise<AuthUser | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const profile = session.user.user_metadata;

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: profile?.name ?? session.user.email?.split('@')[0] ?? 'Usuario',
    role: profile?.role ?? 'Administrador General',
    avatar: profile?.avatar ?? `https://ui-avatars.com/api/?name=Usuario&background=CCFF00&color=0a0a0a&size=150`,
  };
}

export async function updateProfile(
  name: string,
  role: AuthUser['role'],
  avatar?: string,
  email?: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const customAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=CCFF00&color=0a0a0a&size=150`;
  
  // 1. If we have an email, let's cache the name locally in localStorage immediately!
  if (email) {
    try {
      const registeredNamesJson = localStorage.getItem('ligapro_registered_names') || '{}';
      const registeredNames = JSON.parse(registeredNamesJson);
      registeredNames[email.toLowerCase()] = name;
      localStorage.setItem('ligapro_registered_names', JSON.stringify(registeredNames));
    } catch (e) {}
  }

  try {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        name,
        role,
        avatar: customAvatar
      }
    });

    if (!error && data.user) {
      const profile = data.user.user_metadata;
      return {
        user: {
          id: data.user.id,
          email: data.user.email ?? email ?? '',
          name: profile?.name ?? name,
          role: profile?.role ?? role,
          avatar: profile?.avatar ?? customAvatar,
        },
        error: null,
      };
    }
  } catch (err) {}

  // 2. If Supabase fails or there is no session, and we have an email, fall back to simulated update!
  if (email) {
    const demoAccounts: Record<string, { name: string, role: AuthUser['role'] }> = {
      'admin@ligapro.ec': { name: 'Abg. Carlos Manzur', role: 'Administrador General' },
      'clubes@ligapro.ec': { name: 'Ing. María José Flores', role: 'Registrador de Clubes' },
      'disciplina@ligapro.ec': { name: 'Dr. Roberto Ochoa', role: 'Auditor Disciplinario' },
      'var@ligapro.ec': { name: 'Ing. Wilson Ávila', role: 'Coordinador VAR' },
      'arbitros@ligapro.ec': { name: 'Ltc. Nestor Pitana', role: 'Comisión Arbitral' }
    };
    const isDemoEmail = email.toLowerCase() in demoAccounts;

    return {
      user: {
        id: isDemoEmail ? `demo-${role.replace(/\s+/g, '-').toLowerCase()}` : `recovered-${email.replace(/[@.]/g, '-')}`,
        email: email.toLowerCase(),
        name: name,
        role: role,
        avatar: customAvatar,
      },
      error: null
    };
  }

  return { user: null, error: 'No se pudo actualizar el perfil. Sesión no activa.' };
}

