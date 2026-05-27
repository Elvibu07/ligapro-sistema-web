import React, { useState } from "react";
import { LockKeyhole, ShieldCheck, Mail, Smartphone, RefreshCw, Eye, Power, CheckCircle2, Key, Bell, Users, Camera, Check } from "lucide-react";
import { SystemUser } from "../types";

interface SecuritySettingsViewProps {
  currentUser: SystemUser;
  onUpdateProfile: (name: string, role: any, avatar?: string) => Promise<boolean>;
}

interface ActiveSession {
  id: string;
  browser: string;
  city: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SecuritySettingsView({ currentUser, onUpdateProfile }: SecuritySettingsViewProps) {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  
  // Profile settings state
  const [editName, setEditName] = useState(currentUser.name);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // MFA configurations state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaVerificationCode, setMfaVerificationCode] = useState("");
  const [mfaSetupActive, setMfaSetupActive] = useState(false);
  const [mfaSuccess, setMfaSuccess] = useState(false);

  // Active sessions controls
  const [sessions, setSessions] = useState<ActiveSession[]>([
    { id: "sess-1", browser: "Mozilla Firefox / Windows 11 (Guayaquil)", city: "Guayaquil", ip: "186.46.20.141", lastActive: "Ahora mismo (Activa)", isCurrent: true },
    { id: "sess-2", browser: "Google Chrome / MacOS Big Sur (Quito)", city: "Quito", ip: "190.152.122.90", lastActive: "Hace 45 minutos", isCurrent: false },
    { id: "sess-3", browser: "Safari / iPhone 15 Pro Max (Guayaquil)", city: "Guayaquil", ip: "186.46.22.100", lastActive: "Ayer, 14:32", isCurrent: false }
  ]);

  const handleRevokeSession = (sessionId: string, city: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    window.dispatchEvent(new CustomEvent('ligapro-notification', {
      detail: {
        text: `Sesión en terminal de ${city} revocada exitosamente`,
        type: "seguridad",
        view: "security"
      }
    }));
    alert(`Sesión en terminal de ${city} revocada exitosamente por seguridad.`);
  };

  const handleToggleMfa = () => {
    if (mfaEnabled) {
      setMfaEnabled(false);
      setMfaSuccess(false);
      window.dispatchEvent(new CustomEvent('ligapro-notification', {
        detail: {
          text: "Doble Factor de Autenticación (MFA) desactivado",
          type: "seguridad",
          view: "security"
        }
      }));
    } else {
      setMfaSetupActive(true);
    }
  };

  const verifyMfaCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaVerificationCode === "123456" || mfaVerificationCode.length === 6) {
      setMfaEnabled(true);
      setMfaSetupActive(false);
      setMfaSuccess(true);
      window.dispatchEvent(new CustomEvent('ligapro-notification', {
        detail: {
          text: "Doble Factor (MFA) activado en tu pasaporte deportivo",
          type: "seguridad",
          view: "security"
        }
      }));
      alert("Multifactor OTP (MFA) activado correctamente en su pasaporte deportivo.");
    } else {
      alert("Código OTP incorrecto. Intente con el pin demostrativo '123456'.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert("El nombre completo es requerido.");
      return;
    }
    setSaving(true);
    setSaveSuccess(false);

    const success = await onUpdateProfile(editName, currentUser.role, editAvatar);
    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      window.dispatchEvent(new CustomEvent('ligapro-notification', {
        detail: {
          text: `Perfil de "${editName}" actualizado con éxito`,
          type: "seguridad",
          view: "security"
        }
      }));
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert("Hubo un error al actualizar los datos en Supabase.");
    }
  };

  const handleRegenerateAvatar = () => {
    const preset = `https://ui-avatars.com/api/?name=${encodeURIComponent(editName || "Usuario")}&background=CCFF00&color=0a0a0a&size=150&bold=true`;
    setEditAvatar(preset);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold font-sans text-white tracking-tight">Acceso y Configuración de Perfil</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">Consola para administración de tu perfil oficial, roles de seguridad y llaves de autenticación multifactor.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Profile Card and Settings */}
        <div className="bg-slate-950 border border-slate-855 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-900 pb-4">
            <div className="relative group">
              <img 
                src={editAvatar} 
                alt={currentUser.name} 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#CCFF00] shadow-md shadow-[#CCFF00]/10" 
                referrerPolicy="no-referrer"
              />
              <button 
                type="button"
                onClick={handleRegenerateAvatar}
                className="absolute -bottom-1 -right-1 p-1 bg-slate-900 hover:bg-[#CCFF00] hover:text-slate-950 rounded-lg text-[9px] text-[#CCFF00] border border-slate-800 transition"
                title="Regenerar avatar con iniciales"
              >
                <Camera size={10} />
              </button>
            </div>
            <div>
              <p className="text-sm font-black text-slate-100">{currentUser.name}</p>
              <span className="text-[9.5px] font-mono text-[#CCFF00] uppercase tracking-wider font-bold">{currentUser.role}</span>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Nombre Completo</label>
              <input 
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-slate-200 rounded focus:outline-none focus:border-[#CCFF00]/40 transition font-medium"
                placeholder="Ej. Abg. Carlos Manzur"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Correo Electrónico (Solo Lectura)</label>
              <input 
                type="email"
                value={currentUser.email}
                disabled
                className="w-full bg-slate-900/40 border border-slate-850 p-2 text-xs text-slate-500 rounded cursor-not-allowed select-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Rol Administrativo Oficial (Asignado)</label>
              <div className="w-full bg-slate-900/40 border border-slate-850 p-2 rounded text-xs text-slate-400 cursor-not-allowed select-none font-mono flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#CCFF00] shrink-0"></span>
                {currentUser.role}
              </div>
              <p className="text-[9px] text-slate-600 font-mono mt-1">
                El rol es asignado exclusivamente por la administración de la liga y no puede ser modificado por el usuario.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Avatar URL</label>
              <input 
                type="url"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2 text-[11px] text-slate-300 rounded focus:outline-none font-mono"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-[#CCFF00] hover:bg-[#b0dc00] disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black rounded-lg text-xs transition active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              {saving ? "Guardando en Supabase..." : "Guardar Perfil de Usuario"}
            </button>

            {saveSuccess && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center rounded-lg text-[10px] font-mono flex items-center justify-center gap-1 animate-pulse">
                <Check size={11} /> ¡Perfil guardado en Supabase Auth!
              </div>
            )}
          </form>

          {/* Email systems details */}
          <div className="space-y-3 pt-3.5 border-t border-slate-900 text-xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Alertas Operativas</span>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-400 font-sans">Notificaciones por correo:</span>
              <input 
                type="checkbox" 
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="bg-slate-900 border border-slate-800 text-[#CCFF00] rounded focus:ring-0 focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-400 font-sans">Alertas Críticas por SMS:</span>
              <input 
                type="checkbox" 
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="bg-slate-900 border border-slate-800 text-[#CCFF00] rounded focus:ring-0 focus:ring-offset-0"
              />
            </label>
          </div>
        </div>

        {/* MFA setup simulation panel */}
        <div className="bg-slate-950 border border-slate-855 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-405 border-b border-slate-900 pb-2 flex items-center gap-1.5 select-none">
             <ShieldCheck size={14} className="text-[#CCFF00]" /> Configuración de Doble Factor (MFA)
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
             La autenticación OTP de doble factor añade un blindaje criptográfico sha256 a la inscripción de deportistas y asignación de árbitros para evitar accesos indebidos de suplantación de identidad.
          </p>

          {/* Interactive Toggle */}
          <div className="bg-slate-900 p-3.5 border border-slate-850/70 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-200">OTP / Autenticador Digital</p>
              <span className={`text-[9.5px] font-mono block mt-0.5 ${mfaEnabled ? "text-emerald-400" : "text-amber-500"}`}>
                {mfaEnabled ? "ACTIVADO PROTECCIÓN DE CARGO" : "DESHABILITADO"}
              </span>
            </div>
            <button
              onClick={handleToggleMfa}
              className={`px-3 py-1 bg-slate-950 border text-xs font-bold transition rounded-lg ${
                mfaEnabled ? "text-red-400 border-red-500/10 hover:bg-slate-900" : "text-[#CCFF00] border-[#CCFF00]/15 hover:bg-slate-900"
              }`}
            >
              {mfaEnabled ? "Desactivar" : "Configurar"}
            </button>
          </div>

          {/* MFA Setup input simulator dropdown */}
          {mfaSetupActive && (
            <form onSubmit={verifyMfaCode} className="bg-slate-900/40 p-4 border border-dashed border-slate-800 rounded-xl text-xs space-y-3">
              <div>
                <p className="font-bold text-slate-300">Autenticador OTP (Simulador)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Escanee el código o digite el OTP demostrativo: <strong className="text-amber-400 font-mono">123456</strong></p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="CODE (6 dígitos)" 
                  value={mfaVerificationCode}
                  onChange={(e) => setMfaVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="bg-slate-950 border border-slate-800 p-2 text-white rounded font-mono text-center w-full focus:outline-none"
                  required
                />
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-[#CCFF00] text-slate-950 font-black rounded text-[11px] hover:bg-[#b0dc05]"
                >
                  Confirmar
                </button>
              </div>
            </form>
          )}

          {mfaSuccess && mfaEnabled && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center rounded-xl text-[10.5px] font-mono">
              ✓ Token biométrico asignado con éxito a su clave API.
            </div>
          )}

        </div>

        {/* Manage Active sessions and logs revoke actions */}
        <div className="bg-slate-950 border border-slate-855 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-405 border-b border-slate-900 pb-2.5 flex items-center gap-1.5 select-none font-sans">
             <Key size={14} className="text-[#CCFF00]" /> Terminales y Sesiones Registradas
          </h3>
          <p className="text-[10px] text-slate-500 font-mono">Últimas conexiones autorizadas a esta firma digital de LigaPro:</p>

          <div className="space-y-3 text-xs">
            {sessions.map((sess) => (
              <div key={sess.id} className="p-3 bg-slate-900 rounded-xl border border-slate-850 flex items-center justify-between text-left">
                <div className="space-y-1">
                  <p className="font-bold text-slate-200 truncate max-w-[170px]">{sess.browser}</p>
                  <span className="text-[9.5px] font-mono text-slate-500 block uppercase">IP: {sess.ip} • Sede: {sess.city}</span>
                </div>
                
                {sess.isCurrent ? (
                  <span className="text-[9px] font-mono bg-[#CCFF00]/10 text-[#CCFF00] px-2 py-0.5 border border-[#CCFF00]/10 rounded select-none uppercase font-bold">
                     Actual
                  </span>
                ) : (
                  <button
                    onClick={() => handleRevokeSession(sess.id, sess.city)}
                    className="p-1 hover:text-red-400 text-slate-600 transition"
                    title="Cerrar acceso terminal"
                  >
                    <Power size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
