import React, { useState, useEffect } from "react";
import { Bell, Shield, Radio, CheckCircle, X, LogOut, ChevronDown, Award, Sun, Moon } from "lucide-react";
import { SystemUser } from "../types";
import { supabase } from "../lib/supabase";
import { getNotifications, markNotificationRead, clearAllNotifications } from "../lib/services/notifications";
import logoImg from "../ligapro-logo.png";

interface HeaderProps {
  currentUser: SystemUser;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}

export default function Header({ currentUser, onNavigate, onLogout }: HeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Theme Toggling State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('ligapro-theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      localStorage.setItem('ligapro-theme', newTheme);
    } catch {}
    
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  // Sync theme to root element on mount / state change
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Persist notifications in localStorage so they survive page reloads
  const STORAGE_KEY = `ligapro-notifications-${currentUser.role.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  const defaultNotifications = [
    { id: 1, text: "Barcelona S.C. apeló sanción de Adonis Preciado", read: false, type: "disciplina", view: "disciplina" },
    { id: 2, text: "Cámara 5 del Estadio Monumental reporta error de calibración", read: false, type: "var", view: "var-vor" },
    { id: 3, text: "El Nacional cargó estatuto legal actualizado para auditoría", read: false, type: "club", view: "clubes" },
    { id: 4, text: "Sorteo Arbitral de la Jornada 12 completado exitosamente", read: true, type: "arbitraje", view: "arbitros" }
  ];

  const [notifications, setNotifications] = useState<any[]>([]);

  // Reload cache when role changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        // Only admins get the demo default notifications
        const initial = currentUser.role.includes("Fan") ? [] : defaultNotifications;
        setNotifications(initial);
      }
    } catch {
      setNotifications([]);
    }
  }, [STORAGE_KEY, currentUser.role]);

  // Load from Supabase on mount
  useEffect(() => {
    const loadDBNotifications = async () => {
      try {
        const dbList = await getNotifications();
        if (dbList.length > 0) {
          setNotifications(dbList);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dbList)); } catch {}
        }
      } catch (err) {
        console.warn("Could not load initial Supabase notifications, using local:", err);
      }
    };
    loadDBNotifications();
  }, []);

  // Supabase Real-Time Syncing Channel
  useEffect(() => {
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        async (payload) => {
          console.log('Real-time notifications change received:', payload);
          try {
            const dbList = await getNotifications();
            setNotifications(dbList);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dbList)); } catch {}
          } catch (err) {
            console.warn("Error refreshing real-time list:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Listen to local global notifications dispatched from events
  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string; type: string; view: string }>;
      if (!customEvent.detail || !customEvent.detail.text) return;
      const { text, type, view } = customEvent.detail;
      const newNotif = {
        id: `notif-local-${Date.now()}-${Math.random()}`,
        text,
        read: false,
        type: type || "general",
        view: view || "dashboard"
      };
      setNotifications((prev: any) => {
        const next = [newNotif, ...prev];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    };
    window.addEventListener('ligapro-notification', handleNewNotification);
    return () => window.removeEventListener('ligapro-notification', handleNewNotification);
  }, []);

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleMarkAsRead = async (id: string | number) => {
    // 1. Update locally
    const nextList = notifications.map((n: any) => n.id === id ? { ...n, read: true } : n);
    setNotifications(nextList);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList)); } catch {}

    // 2. Sync to Supabase
    try {
      await markNotificationRead(String(id));
    } catch (err) {
      console.warn("Supabase mark read failed:", err);
    }
  };

  const handleClearAll = async () => {
    // 1. Update locally
    setNotifications([]);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([])); } catch {}

    // 2. Sync to Supabase
    try {
      await clearAllNotifications();
    } catch (err) {
      console.warn("Supabase clear failed:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white h-16 flex items-center justify-between px-6 shadow-md transition-all">
      {/* Brand & Connection Tag */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <img src={logoImg} alt="LigaPro Logo" className="w-8 h-8 object-contain shrink-0" />
          <span className="text-slate-400 text-xs font-mono hidden md:inline">|</span>
          <span className="text-slate-200 text-xs font-mono font-semibold tracking-wider uppercase hidden md:inline">
            Ecuador Admin Portal
          </span>
        </div>

        {/* Server & Connectivity Badge */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-[10px] font-mono tracking-wide text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>SISTEMA CENTRAL: ONLINE</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Radio size={10} className="animate-pulse" /> VAR LINK: OK
          </span>
        </div>
      </div>

      {/* Control Area */}
      <div className="flex items-center space-x-4">
        
        {/* Quick Audit Info */}
        <div className="hidden sm:flex flex-col items-end text-right mr-2">
          <span className="text-xs font-mono text-slate-400">FASE 1 - JORNADA 12</span>
          <span className="text-[10px] font-sans text-[#CCFF00] uppercase font-bold flex items-center gap-1">
            <Award size={10} /> TORNEO OFICIAL 2026
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button 
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition focus:outline-none"
          aria-label="Toggle theme"
          title={theme === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button 
            id="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition relative focus:outline-none"
            aria-label="Notification feed"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-4 overflow-hidden z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-200">Alertas de Gestión</h3>
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleClearAll}
                      className="text-[10px] text-slate-400 hover:text-white underline"
                    >
                      Limpiar
                    </button>
                  )}
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 font-mono">
                    <CheckCircle className="mx-auto mb-2 text-slate-600" size={24} />
                    Sin alertas pendientes
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        handleMarkAsRead(n.id);
                        // Security Check: Block fans from navigating to admin modules
                        if (currentUser.role.includes("Fan") && n.view !== "fans" && n.view !== "dashboard") {
                          setShowNotifications(false);
                          return;
                        }
                        onNavigate(n.view);
                        setShowNotifications(false);
                      }}
                      className={`text-left p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        n.read 
                          ? "bg-slate-900/40 border-slate-900/60 text-slate-400" 
                          : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200 shadow-sm hover:translate-x-1"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-medium">{n.text}</span>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-[#CCFF00] shrink-0 mt-1"></span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 select-none uppercase block mt-1">
                        {n.type} • click para ir
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button 
            id="user-profile-btn"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-3 bg-slate-950 p-1.5 pr-3 rounded-xl border border-slate-800 hover:border-slate-700 transition"
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-7 h-7 rounded-lg object-cover border border-slate-700" 
              referrerPolicy="no-referrer"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-100">{currentUser.name}</div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{currentUser.role}</div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-64 bg-slate-950 border border-slate-850 rounded-xl shadow-2xl p-2 z-50">
              {/* User info card */}
              <div className="px-3 py-3 border-b border-slate-900 text-left">
                <div className="flex items-center space-x-2.5">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-9 h-9 rounded-lg object-cover border border-slate-700" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-100">{currentUser.name}</div>
                    <div className="text-[9px] font-mono text-[#CCFF00] uppercase tracking-wider font-bold">{currentUser.role}</div>
                    <div className="text-[9px] font-mono text-slate-500 mt-0.5">{currentUser.email}</div>
                  </div>
                </div>
              </div>

              <div className="p-1 space-y-0.5 mt-1">
                <button
                  onClick={() => { onNavigate("security"); setShowProfileDropdown(false); }}
                  className="w-full flex items-center space-x-2 p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg text-xs transition"
                >
                  <Shield size={14} />
                  <span>Configuración de Seguridad</span>
                </button>
                {onLogout && (
                  <button
                    onClick={() => { setShowProfileDropdown(false); onLogout(); }}
                    className="w-full flex items-center space-x-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-xs transition"
                  >
                    <LogOut size={14} />
                    <span>Cerrar Sesión</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
