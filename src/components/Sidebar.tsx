import React from "react";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  Gavel, 
  CalendarDays, 
  Shirt, 
  User, 
  Tv2, 
  MapPin, 
  LockKeyhole,
  ChevronRight,
  Menu,
  Trophy,
  Clock,
  FileSpreadsheet,
  Heart
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  rolesAllowed: string[];
  badge?: string;
  category: "Campeonato" | "Deportivo" | "Técnico" | "Administrativo" | "Seguridad";
}

const menuItems: MenuItem[] = [
  // Administrativo Group
  {
    id: "dashboard",
    label: "Panel de Control",
    icon: LayoutDashboard,
    rolesAllowed: ["Administrador General", "Registrador de Clubes", "Auditor Disciplinario", "Coordinador VAR", "Comisión Arbitral"],
    category: "Administrativo"
  },
  {
    id: "clubes",
    label: "Habilitación de Clubes",
    icon: ShieldCheck,
    rolesAllowed: ["Administrador General", "Registrador de Clubes"],
    badge: "Auditoría",
    category: "Administrativo"
  },
  // Campeonato Group
  {
    id: "posiciones",
    label: "Tabla de Posiciones",
    icon: Trophy,
    rolesAllowed: ["Administrador General", "Registrador de Clubes", "Auditor Disciplinario", "Coordinador VAR", "Comisión Arbitral"],
    category: "Campeonato"
  },
  {
    id: "fixture",
    label: "Fixture y Calendario",
    icon: CalendarDays,
    rolesAllowed: ["Administrador General", "Registrador de Clubes", "Auditor Disciplinario", "Coordinador VAR", "Comisión Arbitral"],
    category: "Campeonato"
  },
  {
    id: "programacion",
    label: "Programación Partidos",
    icon: MapPin,
    rolesAllowed: ["Administrador General", "Registrador de Clubes"],
    category: "Campeonato"
  },
  {
    id: "postergaciones",
    label: "Postergaciones de Partidos",
    icon: Clock,
    rolesAllowed: ["Administrador General", "Registrador de Clubes", "Auditor Disciplinario"],
    badge: "F.Mayor",
    category: "Campeonato"
  },
  // Deportivo Group
  {
    id: "plantel",
    label: "Fichas y Plantel",
    icon: Users,
    rolesAllowed: ["Administrador General", "Registrador de Clubes"],
    category: "Deportivo"
  },
  {
    id: "planillas",
    label: "Planillas de Juego",
    icon: FileSpreadsheet,
    rolesAllowed: ["Administrador General", "Registrador de Clubes"],
    badge: "Comet",
    category: "Deportivo"
  },
  {
    id: "disciplina",
    label: "Disciplina y Sanciones",
    icon: Gavel,
    rolesAllowed: ["Administrador General", "Auditor Disciplinario"],
    badge: "Apelación",
    category: "Deportivo"
  },
  {
    id: "uniformes",
    label: "Gestión de Uniformes",
    icon: Shirt,
    rolesAllowed: ["Administrador General", "Registrador de Clubes"],
    category: "Deportivo"
  },
  // Tecnico/Arbitral Group
  {
    id: "arbitros",
    label: "Designación Arbitral",
    icon: User,
    rolesAllowed: ["Administrador General", "Comisión Arbitral"],
    badge: "Sorteo",
    category: "Técnico"
  },
  {
    id: "var-vor",
    label: "Certificación VAR & VOR",
    icon: Tv2,
    rolesAllowed: ["Administrador General", "Coordinador VAR"],
    category: "Técnico"
  },
  {
    id: "estadios",
    label: "Gestión de Estadios",
    icon: MapPin,
    rolesAllowed: ["Administrador General", "Coordinador VAR", "Registrador de Clubes"],
    category: "Técnico"
  },
  // Seguridad Group
  {
    id: "security",
    label: "Acceso y Configuración",
    icon: LockKeyhole,
    rolesAllowed: ["Administrador General", "Registrador de Clubes", "Auditor Disciplinario", "Coordinador VAR", "Comisión Arbitral"],
    category: "Seguridad"
  }
];

export default function Sidebar({ currentView, onNavigate, userRole }: SidebarProps) {
  
  const filteredItems = menuItems.filter(item => {
    // If Admin General, allow everything. Otherwise check matching role permission constraint.
    if (userRole === "Administrador General") return true;
    return item.rolesAllowed.includes(userRole);
  });

  const categories = ["Administrativo", "Campeonato", "Deportivo", "Técnico", "Seguridad"] as const;

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-850 h-[calc(100vh-4rem)] flex flex-col justify-between select-none shrink-0 overflow-y-auto">
      {/* Menu Area */}
      <div className="p-4 space-y-6">
        
        {/* Navigation title */}
        <div className="flex items-center space-x-2 text-slate-500 px-2">
          <Menu size={14} className="text-slate-400" />
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400">Menú de Navegación</span>
        </div>

        {/* Categories grouping */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const catItems = filteredItems.filter(item => item.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} className="space-y-1">
                <span className="text-[9px] font-mono font-extrabold uppercase text-slate-600 px-3 tracking-wider block">
                  {cat}
                </span>
                <div className="space-y-0.5">
                  {catItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                      <button
                        key={item.id}
                        id={`sidemenu-${item.id}`}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                          isActive 
                            ? "bg-slate-900 border-l-4 border-[#CCFF00] text-white" 
                            : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon size={16} className={`${isActive ? "text-[#CCFF00]" : "text-slate-400 group-hover:text-slate-200"}`} />
                          <span className="text-left leading-tight">{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm shrink-0 font-bold ${
                            isActive
                              ? "bg-[#CCFF00] text-slate-950"
                              : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                          }`}>
                            {item.badge}
                          </span>
                        ) : (
                          <ChevronRight size={10} className={`text-slate-600 transition-transform ${isActive ? "text-[#CCFF00] translate-x-0.5" : "group-hover:translate-x-0.5"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Zona Fan button */}
      <div className="px-4 pb-4">
        <button
          id="sidemenu-fans"
          onClick={() => onNavigate("fans")}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all border ${
            currentView === "fans"
              ? "bg-[#CCFF00] text-slate-950 border-[#CCFF00]/50 shadow-lg shadow-[#CCFF00]/20"
              : "bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20 hover:bg-[#CCFF00]/20"
          }`}
        >
          <Heart size={14} fill={currentView === "fans" ? "currentColor" : "none"} />
          <span>Zona Fan</span>
          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/80 text-white font-black">FAN</span>
        </button>
      </div>

      {/* Footer Info of the Logged Access */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/80">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850/65 text-left">
          <div className="text-[10px] text-slate-500 font-mono">USUARIO ACTIVO</div>
          <p className="text-xs font-semibold text-slate-200 leading-tight truncate">{userRole}</p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-mono text-slate-400 select-none uppercase">Sesión de Auditoría Encriptada</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
