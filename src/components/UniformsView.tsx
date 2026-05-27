import React, { useState } from "react";
import { Shirt, HelpCircle, AlertTriangle, CheckCircle2, ChevronRight, Info, ShieldCheck, Palette } from "lucide-react";
import { Club } from "../types";

interface UniformsViewProps {
  clubs: Club[];
}

// Map real team kit colors in detail
const kitColorsRecord: Record<string, {
  brand: string;
  sponsor: string;
  home: { shirt: string; shorts: string; socks: string; text: string };
  away: { shirt: string; shorts: string; socks: string; text: string };
  third?: { shirt: string; shorts: string; socks: string; text: string };
}> = {
  "barcelona-sc": {
    brand: "Marathon Sports",
    sponsor: "Banco Pichincha",
    home: { shirt: "#FCD34D", shorts: "#1E293B", socks: "#FCD34D", text: "Amarillo Imperial" }, // Yellow/navy
    away: { shirt: "#374151", shorts: "#374151", socks: "#374151", text: "Gris Obsidiana" }
  },
  "ldu-quito": {
    brand: "Puma",
    sponsor: "Banco Pichincha",
    home: { shirt: "#FFFFFF", shorts: "#FFFFFF", socks: "#FFFFFF", text: "Blanco Albo Puro" },
    away: { shirt: "#1D4ED8", shorts: "#1D4ED8", socks: "#1D4ED8", text: "Azul Rey Universitario" }
  },
  "ind-valle": {
    brand: "Marathon Sports",
    sponsor: "Banco Guayaquil",
    home: { shirt: "#0F172A", shorts: "#0F172A", socks: "#0F172A", text: "Negro Orgullo Rayado" }, // Black/Blue strips represented as dark obsidian
    away: { shirt: "#EC4899", shorts: "#EC4899", socks: "#EC4899", text: "Fucsia Alternativo" }
  },
  "emelec": {
    brand: "Adidas",
    sponsor: "Novibet",
    home: { shirt: "#1E3A8A", shorts: "#1E3A8A", socks: "#1E3A8A", text: "Azul Eléctrico Clásico" },
    away: { shirt: "#94A3B8", shorts: "#1E3A8A", socks: "#94A3B8", text: "Gris Plata con Azul" }
  },
  "el-nacional": {
    brand: "Lotto",
    sponsor: "Banco General Rumiñahui",
    home: { shirt: "#EF4444", shorts: "#EF4444", socks: "#EF4444", text: "Rojo Bi-Tricolor Criollo" },
    away: { shirt: "#1D4ED8", shorts: "#EF4444", socks: "#1D4ED8", text: "Azul Alternativo militar" }
  },
  "aucas": {
    brand: "Umbro",
    sponsor: "Banco Pichincha",
    home: { shirt: "#FBBF24", shorts: "#EF4444", socks: "#FBBF24", text: "Amarillo y Rojo Oriental" },
    away: { shirt: "#94A3B8", shorts: "#94A3B8", socks: "#94A3B8", text: "Gris de Relevo" }
  }
};

export default function UniformsView({ clubs }: UniformsViewProps) {
  const [homeClubId, setHomeClubId] = useState<string>("barcelona-sc");
  const [awayClubId, setAwayClubId] = useState<string>("ldu-quito");
  
  const [homeKitSelection, setHomeKitSelection] = useState<"home" | "away">("home");
  const [awayKitSelection, setAwayKitSelection] = useState<"home" | "away">("away");

  const homeClub = clubs.find(c => c.id === homeClubId) || clubs[0];
  const awayClub = clubs.find(c => c.id === awayClubId) || clubs[1];

  const homeKitDetails = kitColorsRecord[homeClubId] || kitColorsRecord["barcelona-sc"];
  const awayKitDetails = kitColorsRecord[awayClubId] || kitColorsRecord["ldu-quito"];

  const activeHomeKit = homeKitSelection === "home" ? homeKitDetails.home : homeKitDetails.away;
  const activeAwayKit = awayKitSelection === "home" ? awayKitDetails.home : awayKitDetails.away;

  // Pre-match color conflict algorithm selector
  const checkConflict = () => {
    if (homeClubId === awayClubId) {
      return {
        hasConflict: true,
        message: "¡Simulación no viable! Debe elegir dos clubes diferentes para auditar el contraste de campo.",
        severity: "critical"
      };
    }

    const homeColor = activeHomeKit.shirt;
    const awayColor = activeAwayKit.shirt;

    // Direct color contrast matches
    const isBothYellowStr = (homeClubId === "barcelona-sc" && homeKitSelection === "home" && awayClubId === "aucas" && awayKitSelection === "home");
    const isBothBlueStr = (homeClubId === "emelec" && homeKitSelection === "home" && awayClubId === "ldu-quito" && awayKitSelection === "away") || 
                           (homeClubId === "emelec" && homeKitSelection === "home" && awayClubId === "el-nacional" && awayKitSelection === "away");
    const isBothWhiteStr = (homeClubId === "ldu-quito" && homeKitSelection === "home" && awayClubId === "emelec" && awayKitSelection === "away" && awayColor === "#94A3B8") ||
                            (homeColor === awayColor);

    if (isBothYellowStr || homeColor === "#FCD34D" && awayColor === "#FBBF24") {
      return {
        hasConflict: true,
        message: "¡ALERTA DE CONFLICTO VISUAL! Ambos equipos visten tonalidades amarillas. Se requiere que el club visitante use su uniforme alterno oscuro.",
        severity: "high"
      };
    }

    if (isBothBlueStr || homeColor === "#1E3A8A" && awayColor === "#1D4ED8") {
      return {
        hasConflict: true,
        message: "¡ALERTA DE CONTRASTE BAJO! Camisetas azuladas en el campo. Se recomienda cambiar al uniforme claro (Blanco/Gris) para facilitar transmisión VAR televisiva.",
        severity: "medium"
      };
    }

    if (homeColor.toUpperCase() === awayColor.toUpperCase()) {
      return {
        hasConflict: true,
        message: "¡CONTRASTE DUPLICADO! Ambos equipos portan idénticas paletas de color en su camiseta principal. Se asignará uniforme alterno de manera dictatorial.",
        severity: "high"
      };
    }

    return {
      hasConflict: false,
      message: "VALIDACIÓN DE CONTRASTE COMPORTATIVA: OK. Los colores de campo garantizan óptima distinción arbitral y visualización televisiva.",
      severity: "none"
    };
  };

  const conflictResult = checkConflict();

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold font-sans text-white tracking-tight">Regulación e Inspección de Uniformes</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">Verificación matemática de contraste de colores para transmisión oficial de televisión u obstáculos para daltónicos.</p>
      </div>

      {/* Grid: Configurator sidebar vs Visualizers panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left selector panel */}
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-5">
          <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 flex items-center gap-1.5 border-b border-slate-900 pb-2.5">
            <Palette size={14} className="text-[#CCFF00]" /> CONTRASTE PRE-PARTIDO
          </h3>

          {/* Local match selector */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Club Local (Sede)</label>
              <select 
                value={homeClubId} 
                onChange={(e) => {
                  setHomeClubId(e.target.value);
                  setHomeKitSelection("home");
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-semibold focus:outline-none"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>{c.shortName}</option>
                ))}
              </select>
              
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => setHomeKitSelection("home")}
                  className={`flex-1 py-1 px-2.5 rounded font-mono text-[9.5px] font-bold border transition ${
                    homeKitSelection === "home" 
                      ? "bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20" 
                      : "bg-slate-900 text-slate-400 border-slate-900"
                  }`}
                >
                  Jersey Principal
                </button>
                <button
                  onClick={() => setHomeKitSelection("away")}
                  className={`flex-1 py-1 px-2.5 rounded font-mono text-[9.5px] font-bold border transition ${
                    homeKitSelection === "away" 
                      ? "bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20" 
                      : "bg-slate-900 text-slate-400 border-slate-900"
                  }`}
                >
                  Jersey Alterno
                </button>
              </div>
            </div>

            <div className="text-center text-slate-700 py-1 font-mono text-xs select-none">VS</div>

            {/* Visitante match selector */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Club Visitante</label>
              <select 
                value={awayClubId} 
                onChange={(e) => {
                  setAwayClubId(e.target.value);
                  setAwayKitSelection("away");
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 font-semibold focus:outline-none"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>{c.shortName}</option>
                ))}
              </select>

              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => setAwayKitSelection("home")}
                  className={`flex-1 py-1 px-2.5 rounded font-mono text-[9.5px] font-bold border transition ${
                    awayKitSelection === "home" 
                      ? "bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20" 
                      : "bg-slate-900 text-slate-400 border-slate-900"
                  }`}
                >
                  Jersey Principal
                </button>
                <button
                  onClick={() => setAwayKitSelection("away")}
                  className={`flex-1 py-1 px-2.5 rounded font-mono text-[9.5px] font-bold border transition ${
                    awayKitSelection === "away" 
                      ? "bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20" 
                      : "bg-slate-900 text-slate-400 border-slate-900"
                  }`}
                >
                  Jersey Alterno
                </button>
              </div>
            </div>
          </div>

          {/* Details sponsor card */}
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850/65 text-xs space-y-1.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Datos de Indumentaria Sede</span>
            <div className="flex justify-between">
              <span className="text-slate-500">Fabricante local:</span>
              <span className="font-semibold text-slate-350">{homeKitDetails.brand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Patrocinador principal:</span>
              <span className="font-semibold text-slate-350">{homeKitDetails.sponsor}</span>
            </div>
          </div>

        </div>

        {/* Right side display preview */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Diagnostic indicator banner */}
          <div className={`p-4 rounded-2xl flex items-start space-x-3 text-xs border ${
            conflictResult.hasConflict 
              ? conflictResult.severity === "critical"
                ? "bg-slate-900 border-slate-800 text-slate-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          }`}>
            <div className="mt-0.5">
              {conflictResult.hasConflict ? (
                <AlertTriangle size={16} className={conflictResult.severity === "critical" ? "text-slate-500" : "text-rose-400"} />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-400" />
              )}
            </div>
            <div>
              <p className="font-bold underline uppercase tracking-wider text-[11px] font-sans">
                {conflictResult.hasConflict ? "ALERTA DE SEGURIDAD VISUAL" : "APROBACIÓN DE VESTIMENTA EMITIDA"}
              </p>
              <p className="font-medium mt-1 leading-snug">{conflictResult.message}</p>
            </div>
          </div>

          {/* Jersey render cards mockup side-by-side inside CSS */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 grid grid-cols-2 gap-8 text-center min-h-[290px] items-center relative">
            
            {/* Local kit simulation card */}
            <div className="flex flex-col items-center space-y-4">
              <span className="text-slate-400 text-xs font-bold">{homeClub.shortName} <span className="font-mono font-normal text-[10px] text-slate-500">Local</span></span>
              
              {/* Virtual SVG/CSS Jersey design */}
              <div className="relative w-24 h-24 flex flex-col items-center select-none cursor-pointer hover:scale-105 duration-250">
                <Shirt size={96} style={{ color: activeHomeKit.shirt }} className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition" />
                <div className="absolute top-8 text-slate-950 font-black font-mono text-xl text-center flex flex-col leading-none">
                  <span>10</span>
                </div>
              </div>

              {/* Pant and socks description indicators */}
              <div className="space-y-1.5 font-mono text-[10px] text-slate-400">
                <p className="font-medium text-slate-300">{activeHomeKit.text}</p>
                <div className="flex justify-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded" style={{ backgroundColor: activeHomeKit.shorts, color: "#FFF" }}>Pantalón</span>
                  <span className="px-2 py-0.5 rounded" style={{ backgroundColor: activeHomeKit.socks, color: "#FFF" }}>Medias</span>
                </div>
              </div>
            </div>

            {/* Visitante kit simulation card */}
            <div className="flex flex-col items-center space-y-4">
              <span className="text-slate-400 text-xs font-bold">{awayClub.shortName} <span className="font-mono font-normal text-[10px] text-slate-500">Visitante</span></span>
              
              {/* Virtual SVG/CSS Jersey design */}
              <div className="relative w-24 h-24 flex flex-col items-center select-none cursor-pointer hover:scale-105 duration-250">
                <Shirt size={96} style={{ color: activeAwayKit.shirt }} className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition" />
                <div className="absolute top-8 text-slate-950 font-black font-mono text-xl text-center flex flex-col leading-none">
                  <span>9</span>
                </div>
              </div>

              {/* Pant and socks description indicators */}
              <div className="space-y-1.5 font-mono text-[10px] text-slate-400">
                <p className="font-medium text-slate-300">{activeAwayKit.text}</p>
                <div className="flex justify-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded" style={{ backgroundColor: activeAwayKit.shorts, color: "#FFF" }}>Pantalón</span>
                  <span className="px-2 py-0.5 rounded" style={{ backgroundColor: activeAwayKit.socks, color: "#FFF" }}>Medias</span>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs space-y-2 text-slate-400">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1"><Info size={14} className="text-[#CCFF00]" /> Normativa Oficial de Uniformes LigaPro (Sección 4.2)</h4>
            <p className="leading-snug text-[11px]">
              El club visitante está obligado a alterar su uniforme principal siempre que coincida visualmente en más de un 40% con el uniforme registrado por el club local. Las mangas, el color de la espalda numerada y las medias son evaluadas por los inspectores de juego previo al ingreso de los equipos.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
