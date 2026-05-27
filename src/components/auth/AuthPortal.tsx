import React from 'react';
import { Shield, Users, ArrowRight } from 'lucide-react';
import logoImg from '../../ligapro-logo.png';

interface AuthPortalProps {
  onSelectPortal: (portal: 'fan' | 'admin') => void;
}

export default function AuthPortal({ onSelectPortal }: AuthPortalProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-left">
      
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-900 border border-slate-800 p-3 shadow-lg shadow-[#CCFF00]/20 mb-6 animate-pulse">
            <img src={logoImg} alt="LigaPro Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Bienvenido a LIGAPRO</h1>
          <p className="text-slate-400 font-medium">Seleccione su portal de acceso para continuar</p>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full">
          
          {/* Fan Portal Card */}
          <button 
            onClick={() => onSelectPortal('fan')}
            className="group relative bg-slate-900 border border-slate-800 hover:border-[#CCFF00]/50 rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:shadow-[#CCFF00]/20 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#CCFF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#CCFF00]/30 transition-all duration-300">
              <Users size={32} className="text-[#CCFF00]" />
            </div>
            
            <h2 className="text-xl font-black text-white mb-3">Portal para Fans</h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Ingresa para ver resultados en vivo, tabla de posiciones, fixture y accede a nuestra Zona Fan interactiva. ¡Es gratis!
            </p>
            
            <div className="mt-auto w-full flex items-center justify-center gap-2 text-[#CCFF00] font-bold text-sm bg-[#CCFF00]/10 py-3 rounded-xl group-hover:bg-[#CCFF00] group-hover:text-slate-950 transition-colors">
              Ingresar como Fan <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Admin Portal Card */}
          <button 
            onClick={() => onSelectPortal('admin')}
            className="group relative bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-300">
              <Shield size={32} className="text-blue-500" />
            </div>
            
            <h2 className="text-xl font-black text-white mb-3">Portal Oficial LIGAPRO</h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Acceso restringido exclusivo para Directivos, Árbitros, Comisión Disciplinaria y personal autorizado.
            </p>
            
            <div className="mt-auto w-full flex items-center justify-center gap-2 text-blue-400 font-bold text-sm bg-blue-500/10 py-3 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              Ingresar como Funcionario <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-[10px] font-mono text-slate-700 mt-12 uppercase tracking-widest select-none">
          LIGAPRO © 2026 — Plataforma Oficial de Competiciones
        </p>

      </div>
    </div>
  );
}
