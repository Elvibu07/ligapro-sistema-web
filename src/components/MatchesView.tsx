import React, { useState } from "react";
import { 
  CalendarDays, 
  Map, 
  Tv, 
  ShieldAlert, 
  User, 
  Clock, 
  Plus, 
  ListTodo, 
  MapPin, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Navigation,
  Globe,
  Trophy
} from "lucide-react";
import { Match, Club, Stadium } from "../types";

interface MatchesViewProps {
  matches: Match[];
  clubs: Club[];
  stadiums: Stadium[];
  onMatchesChange: (updatedMatches: Match[]) => void;
  onAddMatch?: (match: Omit<Match, 'id'>) => Promise<Match>;
  onUpdateMatch?: (id: string, updates: Partial<Match>) => Promise<Match>;
}

export default function MatchesView({ matches, clubs, stadiums, onMatchesChange, onAddMatch, onUpdateMatch }: MatchesViewProps) {
  const [showAddMatchForm, setShowAddMatchForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"lista" | "mapa">("lista");
  const [editingMatchResult, setEditingMatchResult] = useState<Match | null>(null);

  // Form State
  const [newHome, setNewHome] = useState("barcelona-sc");
  const [newAway, setNewAway] = useState("ldu-quito");
  const [newStadium, setNewStadium] = useState("monumental");
  const [newDate, setNewDate] = useState("2026-05-24");
  const [newTime, setNewTime] = useState("18:00");
  const [newChannel, setNewChannel] = useState("Zapping Sports");

  const handleToggleLogistics = (matchId: string, key: "seguridadOk" | "ambulanciaOk" | "transmisionTvOk" | "certificacionVarOk" | "balonerosOk") => {
    if (onUpdateMatch) {
      const match = matches.find(m => m.id === matchId);
      if (match) {
        const nextLogistics = {
          ...match.logistics,
          [key]: !match.logistics[key]
        };
        onUpdateMatch(matchId, { logistics: nextLogistics }).catch(err => console.error("Error updating match logistics:", err));
      }
    } else {
      const updated = matches.map(m => {
        if (m.id === matchId) {
          return {
            ...m,
            logistics: {
              ...m.logistics,
              [key]: !m.logistics[key]
            }
          };
        }
        return m;
      });
      onMatchesChange(updated);
    }
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHome === newAway) {
      alert("Un equipo no puede jugar contra sí mismo.");
      return;
    }

    const brandNewMatch: Match = {
      id: "match-" + Date.now(),
      homeTeamId: newHome,
      awayTeamId: newAway,
      date: newDate,
      time: newTime,
      stadiumId: newStadium,
      status: "Programado",
      round: 12,
      tvChannel: newChannel,
      logistics: {
        seguridadOk: false,
        ambulanciaOk: false,
        transmisionTvOk: false,
        certificacionVarOk: false,
        balonerosOk: false
      }
    };

    if (onAddMatch) {
      const { id, ...matchData } = brandNewMatch;
      onAddMatch(matchData).catch(err => console.error("Error creating match:", err));
    } else {
      onMatchesChange([...matches, brandNewMatch]);
    }
    setShowAddMatchForm(false);
  };

  // Helper resolvers
  const getClubShortName = (id: string) => {
    return clubs.find(c => c.id === id)?.shortName || id;
  };

  const getStadiumName = (id: string) => {
    return stadiums.find(s => s.id === id)?.name || id;
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-white tracking-tight">Planificación y Logística de Partidos</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Monitoreo de seguridad preventiva, ambulancias, enlaces de televisión y boletería para la Jornada 12.</p>
        </div>
        <div className="flex space-x-2 mt-3 sm:mt-0">
          <button
            onClick={() => setActiveTab(activeTab === "lista" ? "mapa" : "lista")}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 font-bold rounded-lg text-xs transition"
          >
            {activeTab === "lista" ? "Ver Geografía Altitudes" : "Ver Cuadrícula Logística"}
          </button>
          <button
            onClick={() => setShowAddMatchForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#CCFF00] text-slate-950 font-extrabold rounded-lg text-xs hover:bg-[#b0dc00] transition active:scale-95"
          >
            <Plus size={14} /> Programar Partido
          </button>
        </div>
      </div>

      {activeTab === "lista" ? (
        <div className="space-y-4">
          
          <div className="bg-slate-950 border border-slate-855 rounded-2xl p-5">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 mb-4 block select-none">
              CALENDARIO OPERATIVO JORNADA 12
            </h3>

            <div className="space-y-4">
              {matches.map((m) => {
                // Evaluate logistics state
                const allDone = m.logistics.seguridadOk && m.logistics.ambulanciaOk && 
                                m.logistics.transmisionTvOk && m.logistics.certificacionVarOk && m.logistics.balonerosOk;

                return (
                  <div key={m.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-850 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    
                    {/* Duel & Coords */}
                    <div className="flex-1 text-left space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-mono bg-slate-950 text-slate-400 px-2.5 py-1 font-bold border border-slate-800 rounded">
                           DUELO #{m.round}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">{m.date} a las {m.time}</span>
                      </div>
                      <p className="text-sm font-black text-slate-100 flex items-center gap-2">
                        {getClubShortName(m.homeTeamId)} 
                        {m.status === "Finalizado" ? (
                          <span className="text-[#CCFF00] px-2">{m.homeScore} - {m.awayScore}</span>
                        ) : (
                          <span className="text-slate-550 font-normal">vs</span>
                        )}
                        {getClubShortName(m.awayTeamId)}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1 truncate uppercase">
                        <MapPin size={10} className="text-[#CCFF00]" /> {getStadiumName(m.stadiumId)}
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          m.status === "Finalizado" ? "bg-slate-700 text-slate-300" :
                          m.status === "Programado" ? "bg-blue-500/20 text-blue-400" :
                          "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {m.status}
                        </span>
                      </p>
                    </div>

                    {/* Logistics toggle switches checkboxes */}
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 grid grid-cols-5 gap-3.5 text-center min-w-[300px]">
                      
                      <button 
                        onClick={() => handleToggleLogistics(m.id, "seguridadOk")}
                        className={`flex flex-col items-center hover:scale-105 duration-200 focus:outline-none ${m.logistics.seguridadOk ? "text-emerald-400" : "text-slate-600"}`}
                        title="Policía Nacional y vallas"
                      >
                        <CheckCircle2 size={16} className={m.logistics.seguridadOk ? "fill-emerald-400/5" : ""} />
                        <span className="text-[8px] font-mono uppercase mt-1">Policía</span>
                      </button>

                      <button 
                        onClick={() => handleToggleLogistics(m.id, "ambulanciaOk")}
                        className={`flex flex-col items-center hover:scale-105 duration-200 focus:outline-none ${m.logistics.ambulanciaOk ? "text-emerald-400" : "text-slate-600"}`}
                        title="Ambulancias habilitadas"
                      >
                        <CheckCircle2 size={16} className={m.logistics.ambulanciaOk ? "fill-emerald-400/5" : ""} />
                        <span className="text-[8px] font-mono uppercase mt-1">Médicos</span>
                      </button>

                      <button 
                        onClick={() => handleToggleLogistics(m.id, "transmisionTvOk")}
                        className={`flex flex-col items-center hover:scale-105 duration-200 focus:outline-none ${m.logistics.transmisionTvOk ? "text-emerald-400" : "text-slate-600"}`}
                        title="Canalizador TV satélite"
                      >
                        <CheckCircle2 size={16} className={m.logistics.transmisionTvOk ? "fill-emerald-400/5" : ""} />
                        <span className="text-[8px] font-mono uppercase mt-1">Televisión</span>
                      </button>

                      <button 
                        onClick={() => handleToggleLogistics(m.id, "certificacionVarOk")}
                        className={`flex flex-col items-center hover:scale-105 duration-200 focus:outline-none ${m.logistics.certificacionVarOk ? "text-emerald-400" : "text-slate-600"}`}
                        title="Cámaras VAR certificadas"
                      >
                        <CheckCircle2 size={16} className={m.logistics.certificacionVarOk ? "fill-emerald-400/5" : ""} />
                        <span className="text-[8px] font-mono uppercase mt-1">Línea VAR</span>
                      </button>

                      <button 
                        onClick={() => handleToggleLogistics(m.id, "balonerosOk")}
                        className={`flex flex-col items-center hover:scale-105 duration-200 focus:outline-none ${m.logistics.balonerosOk ? "text-emerald-400" : "text-slate-600"}`}
                        title="Acreditación de pasabalones"
                      >
                        <CheckCircle2 size={16} className={m.logistics.balonerosOk ? "fill-emerald-400/5" : ""} />
                        <span className="text-[8px] font-mono uppercase mt-1">Pasabalones</span>
                      </button>

                    </div>

                    {/* Overall status glow tag */}
                    <div className="xl:text-right flex items-center justify-between xl:flex-col gap-1.5 min-w-[150px]">
                      <span className="text-[9px] font-mono text-slate-500 block">Canal: {m.tvChannel}</span>
                      {allDone ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase font-bold border border-emerald-500/20 rounded">
                           APROBACIÓN TOTAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-mono uppercase font-bold border border-amber-500/20 rounded">
                           LOGÍSTICA PENDIENTE
                        </span>
                      )}
                      
                      <button 
                        onClick={() => setEditingMatchResult(m)}
                        className="mt-1 text-[10px] font-bold px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 rounded transition-colors w-full"
                      >
                        {m.status === 'Finalizado' ? 'Editar Resultado' : 'Registrar Resultado'}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      ) : (
        /* Geographic altitude and dynamic variables simulator */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-950 border border-slate-855 rounded-2xl p-5 text-left">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 mb-2.5">
               GEOGRAFÍA DE ESTADIOS LIGAPRO ECUADOR
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              La cordillera de los Andes provoca altitudes deportivas extremas (Sea Level vs Extreme Altitude). El reglamento vigila parámetros como la calibración de balones mecánicos y luxometría en base a la ubicación geográfica.
            </p>

            <div className="space-y-3">
              {stadiums.map((st) => (
                <div key={st.id} className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-200 text-sm leading-tight">{st.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1 uppercase">{st.city} • lat: {st.locationCoords.lat}, lng: {st.locationCoords.lng}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-100">{st.altitude} m <span className="text-[9px] font-normal text-slate-500">sobre el nivel del mar</span></span>
                    <span className={`block text-[9.5px] font-mono font-bold ${st.altitude > 2000 ? "text-amber-500" : "text-cyan-400"} uppercase mt-1`}>
                      {st.altitude > 2000 ? "Altitud Extrema" : "Región Costa / Mar"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-855 rounded-2xl p-5 text-left space-y-3">
             <h4 className="font-semibold text-xs tracking-wider uppercase text-slate-400">
               POLÍTICAS DE CONTROL ALTITUDINAL (CALEFACCIÓN)
             </h4>
             <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Para estadios ubicados a más de 2,500 metros sobre el nivel del mar (Quito y Sangolquí), los comisarios de juego deben certificar la presión de rebote de los esféricos 30 minutos antes del partido mediante medidor calibrado de barómetros autorizados. Asimismo, es requisito disponer de tanques de oxígeno suplementarios en los dos camerinos principales.
             </p>
             <div className="p-3 bg-slate-900 rounded-lg border border-slate-850 flex items-center space-x-2.5">
               <Globe className="text-[#CCFF00]" size={18} />
               <div className="text-[11px]">
                  <p className="text-slate-300 font-bold">Certificación FIFA COMET</p>
                  <p className="text-slate-500">Todos los terrenos cumplen normativas.</p>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Program match registration Dialog Form */}
      {showAddMatchForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleCreateMatch} 
            className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-left"
          >
            <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-[#CCFF00] uppercase block">Programar Duelo</span>
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 font-sans">
                  <CalendarDays size={16} /> REGISTRO DE DUELO - SERIE A LIGAPRO
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddMatchForm(false)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              
              {/* Teams row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Club Local (Casa) *</label>
                  <select 
                    value={newHome}
                    onChange={(e) => setNewHome(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  >
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.shortName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Club Visitante *</label>
                  <select 
                    value={newAway}
                    onChange={(e) => setNewAway(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  >
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.shortName}</option>)}
                  </select>
                </div>
              </div>

              {/* Stadium & dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-medium mb-1">Sede / Recinto Arbitral *</label>
                  <select 
                    value={newStadium}
                    onChange={(e) => setNewStadium(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  >
                    {stadiums.map(s => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[#CCFF00] font-medium mb-1">Canal de Televisión</label>
                  <input 
                    type="text" 
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  />
                </div>
              </div>

              {/* Date & Kickoff times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha Programada *</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Hora de Kickoff *</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                    required
                  />
                </div>
              </div>

            </div>

            <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowAddMatchForm(false)}
                className="px-4 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-[#CCFF00] text-slate-950 font-extrabold rounded text-xs hover:bg-[#b0dc00] transition"
              >
                Guardar Partido
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Match Result Modal */}
      {editingMatchResult && (
        <MatchResultModal 
          match={editingMatchResult}
          homeName={getClubShortName(editingMatchResult.homeTeamId)}
          awayName={getClubShortName(editingMatchResult.awayTeamId)}
          onClose={() => setEditingMatchResult(null)}
          onSave={async (status, homeScore, awayScore) => {
            if (onUpdateMatch) {
              await onUpdateMatch(editingMatchResult.id, { status, homeScore, awayScore });
            } else {
              const updated = matches.map(m => m.id === editingMatchResult.id ? { ...m, status, homeScore, awayScore } : m);
              onMatchesChange(updated);
            }
            setEditingMatchResult(null);
          }}
        />
      )}

    </div>
  );
}

// Sub-component for Match Result editing
function MatchResultModal({ 
  match, 
  homeName, 
  awayName, 
  onClose, 
  onSave 
}: { 
  match: Match, 
  homeName: string, 
  awayName: string, 
  onClose: () => void, 
  onSave: (status: Match['status'], homeScore?: number, awayScore?: number) => void 
}) {
  const [status, setStatus] = useState<Match['status']>(match.status);
  const [hScore, setHScore] = useState<string>(match.homeScore?.toString() ?? '');
  const [aScore, setAScore] = useState<string>(match.awayScore?.toString() ?? '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const hs = hScore !== '' ? parseInt(hScore) : undefined;
    const as = aScore !== '' ? parseInt(aScore) : undefined;
    onSave(status, hs, as);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSave} className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-left">
        <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 font-sans">
            <Trophy size={16} className="text-[#CCFF00]" /> RESULTADO DEL PARTIDO
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white transition">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2">Estado del Partido</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as Match['status'])}
              className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded text-sm focus:outline-none"
            >
              <option value="Programado">Programado</option>
              <option value="En Juego">En Juego</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Postergado">Postergado</option>
            </select>
          </div>

          {(status === 'En Juego' || status === 'Finalizado') && (
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-3">Marcador Oficial</label>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col items-center flex-1">
                  <p className="text-white font-bold text-xs text-center mb-2 truncate w-full">{homeName}</p>
                  <input 
                    type="number" min="0" required
                    value={hScore} onChange={(e) => setHScore(e.target.value)}
                    className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-xl text-center text-2xl font-black text-white focus:border-[#CCFF00] focus:outline-none"
                  />
                </div>
                <div className="text-slate-500 font-black text-xl pt-6">VS</div>
                <div className="flex flex-col items-center flex-1">
                  <p className="text-white font-bold text-xs text-center mb-2 truncate w-full">{awayName}</p>
                  <input 
                    type="number" min="0" required
                    value={aScore} onChange={(e) => setAScore(e.target.value)}
                    className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-xl text-center text-2xl font-black text-white focus:border-[#CCFF00] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-1.5 bg-slate-950 text-slate-400 rounded text-xs hover:bg-slate-800 transition">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-1.5 bg-[#CCFF00] text-slate-950 font-extrabold rounded text-xs hover:bg-[#b0dc00] transition">
            Guardar Resultado
          </button>
        </div>
      </form>
    </div>
  );
}
