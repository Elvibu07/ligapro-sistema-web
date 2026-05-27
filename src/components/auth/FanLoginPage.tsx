import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import logoImg from '../../ligapro-logo.png';
import type { AuthUser } from '../../lib/services/auth';

interface FanLoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (email: string, password: string, name: string, role: AuthUser['role']) => Promise<boolean>;
  onOAuthLogin: (provider: 'google' | 'facebook') => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
  onBack: () => void;
}

export default function FanLoginPage({ onLogin, onRegister, onOAuthLogin, loading, error, onClearError, onBack }: FanLoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClearError();
    if (mode === 'login') {
      await onLogin(email, password);
    } else if (mode === 'register') {
      await onRegister(email, password, name || email.split('@')[0], 'Fans / Admiradores');
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    onClearError();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden text-left">
      
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Volver al portal
        </button>

        {/* Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border border-slate-800 p-2 shadow-lg shadow-[#CCFF00]/10 mb-3 animate-pulse">
            <img src={logoImg} alt="LigaPro Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Portal de Fans</h1>
          <p className="text-slate-500 text-xs font-mono mt-1 uppercase tracking-widest">Acceso Público y Gratuito</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/50">

          {/* Tab switcher */}
          <div className="flex bg-slate-950 rounded-xl p-1 mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-[#CCFF00] text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-[#CCFF00] text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="hincha@correo.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-9 pr-4 py-2.5 rounded-lg text-xs placeholder-slate-650 focus:outline-none focus:border-[#CCFF00]/50 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-9 pr-10 py-2.5 rounded-lg text-xs placeholder-slate-650 focus:outline-none focus:border-[#CCFF00]/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-[11px] text-red-400">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#CCFF00] hover:bg-[#b5e000] text-slate-950 font-black py-3 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#CCFF00]/10"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Procesando...</>
              ) : mode === 'login' ? (
                'Entrar a Zona Fan'
              ) : (
                'Registrarme Gratis'
              )}
            </button>

            {/* Or divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-800" />
              <span className="px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">O ingresa rápido con</span>
              <div className="flex-1 border-t border-slate-800" />
            </div>

            {/* OAuth Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => onOAuthLogin('google')}
                className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:text-white text-slate-200 py-2.5 rounded-xl text-xs font-bold transition active:scale-[0.98] disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => onOAuthLogin('facebook')}
                className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:text-white text-slate-200 py-2.5 rounded-xl text-xs font-bold transition active:scale-[0.98] disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
            
          </form>

        </div>

      </div>
    </div>
  );
}
