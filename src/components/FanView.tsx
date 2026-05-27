import React, { useState } from "react";
import {
  Trophy,
  CalendarDays,
  Users,
  Star,
  TrendingUp,
  Flame,
  Heart,
  Eye,
  ChevronRight,
  MapPin,
  Clock,
  Tv,
  Shield,
  Zap,
  Award,
  Target,
  Target,
  Activity,
  X,
  Gamepad2
} from "lucide-react";
import type { Club, Player, Match, Stadium } from "../types";
import type { AuthUser } from "../lib/services/auth";
import PredictionGame from "./PredictionGame";

interface FanViewProps {
  clubs: Club[];
  players: Player[];
  matches: Match[];
  stadiums: Stadium[];
  user: AuthUser | null;
}

// Club colors map for visual identity
const CLUB_COLORS: Record<string, { primary: string; secondary: string; bg: string }> = {
  "barcelona-sc":  { primary: "#FFD700", secondary: "#cc0000", bg: "from-yellow-900/40 to-red-900/20" },
  "ldu-quito":     { primary: "#ffffff", secondary: "#003087", bg: "from-blue-900/40 to-slate-900/20" },
  "ind-valle":     { primary: "#e63946", secondary: "#1d3557", bg: "from-red-900/40 to-blue-900/20" },
  "emelec":        { primary: "#00aaff", secondary: "#003366", bg: "from-blue-900/40 to-cyan-900/20" },
  "el-nacional":   { primary: "#cc0000", secondary: "#003300", bg: "from-red-900/40 to-green-900/20" },
  "aucas":         { primary: "#ff6600", secondary: "#000000", bg: "from-orange-900/40 to-slate-900/20" },
};

const POSITION_COLORS: Record<string, string> = {
  Arquero: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  Defensa: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  Mediocampista: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  Delantero: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
};

// Compute standings from clubs + matches
function computeStandings(clubs: Club[], matches: Match[]) {
  const table: Record<string, { pts: number; pg: number; pe: number; pp: number; gf: number; gc: number }> = {};
  clubs.forEach((c) => {
    table[c.id] = { pts: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
  });
  matches.forEach((m) => {
    if (m.status === "Finalizado" && m.homeScore != null && m.awayScore != null) {
      const h = table[m.homeTeamId];
      const a = table[m.awayTeamId];
      if (!h || !a) return;
      h.gf += m.homeScore; h.gc += m.awayScore;
      a.gf += m.awayScore; a.gc += m.homeScore;
      if (m.homeScore > m.awayScore) { h.pts += 3; h.pg++; a.pp++; }
      else if (m.homeScore < m.awayScore) { a.pts += 3; a.pg++; h.pp++; }
      else { h.pts++; h.pe++; a.pts++; a.pe++; }
    }
  });
  return clubs
    .map((c) => ({ club: c, ...table[c.id] }))
    .sort((a, b) => b.pts - a.pts || b.gf - b.gc - (a.gf - a.gc));
}

function ClubBadge({ club, size = 48 }: { club: Club; size?: number }) {
  const color = CLUB_COLORS[club.id];
  return (
    <div
      className="rounded-full flex items-center justify-center font-black text-slate-900 shrink-0"
      style={{
        width: size,
        height: size,
        background: color ? `linear-gradient(135deg, ${color.primary}, ${color.secondary})` : "#CCFF00",
        fontSize: size * 0.28,
        boxShadow: color ? `0 0 16px ${color.primary}40` : undefined,
      }}
    >
      {club.logo}
    </div>
  );
}

// ── Player Detail Modal ───────────────────────────────────────────────────────
function PlayerModal({ player, club, onClose }: { player: Player; club: Club | undefined; onClose: () => void }) {
  const color = club ? CLUB_COLORS[club.id] : undefined;
  const age = Math.floor((Date.now() - new Date(player.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className={`h-32 bg-gradient-to-br ${color?.bg ?? "from-[#CCFF00]/20 to-slate-900"} relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/60 rounded-full p-1.5">
            <X size={16} />
          </button>
          <div className="absolute -bottom-10 left-6">
            <img
              src={player.image}
              alt={player.name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-900 shadow-xl"
            />
          </div>
          <div className="absolute top-4 left-6">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${POSITION_COLORS[player.position]}`}>
              {player.position.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="pt-12 px-6 pb-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-xl font-black text-white">{player.name}</h3>
              <p className="text-slate-400 text-sm">{club?.shortName ?? "—"} · #{player.shirtNumber}</p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
              player.status === "Habilitado" ? "bg-emerald-500/20 text-emerald-400" :
              player.status === "Suspendido" ? "bg-rose-500/20 text-rose-400" :
              "bg-amber-500/20 text-amber-400"
            }`}>
              {player.status}
            </span>
          </div>

          {/* Bio grid */}
          <div className="grid grid-cols-3 gap-3 mt-4 mb-5">
            {[
              { label: "Edad", value: `${age} años` },
              { label: "Altura", value: player.height },
              { label: "Peso", value: player.weight },
            ].map((item) => (
              <div key={item.label} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
                <p className="text-slate-400 text-[10px] font-mono uppercase">{item.label}</p>
                <p className="text-white font-bold text-sm mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Activity, label: "Partidos", value: player.matchesPlayed, color: "text-[#CCFF00]" },
              { icon: Target, label: "Goles", value: player.goals, color: "text-emerald-400" },
              { icon: Zap, label: "Amarillas", value: player.yellowCards, color: "text-amber-400" },
              { icon: Shield, label: "Rojas", value: player.redCards, color: "text-rose-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
                <stat.icon size={20} className={stat.color} />
                <div>
                  <p className="text-slate-400 text-[10px] font-mono uppercase">{stat.label}</p>
                  <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>🌍 {player.nationality}</span>
            <span>📋 Contrato hasta {player.contractUntil}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main FanView ──────────────────────────────────────────────────────────────
export default function FanView({ clubs, players, matches, stadiums, user }: FanViewProps) {
  const [activeTab, setActiveTab] = useState<"inicio" | "posiciones" | "fixture" | "jugadores" | "predicciones">("inicio");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [favoriteClub, setFavoriteClub] = useState<string | null>(null);

  const standings = computeStandings(clubs, matches);
  const upcoming = matches.filter((m) => m.status === "Programado").slice(0, 4);

  const displayedPlayers = selectedClubId
    ? players.filter((p) => p.clubId === selectedClubId)
    : players;

  const topScorer = [...players].sort((a, b) => b.goals - a.goals)[0];
  const topAssists = [...players].sort((a, b) => b.matchesPlayed - a.matchesPlayed)[0];

  const getClub = (id: string) => clubs.find((c) => c.id === id);
  const getStadium = (id: string) => stadiums.find((s) => s.id === id);

  const tabs = [
    { id: "inicio", label: "Inicio", icon: Flame },
    { id: "posiciones", label: "Tabla", icon: Trophy },
    { id: "fixture", label: "Partidos", icon: CalendarDays },
    { id: "jugadores", label: "Jugadores", icon: Users },
    { id: "predicciones", label: "Polla LigaPro", icon: Gamepad2 },
  ] as const;

  return (
    <div className="min-h-full">
      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(204,255,0,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.1),transparent_60%)]" />
        {/* Decorative dots */}
        <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
        <div className="absolute top-8 right-16 w-1 h-1 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "500ms" }} />

        <div className="relative px-8 py-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-full text-[#CCFF00] text-[10px] font-mono font-bold uppercase tracking-widest">
                🏆 Temporada 2026
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] font-mono font-bold">
                EN VIVO
              </span>
            </div>
            <h1 className="text-4xl font-black text-white leading-none">
              LIGA PRO<br />
              <span className="text-[#CCFF00]">ZONA FAN</span>
            </h1>
            <p className="text-slate-400 text-sm mt-3 max-w-xs">
              Sigue a tu equipo, consulta estadísticas y vive el fútbol ecuatoriano desde adentro.
            </p>
          </div>

          {/* Quick stats */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            {[
              { label: "Equipos", value: clubs.length, icon: Shield, color: "text-[#CCFF00]" },
              { label: "Jugadores", value: players.length, icon: Users, color: "text-blue-400" },
              { label: "Partidos", value: matches.length, icon: CalendarDays, color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900/60 border border-slate-700/50 rounded-xl px-5 py-4 text-center backdrop-blur-sm">
                <s.icon size={18} className={`${s.color} mx-auto mb-1`} />
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-[10px] font-mono uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-[#CCFF00] text-slate-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════ INICIO ════════════════════════════ */}
      {activeTab === "inicio" && (
        <div className="space-y-6">
          {/* Mi equipo favorito */}
          <div>
            <h2 className="text-xs font-mono uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2">
              <Heart size={12} className="text-rose-400" /> Elige tu equipo favorito
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {clubs.map((club) => {
                const color = CLUB_COLORS[club.id];
                const isFav = favoriteClub === club.id;
                return (
                  <button
                    key={club.id}
                    onClick={() => setFavoriteClub(isFav ? null : club.id)}
                    className={`relative group p-4 rounded-xl border transition-all text-left ${
                      isFav
                        ? "border-[#CCFF00]/60 bg-[#CCFF00]/10 shadow-lg shadow-[#CCFF00]/10"
                        : "border-slate-700/50 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/40"
                    }`}
                  >
                    {isFav && (
                      <span className="absolute top-2 right-2 text-[#CCFF00]">
                        <Heart size={12} fill="currentColor" />
                      </span>
                    )}
                    <ClubBadge club={club} size={40} />
                    <p className="text-white font-bold text-xs mt-2 leading-tight">{club.shortName}</p>
                    <p className="text-slate-500 text-[10px]">{club.city}</p>
                    <div className={`mt-2 w-full h-0.5 rounded-full bg-gradient-to-r`}
                      style={{ background: color ? `linear-gradient(to right, ${color.primary}, transparent)` : "#CCFF00" }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destacados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Goleador */}
            {topScorer && (
              <div
                className="bg-gradient-to-br from-emerald-900/30 to-slate-900/60 border border-emerald-700/30 rounded-2xl p-5 cursor-pointer hover:border-emerald-500/50 transition-all"
                onClick={() => setSelectedPlayer(topScorer)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">Máximo Goleador</span>
                </div>
                <div className="flex items-center gap-4">
                  <img src={topScorer.image} alt={topScorer.name} className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-700/50" />
                  <div>
                    <p className="text-white font-black text-base leading-tight">{topScorer.name}</p>
                    <p className="text-slate-400 text-xs">{getClub(topScorer.clubId)?.shortName}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-emerald-400">{topScorer.goals}</span>
                      <span className="text-slate-500 text-xs">goles</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-slate-500 text-[10px] font-mono">
                  <Eye size={10} /> Ver perfil completo
                </div>
              </div>
            )}

            {/* Próximo partido */}
            {upcoming[0] && (() => {
              const home = getClub(upcoming[0].homeTeamId);
              const away = getClub(upcoming[0].awayTeamId);
              const stadium = getStadium(upcoming[0].stadiumId);
              return (
                <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/60 border border-blue-700/30 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays size={14} className="text-blue-400" />
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-bold tracking-wider">Próximo Partido</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center gap-2">
                      {home && <ClubBadge club={home} size={40} />}
                      <p className="text-white font-bold text-xs text-center">{home?.shortName}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#CCFF00] font-black text-lg">VS</p>
                      <p className="text-slate-400 text-[10px] font-mono">{upcoming[0].date}</p>
                      <p className="text-white font-bold text-sm">{upcoming[0].time}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      {away && <ClubBadge club={away} size={40} />}
                      <p className="text-white font-bold text-xs text-center">{away?.shortName}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-slate-500 text-[10px] font-mono">
                    <MapPin size={10} /> {stadium?.name ?? "—"}
                    <span className="ml-auto flex items-center gap-1">
                      <Tv size={10} /> {upcoming[0].tvChannel}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Top 3 Tabla */}
          <div>
            <h2 className="text-xs font-mono uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2">
              <Trophy size={12} className="text-[#CCFF00]" /> Líderes del Torneo
            </h2>
            <div className="space-y-2">
              {standings.slice(0, 3).map((row, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={row.club.id} className="flex items-center gap-4 bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3">
                    <span className="text-xl w-6 text-center">{medals[i]}</span>
                    <ClubBadge club={row.club} size={32} />
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{row.club.shortName}</p>
                      <p className="text-slate-500 text-[10px] font-mono">{row.club.city}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#CCFF00] font-black text-lg">{row.pts}</span>
                      <p className="text-slate-500 text-[10px] font-mono">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setActiveTab("posiciones")}
              className="w-full mt-3 flex items-center justify-center gap-2 text-slate-400 hover:text-[#CCFF00] text-xs font-mono py-2 transition-colors"
            >
              Ver tabla completa <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════ POSICIONES ════════════════════════ */}
      {activeTab === "posiciones" && (
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
            <Trophy size={18} className="text-[#CCFF00]" />
            <h2 className="font-black text-white text-base">Tabla de Posiciones — Temporada 2026</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-[10px] font-mono uppercase border-b border-slate-800">
                  <th className="text-left px-6 py-3 w-8">#</th>
                  <th className="text-left px-2 py-3">Club</th>
                  <th className="text-center px-3 py-3">PTS</th>
                  <th className="text-center px-3 py-3">PJ</th>
                  <th className="text-center px-3 py-3">PG</th>
                  <th className="text-center px-3 py-3">PE</th>
                  <th className="text-center px-3 py-3">PP</th>
                  <th className="text-center px-3 py-3">GF</th>
                  <th className="text-center px-3 py-3">GC</th>
                  <th className="text-center px-3 py-3">DG</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => {
                  const isTop3 = i < 3;
                  return (
                    <tr
                      key={row.club.id}
                      className={`border-b border-slate-800/50 transition-colors hover:bg-slate-800/30 ${
                        isTop3 ? "bg-[#CCFF00]/3" : ""
                      }`}
                    >
                      <td className="px-6 py-3">
                        <span className={`text-xs font-bold ${isTop3 ? "text-[#CCFF00]" : "text-slate-500"}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          <ClubBadge club={row.club} size={28} />
                          <div>
                            <p className="text-white font-semibold text-xs">{row.club.shortName}</p>
                            <p className="text-slate-600 text-[9px] font-mono">{row.club.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className={`font-black text-base ${isTop3 ? "text-[#CCFF00]" : "text-white"}`}>
                          {row.pts}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3 text-slate-300 text-xs">{row.pg + row.pe + row.pp}</td>
                      <td className="text-center px-3 py-3 text-emerald-400 text-xs font-bold">{row.pg}</td>
                      <td className="text-center px-3 py-3 text-amber-400 text-xs">{row.pe}</td>
                      <td className="text-center px-3 py-3 text-rose-400 text-xs">{row.pp}</td>
                      <td className="text-center px-3 py-3 text-slate-300 text-xs">{row.gf}</td>
                      <td className="text-center px-3 py-3 text-slate-300 text-xs">{row.gc}</td>
                      <td className="text-center px-3 py-3">
                        <span className={`text-xs font-bold ${row.gf - row.gc >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.gf - row.gc > 0 ? "+" : ""}{row.gf - row.gc}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 flex gap-4 text-[10px] font-mono text-slate-500 border-t border-slate-800">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#CCFF00]" /> Clasificación directa</span>
            <span>PJ=Partidos · PG=Ganados · PE=Empates · PP=Perdidos · DG=Diferencia</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════ FIXTURE ═══════════════════════════ */}
      {activeTab === "fixture" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <CalendarDays size={18} className="text-[#CCFF00]" />
            <h2 className="font-black text-white text-base">Fixture — Jornada 12</h2>
            <span className="ml-auto text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">
              {matches.length} partidos
            </span>
          </div>
          {matches.map((match) => {
            const home = getClub(match.homeTeamId);
            const away = getClub(match.awayTeamId);
            const stadium = getStadium(match.stadiumId);
            const homeColor = home ? CLUB_COLORS[home.id] : undefined;
            const awayColor = away ? CLUB_COLORS[away.id] : undefined;
            const statusStyle = {
              Programado: "bg-blue-500/15 text-blue-300 border-blue-500/30",
              "En Juego": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse",
              Finalizado: "bg-slate-700/40 text-slate-400 border-slate-600/30",
              Postergado: "bg-amber-500/15 text-amber-300 border-amber-500/30",
            }[match.status];

            return (
              <div key={match.id} className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${statusStyle}`}>
                    {match.status.toUpperCase()}
                  </span>
                  <span className="text-slate-500 text-[10px] font-mono">Jornada {match.round}</span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Home */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    {home && <ClubBadge club={home} size={48} />}
                    <p className="text-white font-bold text-xs text-center leading-tight">{home?.shortName ?? "—"}</p>
                  </div>

                  {/* Score / VS */}
                  <div className="flex flex-col items-center gap-1 px-4">
                    {match.status === "Finalizado" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-white">{match.homeScore}</span>
                        <span className="text-slate-600 font-black">–</span>
                        <span className="text-3xl font-black text-white">{match.awayScore}</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-[#CCFF00] font-black text-xl">VS</p>
                        <p className="text-white font-bold text-sm">{match.time}</p>
                      </div>
                    )}
                    <p className="text-slate-500 text-[10px] font-mono">{match.date}</p>
                  </div>

                  {/* Away */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    {away && <ClubBadge club={away} size={48} />}
                    <p className="text-white font-bold text-xs text-center leading-tight">{away?.shortName ?? "—"}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-4 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={9} /> {stadium?.name ?? "—"}</span>
                  <span className="flex items-center gap-1 ml-auto"><Tv size={9} /> {match.tvChannel}</span>
                  {match.refereeAppointed && (
                    <span className="flex items-center gap-1"><Award size={9} /> {match.refereeAppointed}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════ JUGADORES ═════════════════════════ */}
      {activeTab === "jugadores" && (
        <div className="space-y-5">
          {/* Filter by club */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedClubId(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedClubId === null
                  ? "bg-[#CCFF00] text-slate-950"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              Todos
            </button>
            {clubs.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClubId(selectedClubId === c.id ? null : c.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedClubId === c.id
                    ? "bg-[#CCFF00] text-slate-950"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <ClubBadge club={c} size={16} />
                {c.logo}
              </button>
            ))}
          </div>

          {/* Player cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedPlayers.map((player) => {
              const club = getClub(player.clubId);
              const color = club ? CLUB_COLORS[club.id] : undefined;
              return (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={`group relative bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden cursor-pointer hover:border-slate-500/60 hover:shadow-lg transition-all hover:-translate-y-0.5`}
                >
                  {/* Color strip */}
                  <div
                    className="h-1 w-full"
                    style={{ background: color ? `linear-gradient(to right, ${color.primary}, ${color.secondary})` : "#CCFF00" }}
                  />

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-slate-700"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-slate-800 border border-slate-700 text-white text-[9px] font-black px-1 rounded-md">
                          #{player.shirtNumber}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-sm leading-tight truncate">{player.name}</p>
                        <p className="text-slate-400 text-[10px] font-mono truncate">{club?.shortName}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${POSITION_COLORS[player.position]}`}>
                            {player.position}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            player.status === "Habilitado" ? "bg-emerald-500/20 text-emerald-400" :
                            player.status === "Suspendido" ? "bg-rose-500/20 text-rose-400" :
                            "bg-amber-500/20 text-amber-400"
                          }`}>
                            {player.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mini stats */}
                    <div className="grid grid-cols-4 gap-1.5 mt-4">
                      {[
                        { label: "PJ", value: player.matchesPlayed, color: "text-[#CCFF00]" },
                        { label: "G", value: player.goals, color: "text-emerald-400" },
                        { label: "A", value: player.yellowCards, color: "text-amber-400" },
                        { label: "R", value: player.redCards, color: "text-rose-400" },
                      ].map((s) => (
                        <div key={s.label} className="bg-slate-800/60 rounded-lg p-1.5 text-center">
                          <p className={`text-base font-black ${s.color}`}>{s.value}</p>
                          <p className="text-slate-600 text-[9px] font-mono">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end mt-3 text-[10px] text-slate-600 group-hover:text-[#CCFF00] transition-colors font-mono gap-1">
                      <Eye size={10} /> Ver ficha
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {displayedPlayers.length === 0 && (
            <div className="text-center py-16 text-slate-600">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-mono text-sm">No hay jugadores registrados para este equipo</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════ PREDICCIONES ════════════════════════ */}
      {activeTab === "predicciones" && (
        <PredictionGame matches={matches} clubs={clubs} user={user} />
      )}

      {/* ── Player Modal ─────────────────────────────────────────── */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          club={getClub(selectedPlayer.clubId)}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
