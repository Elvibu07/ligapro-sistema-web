import React, { useState } from "react";
import { Award, Shield, Trophy, TrendingUp, Sparkles, Star, AlertTriangle } from "lucide-react";
import { Club } from "../types";

interface PositionsViewProps {
  clubs: Club[];
}

interface Standing {
  pos: number;
  clubId: string;
  name: string;
  logo: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  gd: number;
  ptos: number;
  zone: "Libertadores" | "Libertadores Fase Prev." | "Sudamericana" | "Ninguna" | "Descenso";
}

export default function PositionsView({ clubs }: PositionsViewProps) {
  const [currentPhase, setCurrentPhase] = useState<'fase1' | 'fase2' | 'acumulada'>('fase1');

  // 1. Standings Data for Phase 1
  const standingsFase1: Standing[] = [
    { pos: 1, clubId: "ldu-quito", name: "Liga Deportiva Universitaria", logo: "LDU", pj: 12, g: 9, e: 2, p: 1, gf: 24, gc: 9, gd: 15, ptos: 29, zone: "Libertadores" },
    { pos: 2, clubId: "ind-valle", name: "Independiente del Valle", logo: "IDV", pj: 12, g: 8, e: 3, p: 1, gf: 21, gc: 10, gd: 11, ptos: 27, zone: "Libertadores" },
    { pos: 3, clubId: "barcelona-sc", name: "Barcelona Sporting Club", logo: "BSC", pj: 12, g: 7, e: 3, p: 2, gf: 19, gc: 11, gd: 8, ptos: 24, zone: "Libertadores Fase Prev." },
    { pos: 4, clubId: "aucas", name: "Sociedad Deportiva Aucas", logo: "SDA", pj: 12, g: 5, e: 4, p: 3, gf: 17, gc: 14, gd: 3, ptos: 19, zone: "Sudamericana" },
    { pos: 5, clubId: "emelec", name: "Club Sport Emelec", logo: "CSE", pj: 12, g: 4, e: 4, p: 4, gf: 14, gc: 13, gd: 1, ptos: 16, zone: "Sudamericana" },
    { pos: 6, clubId: "el-nacional", name: "Club Deportivo El Nacional", logo: "ELN", pj: 12, g: 3, e: 2, p: 7, gf: 11, gc: 20, gd: -9, ptos: 11, zone: "Ninguna" }
  ];

  // 2. Standings Data for Phase 2
  const standingsFase2: Standing[] = [
    { pos: 1, clubId: "ind-valle", name: "Independiente del Valle", logo: "IDV", pj: 5, g: 4, e: 1, p: 0, gf: 10, gc: 3, gd: 7, ptos: 13, zone: "Libertadores" },
    { pos: 2, clubId: "ldu-quito", name: "Liga Deportiva Universitaria", logo: "LDU", pj: 5, g: 3, e: 2, p: 0, gf: 9, gc: 4, gd: 5, ptos: 11, zone: "Libertadores" },
    { pos: 3, clubId: "barcelona-sc", name: "Barcelona Sporting Club", logo: "BSC", pj: 5, g: 3, e: 1, p: 1, gf: 8, gc: 5, gd: 3, ptos: 10, zone: "Libertadores Fase Prev." },
    { pos: 4, clubId: "emelec", name: "Club Sport Emelec", logo: "CSE", pj: 5, g: 2, e: 2, p: 1, gf: 6, gc: 5, gd: 1, ptos: 8, zone: "Sudamericana" },
    { pos: 5, clubId: "el-nacional", name: "Club Deportivo El Nacional", logo: "ELN", pj: 5, g: 1, e: 1, p: 3, gf: 4, gc: 8, gd: -4, ptos: 4, zone: "Sudamericana" },
    { pos: 6, clubId: "aucas", name: "Sociedad Deportiva Aucas", logo: "SDA", pj: 5, g: 1, e: 0, p: 4, gf: 5, gc: 11, gd: -6, ptos: 3, zone: "Ninguna" }
  ];

  // 3. Standings Data for Accumulated Table (combining Phase 1 and Phase 2)
  const standingsAcumulada: Standing[] = [
    { pos: 1, clubId: "ldu-quito", name: "Liga Deportiva Universitaria", logo: "LDU", pj: 17, g: 12, e: 4, p: 1, gf: 33, gc: 13, gd: 20, ptos: 40, zone: "Libertadores" },
    { pos: 2, clubId: "ind-valle", name: "Independiente del Valle", logo: "IDV", pj: 17, g: 12, e: 4, p: 1, gf: 31, gc: 13, gd: 18, ptos: 40, zone: "Libertadores" },
    { pos: 3, clubId: "barcelona-sc", name: "Barcelona Sporting Club", logo: "BSC", pj: 17, g: 10, e: 4, p: 3, gf: 27, gc: 16, gd: 11, ptos: 34, zone: "Libertadores Fase Prev." },
    { pos: 4, clubId: "emelec", name: "Club Sport Emelec", logo: "CSE", pj: 17, g: 6, e: 6, p: 5, gf: 20, gc: 18, gd: 2, ptos: 24, zone: "Sudamericana" },
    { pos: 5, clubId: "aucas", name: "Sociedad Deportiva Aucas", logo: "SDA", pj: 17, g: 6, e: 4, p: 7, gf: 22, gc: 25, gd: -3, ptos: 22, zone: "Sudamericana" },
    { pos: 6, clubId: "el-nacional", name: "Club Deportivo El Nacional", logo: "ELN", pj: 17, g: 4, e: 3, p: 10, gf: 15, gc: 28, gd: -13, ptos: 15, zone: "Descenso" }
  ];

  // Pick active base standings
  const activeBase = currentPhase === 'fase1' ? standingsFase1 : currentPhase === 'fase2' ? standingsFase2 : standingsAcumulada;

  // Dynamically merge any newly registered clubs not in seed
  const existingIds = activeBase.map(s => s.clubId);
  const extraStandings: Standing[] = clubs
    .filter(c => !existingIds.includes(c.id))
    .map((c, idx) => ({
      pos: activeBase.length + idx + 1,
      clubId: c.id,
      name: c.name,
      logo: c.logo || c.name.substring(0, 3).toUpperCase(),
      pj: 0,
      g: 0,
      e: 0,
      p: 0,
      gf: 0,
      gc: 0,
      gd: 0,
      ptos: 0,
      zone: "Ninguna"
    }));

  const allStandings = [...activeBase, ...extraStandings].sort((a, b) => b.ptos - a.ptos || b.gd - a.gd);

  // Recalculate POS and Zones reasonably
  allStandings.forEach((s, idx) => {
    s.pos = idx + 1;
    // Set classification zones based on final position
    if (idx < 2) s.zone = "Libertadores";
    else if (idx === 2) s.zone = "Libertadores Fase Prev.";
    else if (idx < 5) s.zone = "Sudamericana";
    else if (idx === allStandings.length - 1 && currentPhase === 'acumulada') s.zone = "Descenso"; // Bottom club in accumulated table desciende
    else s.zone = "Ninguna";
  });

  // Dynamic Highlight Widgets data based on active phase
  const getHighlightData = () => {
    switch (currentPhase) {
      case "fase2":
        return {
          puntero: "IDV (13 Pts)",
          goles: "IDV (+10 Goles)",
          defensa: "IDV (3 Recibidos)"
        };
      case "acumulada":
        return {
          puntero: "L.D.U. Quito (40 Pts)",
          goles: "L.D.U. Quito (+33 Goles)",
          defensa: "LDU & IDV (13 Recibidos)"
        };
      case "fase1":
      default:
        return {
          puntero: "L.D.U. Quito (29 Pts)",
          goles: "L.D.U. Quito (+24 Goles)",
          defensa: "L.D.U. & IDV (9 Recibidos)"
        };
    }
  };

  const highlights = getHighlightData();

  return (
    <div className="space-y-6 text-left" id="positions-view-container">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="text-[#CCFF00]" size={20} /> Tabla de Posiciones — LigaPro Ecuador 2026
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Estadísticas oficiales consolidadas y cálculo en tiempo real de clasificación para torneos CONMEBOL y descensos directos.
          </p>
        </div>

        {/* Phase Select pills */}
        <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-850 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setCurrentPhase('fase1')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider font-extrabold uppercase transition-all ${
              currentPhase === 'fase1'
                ? 'bg-[#CCFF00] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fase Uno
          </button>
          <button
            type="button"
            onClick={() => setCurrentPhase('fase2')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider font-extrabold uppercase transition-all ${
              currentPhase === 'fase2'
                ? 'bg-[#CCFF00] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fase Dos
          </button>
          <button
            type="button"
            onClick={() => setCurrentPhase('acumulada')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider font-extrabold uppercase transition-all ${
              currentPhase === 'acumulada'
                ? 'bg-[#CCFF00] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Acumulada
          </button>
        </div>
      </div>

      {/* Highlights Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center space-x-3 transition-all hover:border-[#CCFF00]/20">
          <div className="p-2.5 bg-yellow-500/10 rounded-lg text-yellow-400">
            <Award size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Puntero Absoluto</span>
            <p className="text-xs font-black text-slate-200 mt-0.5">{highlights.puntero}</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center space-x-3 transition-all hover:border-[#CCFF00]/20">
          <div className="p-2.5 bg-[#CCFF00]/10 rounded-lg text-[#CCFF00]">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Mejor Delantera</span>
            <p className="text-xs font-black text-slate-200 mt-0.5">{highlights.goles}</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center space-x-3 transition-all hover:border-[#CCFF00]/20">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Shield size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Mejor Defensa</span>
            <p className="text-xs font-black text-slate-200 mt-0.5">{highlights.defensa}</p>
          </div>
        </div>
      </div>

      {/* Main Stats Table */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-slate-900">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#CCFF00]" /> 
            {currentPhase === 'fase1' && 'Primera Etapa — Serie A 2026'}
            {currentPhase === 'fase2' && 'Segunda Etapa — Serie A 2026'}
            {currentPhase === 'acumulada' && 'Tabla Acumulada — Campeonato Oficial 2026'}
          </span>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-mono uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Libertadores</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Prev. Libertadores</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Sudamericana</span>
            {currentPhase === 'acumulada' && (
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Descenso Serie B</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-mono text-[9px] uppercase">
                <th className="py-3 px-3 text-center w-12">POS</th>
                <th className="py-3 px-3 text-left">CLUB</th>
                <th className="py-3 px-3 text-center">PJ</th>
                <th className="py-3 px-3 text-center">G</th>
                <th className="py-3 px-3 text-center">E</th>
                <th className="py-3 px-3 text-center">P</th>
                <th className="py-3 px-3 text-center">GF</th>
                <th className="py-3 px-3 text-center">GC</th>
                <th className="py-3 px-3 text-center">GD</th>
                <th className="py-3 px-3 text-center bg-slate-900/50">PTS</th>
                <th className="py-3 px-3 text-right">ESTADO / CLASIFICACIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-semibold text-slate-300">
              {allStandings.map((s) => {
                let badgeColor = "text-slate-500 bg-slate-900/10";
                let posLineColor = "border-l-4 border-transparent";
                
                if (s.zone === "Libertadores") {
                  badgeColor = "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
                  posLineColor = "border-l-4 border-emerald-500";
                } else if (s.zone === "Libertadores Fase Prev.") {
                  badgeColor = "text-teal-400 bg-teal-400/10 border border-teal-400/20";
                  posLineColor = "border-l-4 border-teal-400";
                } else if (s.zone === "Sudamericana") {
                  badgeColor = "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20";
                  posLineColor = "border-l-4 border-cyan-500";
                } else if (s.zone === "Descenso") {
                  badgeColor = "text-red-400 bg-red-500/10 border border-red-500/20";
                  posLineColor = "border-l-4 border-red-500";
                }

                return (
                  <tr key={s.clubId} className="hover:bg-slate-900/30 transition">
                    <td className={`py-4 px-3 text-center font-mono ${posLineColor} text-slate-200 font-bold`}>
                      {s.pos}
                    </td>
                    <td className="py-4 px-3 text-left">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-200 font-extrabold flex items-center justify-center shrink-0">
                          {s.logo}
                        </span>
                        <span className="text-slate-100 font-extrabold truncate">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center font-mono text-slate-400">{s.pj}</td>
                    <td className="py-4 px-3 text-center font-mono text-slate-400">{s.g}</td>
                    <td className="py-4 px-3 text-center font-mono text-slate-400">{s.e}</td>
                    <td className="py-4 px-3 text-center font-mono text-slate-400">{s.p}</td>
                    <td className="py-4 px-3 text-center font-mono text-slate-400">{s.gf}</td>
                    <td className="py-4 px-3 text-center font-mono text-slate-400">{s.gc}</td>
                    <td className="py-4 px-3 text-center font-mono font-bold text-slate-200">
                      {s.gd > 0 ? `+${s.gd}` : s.gd}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-black text-[#CCFF00] bg-slate-900/30 text-xs">
                      {s.ptos}
                    </td>
                    <td className="py-4 px-3 text-right">
                      {s.zone === "Libertadores" && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-mono leading-none tracking-tight font-extrabold uppercase ${badgeColor}`}>
                          <Star size={7.5} className="fill-current shrink-0" /> CONMEBOL Libertadores
                        </span>
                      )}
                      {s.zone === "Libertadores Fase Prev." && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-mono leading-none tracking-tight font-extrabold uppercase ${badgeColor}`}>
                          <Star size={7.5} className="fill-current shrink-0" /> Prev. Libertadores
                        </span>
                      )}
                      {s.zone === "Sudamericana" && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-mono leading-none tracking-tight font-extrabold uppercase ${badgeColor}`}>
                          <Star size={7.5} className="fill-current shrink-0" /> Copa Sudamericana
                        </span>
                      )}
                      {s.zone === "Descenso" && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-mono leading-none tracking-tight font-extrabold uppercase ${badgeColor}`}>
                          <AlertTriangle size={7.5} className="shrink-0" /> Descenso Serie B
                        </span>
                      )}
                      {s.zone === "Ninguna" && (
                        <span className="text-[10px] font-mono text-slate-600">Fase Regular</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
