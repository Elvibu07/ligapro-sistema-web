import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  XSquare, 
  FileSpreadsheet, 
  Download, 
  Share2, 
  Check, 
  X,
  Play,
  RotateCcw
} from "lucide-react";
import { Club, Player, Match, Stadium } from "../types";

interface DashboardViewProps {
  clubs: Club[];
  players: Player[];
  matches: Match[];
  stadiums: Stadium[];
  onNavigate: (view: string) => void;
}

export default function DashboardView({ clubs, players, matches, stadiums, onNavigate }: DashboardViewProps) {
  const [timeRemaining, setTimeRemaining] = useState({ days: 1, hours: 21, minutes: 47, seconds: 12 });
  const [shownPlanilla, setShownPlanilla] = useState<any | null>(null);
  
  // Dynamic action state
  const [postponementStatus, setPostponementStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [disputeStatus, setDisputeStatus] = useState<"pending" | "resolved">("pending");
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  // Game simulation state
  const [isSimulatingGame, setIsSimulatingGame] = useState(false);
  const [simScoreHome, setSimScoreHome] = useState(0);
  const [simScoreAway, setSimScoreAway] = useState(0);
  const [simMinutes, setSimMinutes] = useState(0);
  const [simLog, setSimLog] = useState<string[]>([]);

  // Pre-calculated stats
  const totalClubs = clubs.length;
  const activeClubs = clubs.filter(c => c.status === "Habilitado").length;
  const totalPlayers = players.length;
  const activePlayers = players.filter(p => p.status === "Habilitado").length;
  const certifiedStadiums = stadiums.filter(s => s.varCertified).length;

  // Countdown clock effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulation game loop
  useEffect(() => {
    let interval: any;
    if (isSimulatingGame) {
      interval = setInterval(() => {
        setSimMinutes(prev => {
          const nextMin = prev + 15;
          if (nextMin >= 90) {
            setIsSimulatingGame(false);
            setSimLog(log => [...log, "90' - Fin del partido. Planilla enviada digitalmente para firma arbitral."]);
            return 90;
          }
          
          // Random events e.g. goal
          const rand = Math.random();
          if (rand < 0.22) {
            const isHome = Math.random() > 0.45;
            if (isHome) {
              setSimScoreHome(s => s + 1);
              setSimLog(log => [...log, `${nextMin}' - ¡GOOOL de Barcelona S.C.! Janner Corozo remata de cabeza.`]);
            } else {
              setSimScoreAway(s => s + 1);
              setSimLog(log => [...log, `${nextMin}' - ¡GOOOL de L.D.U. Quito! Alex Arce define al palo cambiado.`]);
            }
          } else if (rand < 0.35) {
            setSimLog(log => [...log, `${nextMin}' - Falta dura recibida. Tarjeta amarilla mostrada.`]);
          }

          return nextMin;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulatingGame]);

  const startSimulation = () => {
    setSimMinutes(0);
    setSimScoreHome(0);
    setSimScoreAway(0);
    setSimLog(["0' - Comienza el clásico interandino en el simulador de planillas LigaPro."]);
    setIsSimulatingGame(true);
  };

  const planillasRecibidasMock = [
    {
      id: "plan-121",
      match: "C.S. Emelec vs Orense S.C.",
      result: "2 - 1",
      venue: "Estadio George Capwell",
      referee: "Augusto Aragón",
      time: "Ayer, 21:30",
      status: "Firmado Digitalmente",
      stats: { posHome: "54%", posAway: "46%", shotsHome: 12, shotsAway: 8, foulsHome: 14, foulsAway: 18 }
    },
    {
      id: "plan-120",
      match: "Ind. del Valle vs S.D. Aucas",
      result: "3 - 0",
      venue: "Estadio Banco Guayaquil",
      referee: "Franklin Congo",
      time: "Ayer, 18:00",
      status: "Firmado Digitalmente",
      stats: { posHome: "61%", posAway: "39%", shotsHome: 18, shotsAway: 5, foulsHome: 9, foulsAway: 15 }
    },
    {
      id: "plan-119",
      match: "El Nacional vs Universidad Católica",
      result: "1 - 2",
      venue: "Estadio Olímpico Atahualpa",
      referee: "Luis Quiroz",
      time: "Hace 2 días",
      status: "Firmado por Inspector",
      stats: { posHome: "45%", posAway: "55%", shotsHome: 7, shotsAway: 14, foulsHome: 21, foulsAway: 11 }
    }
  ];

  const getClubName = (id: string) => clubs.find(c => c.id === id)?.name || "Club";
  const getClubShortName = (id: string) => clubs.find(c => c.id === id)?.shortName || "Club";
  const getClubLogo = (id: string) => clubs.find(c => c.id === id)?.logo || "CLB";
  const getStadiumName = (id: string) => stadiums.find(s => s.id === id)?.name || "Estadio";

  const activeLiveMatch = matches.find(m => m.status === "En Juego");

  // Observer to push logs when the live match score changes
  useEffect(() => {
    if (activeLiveMatch) {
      const homeScore = activeLiveMatch.homeScore || 0;
      const awayScore = activeLiveMatch.awayScore || 0;
      
      setSimLog(prev => {
        const msg = `[EN VIVO] Transmisión Oficial: Marcador actualizado a ${homeScore} - ${awayScore}`;
        if (prev.length > 0 && prev[prev.length - 1] === msg) return prev;
        return [...prev, msg];
      });
    }
  }, [activeLiveMatch?.homeScore, activeLiveMatch?.awayScore, activeLiveMatch?.id]);

  const dynamicPlanillas = matches
    .filter(m => m.status === "Finalizado" && m.homeScore !== undefined && m.awayScore !== undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(m => {
      const seed = m.id.charCodeAt(m.id.length - 1);
      const posHome = 40 + (seed % 20);
      return {
        id: `plan-${m.id.slice(0, 5)}`,
        match: `${getClubName(m.homeTeamId)} vs ${getClubName(m.awayTeamId)}`,
        result: `${m.homeScore} - ${m.awayScore}`,
        venue: getStadiumName(m.stadiumId),
        referee: m.refereeAppointed || "Juez Central",
        time: m.date,
        status: "Firmado Digitalmente",
        stats: {
          posHome: `${posHome}%`,
          posAway: `${100 - posHome}%`,
          shotsHome: 5 + (seed % 10),
          shotsAway: 4 + ((seed + 3) % 10),
          foulsHome: 10 + (seed % 8),
          foulsAway: 12 + ((seed + 5) % 8)
        }
      };
    });

  // Combine so it always has at least the mocks, but real ones show up first
  const allPlanillas = [...dynamicPlanillas, ...planillasRecibidasMock];
  const previewPlanillas = allPlanillas.slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Page Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-white tracking-tight">Consola de Control Centralizado</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Consolidación de auditorías para la habilitación de planteles, designaciones y asistencia VAR.</p>
        </div>
        <div className="text-right mt-2 md:mt-0">
          <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-md">
            Actualizado hace 22 segundos
          </span>
        </div>
      </div>

      {/* KPI Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div onClick={() => onNavigate("clubes")} className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl p-4 flex items-center justify-between cursor-pointer group transition-all">
          <div className="text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Clubes Autorizados</span>
            <div className="text-2xl font-black text-white mt-1">{activeClubs} <span className="text-xs font-normal text-slate-500">de {totalClubs}</span></div>
            <span className="text-[10px] font-mono text-[#CCFF00] flex items-center gap-1 mt-1">
              Ver registros <ArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg text-[#CCFF00]">
            <Building2 size={20} />
          </div>
        </div>

        <div onClick={() => onNavigate("plantel")} className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl p-4 flex items-center justify-between cursor-pointer group transition-all">
          <div className="text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Futbolistas Inscritos</span>
            <div className="text-2xl font-black text-white mt-1">{activePlayers} <span className="text-xs font-normal text-slate-500">de {totalPlayers}</span></div>
            <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 mt-1">
              Ver planillas <ArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg text-cyan-400">
            <Users size={20} />
          </div>
        </div>

        <div onClick={() => onNavigate("estadios")} className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl p-4 flex items-center justify-between cursor-pointer group transition-all">
          <div className="text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Estadios VOR</span>
            <div className="text-2xl font-black text-white mt-1">{certifiedStadiums} <span className="text-xs font-normal text-slate-500">de {stadiums.length}</span></div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
              Acreditación VAR <ArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg text-emerald-500">
            <MapPin size={20} />
          </div>
        </div>

        <div onClick={() => onNavigate("programacion")} className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl p-4 flex items-center justify-between cursor-pointer group transition-all">
          <div className="text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Jornada 12</span>
            <div className="text-2xl font-black text-white mt-1">3 <span className="text-xs font-normal text-slate-500">Partidos</span></div>
            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 mt-1">
              Logística oficial <ArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg text-amber-500">
            <Calendar size={20} />
          </div>
        </div>

      </div>

      {/* Main Grid: Match Highlight vs Real-time operations */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Next Iconic Match Countdown & Simulator */}
        <div className="xl:col-span-2 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-850 rounded-2xl p-5 text-white flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full animate-ping ${activeLiveMatch ? "bg-red-500" : "bg-emerald-500"}`}></span>
                <span className={`text-[9px] font-mono uppercase px-2.5 py-1 font-bold border rounded ${activeLiveMatch ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-slate-900 text-slate-300 border-slate-850"}`}>
                  {activeLiveMatch ? "PARTIDO EN VIVO (EN JUEGO)" : "PRÓXIMO PARTIDO CLAVE"}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock size={12} /> {activeLiveMatch ? `FECHA ${activeLiveMatch.round}` : "FECHA 12"} • SERIE A
              </span>
            </div>

            {/* Teams Duel Layout */}
            <div className="grid grid-cols-3 items-center text-center my-6">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-slate-900 text-[#CCFF00] font-black flex items-center justify-center text-xl border border-slate-700 shadow-md">
                  {activeLiveMatch ? getClubLogo(activeLiveMatch.homeTeamId) : "BSC"}
                </div>
                <span className="text-slate-100 text-sm font-extrabold max-w-[120px] truncate mt-2">
                  {activeLiveMatch ? getClubName(activeLiveMatch.homeTeamId) : "Barcelona S.C."}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Local</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-slate-500 text-xs font-mono block">VS</span>
                {activeLiveMatch ? (
                   <div className="bg-red-500 border border-red-600 py-1.5 px-4 rounded-lg text-lg mt-1.5 flex items-center gap-1.5 font-bold text-center text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                     <span>{activeLiveMatch.homeScore || 0}</span>
                     <span>-</span>
                     <span>{activeLiveMatch.awayScore || 0}</span>
                   </div>
                ) : (
                   <div className="bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-lg text-xs mt-1.5 flex items-center gap-1.5 font-bold text-center">
                     <span className="text-[#CCFF00] font-mono animate-pulse">
                       {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
                     </span>
                   </div>
                )}
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-xl border border-slate-700 shadow-md">
                  {activeLiveMatch ? getClubLogo(activeLiveMatch.awayTeamId) : "LDU"}
                </div>
                <span className="text-slate-100 text-sm font-extrabold max-w-[120px] truncate mt-2">
                  {activeLiveMatch ? getClubName(activeLiveMatch.awayTeamId) : "L.D.U. Quito"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Visitante</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg text-left">
                <span className="text-[9px] font-mono text-slate-500 block">Sede</span>
                <p className="font-semibold text-slate-300 mt-0.5 truncate">{activeLiveMatch ? getStadiumName(activeLiveMatch.stadiumId) : "Estad. Monumental"}</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg text-left">
                <span className="text-[9px] font-mono text-slate-500 block">Árbitro Central</span>
                <p className="font-semibold text-slate-300 mt-0.5 truncate">{activeLiveMatch ? (activeLiveMatch.refereeAppointed || "Por Definir") : "Guillermo Guerrero"}</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg text-left">
                <span className="text-[9px] font-mono text-slate-500 block">Señal TV</span>
                <p className="font-semibold text-slate-300 mt-0.5 truncate">Zapping Sports</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg text-left">
                <span className="text-[9px] font-mono text-slate-500 block">Asistencia VAR</span>
                <span className="inline-flex items-center text-emerald-400 font-mono text-[10px] gap-1 font-bold mt-1 uppercase">
                  <CheckCircle2 size={10} /> Operativo
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Match Event Sim Sandbox */}
          <div className="bg-slate-950 border border-slate-850/60 rounded-xl p-4 mt-5 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-900 pb-2 mb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                  {activeLiveMatch ? "Transmisión Oficial de Planillas (EN VIVO)" : "Simulador de Transmisión de Planillas"}
                </span>
                <p className="text-[10px] text-slate-500">
                  {activeLiveMatch ? "Recibiendo datos criptográficos directamente desde el estadio..." : "Prueba el flujo de transmisión de resultados arbitrales directo desde el estadio."}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {activeLiveMatch ? (
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 font-extrabold rounded text-[10px] border border-emerald-500/30">
                    <Check size={10} /> Conexión Segura
                  </span>
                ) : !isSimulatingGame ? (
                  <button 
                    onClick={startSimulation}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#CCFF00] text-slate-950 font-extrabold rounded text-[10px] hover:bg-[#b0dc00] transition active:scale-95"
                  >
                    <Play size={10} /> Iniciar Demo
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsSimulatingGame(false)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white font-extrabold rounded text-[10px] hover:bg-red-700 transition"
                  >
                    Detener
                  </button>
                )}
              </div>
            </div>

            {/* Simulated Live Pitch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col justify-between space-y-2">
                <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-850">
                  <div className="text-left">
                    <span className="text-[9px] font-mono text-[#CCFF00]">{activeLiveMatch ? "TIEMPO TRANSCURRIDO" : "MINUTO REA-TIME"}</span>
                    <p className="text-xl font-bold font-mono mt-0.5">{activeLiveMatch ? "En Curso" : `${simMinutes}'`} <span className="text-xs text-slate-400 font-normal">{activeLiveMatch ? "" : "Fase 1"}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-500 block">{activeLiveMatch ? "MARCADOR OFICIAL" : "MARCADOR DEMO"}</span>
                    <p className="text-lg font-black font-mono mt-0.5 text-slate-200">
                      {activeLiveMatch ? `${activeLiveMatch.homeScore || 0} - ${activeLiveMatch.awayScore || 0}` : `${simScoreHome} - ${simScoreAway}`}
                    </p>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 font-sans leading-relaxed">
                  {activeLiveMatch ? "Transmisión encriptada bajo la red privada de LigaPro VOR. El árbitro central aprueba los cambios en tiempo real." : "*Esta simulación ejemplifica cómo los asistentes de mesa cargan los datos y el linspector los ratifica para emitir las planillas que se ven abajo."}
                </div>
              </div>

              {/* Simulation Feed */}
              <div className="bg-slate-900 rounded-lg p-2.5 h-24 overflow-y-auto border border-slate-850 text-[10px] font-mono space-y-1.5">
                {simLog.length === 0 ? (
                  <span className="text-slate-600 select-none block">
                    {activeLiveMatch ? "Esperando actualización de marcadores desde la mesa de control..." : "Ninguna simulación activa. Presione 'Iniciar Demo' para emular eventos del Barcelona vs LDU."}
                  </span>
                ) : (
                  [...simLog].reverse().map((log, i) => (
                    <div key={i} className="text-slate-300 border-l border-slate-800 pl-1.5">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* System Alerts & Pending Approvals panel */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between">
          
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-[#CCFF00]" /> APROBACIONES DE GESTIÓN
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 mb-4">Autorizaciones solicitadas por clubes o delegados arbitrales.</p>

            {/* Alert Box 1: Emelec Partidos Postergación */}
            <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-850 mb-3 text-left">
              <div className="flex items-center justify-between">
                <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold">
                  Postergación Solicitada
                </span>
                <span className="text-[9px] font-mono text-slate-500">Ayer, 16:45</span>
              </div>
              <p className="text-xs font-bold text-slate-200 mt-2">Duelo: C.S. Emelec vs IDV</p>
              <p className="text-[11px] text-slate-400 font-sans mt-1">Emelec solicita postergar el encuentro correspondiente a la Jornada 12 debido a su viaje para Copa Sudamericana.</p>

              {/* Interactive approval */}
              <div className="mt-3.5 flex items-center justify-end space-x-2 border-t border-slate-950 pt-3">
                {postponementStatus === "pending" ? (
                  <>
                    <button 
                      onClick={() => setPostponementStatus("rejected")}
                      className="px-2.5 py-1 text-[10px] border border-slate-850 text-slate-400 hover:text-red-400 hover:border-red-500/20 rounded transition"
                    >
                      Rechazar
                    </button>
                    <button 
                      onClick={() => setPostponementStatus("approved")}
                      className="px-3 py-1 text-[10px] bg-[#CCFF00] text-slate-950 font-semibold rounded hover:bg-[#b5e000] transition"
                    >
                      Aprobar Oficio
                    </button>
                  </>
                ) : postponementStatus === "approved" ? (
                  <span className="text-emerald-400 text-[10px] font-mono font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> DECRETO: SOLICITUD APROBADA (POSTERGADO)
                  </span>
                ) : (
                  <span className="text-red-400 text-[10px] font-mono font-semibold flex items-center gap-1">
                    <XSquare size={12} /> DECRETO: SOLICITUD RECHAZADA (SE JUEGA)
                  </span>
                )}
              </div>
            </div>

            {/* Alert Box 2: Arbitral Conflict Discrepancy */}
            <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-850 text-left">
              <div className="flex items-center justify-between">
                <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold">
                  Conflicto Arbitral
                </span>
                <span className="text-[9px] font-mono text-slate-500">Hace 3 horas</span>
              </div>
              <p className="text-xs font-bold text-slate-200 mt-2">Ref: Guillermo Guerrero</p>
              <p className="text-[11px] text-slate-400 font-sans mt-1">Delegación de L.D.U. Quito ingresó carta de observación sobre el referí por nacer en la misma provincia que el rival.</p>

              {/* Action buttons */}
              <div className="mt-3.5 flex items-center justify-end space-x-2 border-t border-slate-950 pt-3">
                {disputeStatus === "pending" ? (
                  <>
                    <button 
                      onClick={() => onNavigate("arbitros")}
                      className="px-2.5 py-1 text-[10px] border border-slate-850 text-slate-400 hover:text-white rounded transition"
                    >
                      Ir a Panel Sorteo
                    </button>
                    <button 
                      onClick={() => setDisputeStatus("resolved")}
                      className="px-3 py-1 bg-slate-800 text-slate-200 text-[10px] rounded hover:bg-slate-700 transition"
                    >
                      Desestimar Conflicto
                    </button>
                  </>
                ) : (
                  <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                    <CheckCircle2 size={12} /> OBS. RESOLVIDA (ESTATUS APTO)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-900 pt-3 text-center">
            <span className="text-[9px] font-mono text-slate-500 block">Todas las decisiones quedan guardadas en el log criptográfico de LigaPro</span>
          </div>

        </div>

      </div>

      {/* Received Match Sheet Table (Planillas) */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400">ÚLTIMAS PLANILLAS DIGITALES RECIBIDAS</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Sometidas por el comisario de juego al finalizar cada encuentro de la Jornada 11.</p>
          </div>
          <button 
            onClick={() => setShowFullHistory(true)}
            className="text-xs font-bold text-[#CCFF00] hover:underline flex items-center gap-1"
          >
            Ver Historial Completo <ArrowRight size={12} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-mono text-[10px] uppercase">
                <th className="py-3 px-4">PARTIDO</th>
                <th className="py-3 px-4">RESULTADO</th>
                <th className="py-3 px-4">SEDE / ESTADIO</th>
                <th className="py-3 px-4">ÁRBITRO CENTRAL</th>
                <th className="py-3 px-4">ENVIADO</th>
                <th className="py-3 px-4">ESTADO CONCILIADO</th>
                <th className="py-3 px-4 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-medium">
              {previewPlanillas.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40 text-slate-300">
                  <td className="py-3 px-4 font-bold text-slate-200">{p.match}</td>
                  <td className="py-3 px-4 font-mono text-[#CCFF00]">{p.result}</td>
                  <td className="py-3 px-4 text-slate-400">{p.venue}</td>
                  <td className="py-3 px-4 text-slate-400">{p.referee}</td>
                  <td className="py-3 px-4 text-[10px] font-mono text-slate-500">{p.time}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase font-bold">
                      <CheckCircle2 size={10} /> {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => setShownPlanilla(p)} 
                      className="px-2.5 py-1 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 rounded text-[10.5px] font-semibold transition"
                    >
                      Revisar Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Planila Details Modal dialog popup */}
      {shownPlanilla && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-left">
            <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-[#CCFF00] uppercase tracking-wider">Planilla Oficial Conciliada</span>
                <h4 className="text-sm font-black text-slate-100">{shownPlanilla.match}</h4>
              </div>
              <button 
                onClick={() => setShownPlanilla(null)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-300">
              
              {/* Score header */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex items-center justify-between text-center">
                <div className="flex-1">
                  <p className="font-extrabold text-[#CCFF00] text-sm truncate">{shownPlanilla.match.split(" vs ")[0]}</p>
                  <span className="text-[10px] text-slate-500 font-mono">Local</span>
                </div>
                <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 font-mono font-black text-xl text-white">
                  {shownPlanilla.result}
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-slate-200 text-sm truncate">{shownPlanilla.match.split(" vs ")[1]}</p>
                  <span className="text-[10px] text-slate-500 font-mono">Visitante</span>
                </div>
              </div>

              {/* Main metrics */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Estadísticas De Rendimiento</span>
                <div className="grid grid-cols-3 items-center text-center p-2.5 bg-slate-900/50 rounded-lg">
                  <span className="font-semibold">{shownPlanilla.stats.posHome}</span>
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Posesión</span>
                  <span className="font-semibold">{shownPlanilla.stats.posAway}</span>
                </div>
                <div className="grid grid-cols-3 items-center text-center p-2.5 bg-slate-900/50 rounded-lg">
                  <span className="font-semibold">{shownPlanilla.stats.shotsHome}</span>
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Remates</span>
                  <span className="font-semibold">{shownPlanilla.stats.shotsAway}</span>
                </div>
                <div className="grid grid-cols-3 items-center text-center p-2.5 bg-slate-900/50 rounded-lg">
                  <span className="font-semibold">{shownPlanilla.stats.foulsHome}</span>
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Fibras / Faltas</span>
                  <span className="font-semibold">{shownPlanilla.stats.foulsAway}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="border-t border-slate-900 pt-4 grid grid-cols-2 gap-4 text-center mt-4">
                <div className="p-3 bg-slate-900/30 rounded-lg border border-dashed border-slate-800 flex flex-col justify-between h-24">
                  <span className="text-[9px] font-mono text-slate-500 block">Firma Comisario</span>
                  <div className="font-mono text-[10px] text-emerald-400 italic font-bold">Documento Encriptado sha256</div>
                  <div className="text-[10px] text-slate-400 font-semibold">{shownPlanilla.referee}</div>
                </div>
                <div className="p-3 bg-slate-900/30 rounded-lg border border-dashed border-slate-800 flex flex-col justify-between h-24">
                  <span className="text-[9px] font-mono text-slate-500 block">Firma Arbitraje</span>
                  <div className="font-mono text-[10px] text-emerald-400 italic font-bold">Firma Digital Biométrica</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Comisión Arbitral LigaPro</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[9.5px] font-mono text-slate-500">ID Ficha: {shownPlanilla.id}</span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 text-slate-300 hover:text-white rounded text-xs transition border border-slate-800"
                >
                  <Download size={12} /> Imprimir PDF Oficial
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CCFF00] text-slate-950 font-bold rounded text-xs transition hover:bg-[#b0dc00]">
                  <Share2 size={12} /> Sincronizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full History Modal */}
      {showFullHistory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-left">
            <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h4 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-[#CCFF00]"/> Historial Completo de Planillas
                </h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">Todas las planillas conciliadas y firmadas de la temporada actual.</p>
              </div>
              <button 
                onClick={() => setShowFullHistory(false)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-950 z-10 shadow-sm shadow-slate-950">
                  <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase">
                    <th className="py-4 px-6 bg-slate-950">PARTIDO</th>
                    <th className="py-4 px-6 bg-slate-950">RESULTADO</th>
                    <th className="py-4 px-6 bg-slate-950">SEDE / ESTADIO</th>
                    <th className="py-4 px-6 bg-slate-950">ÁRBITRO CENTRAL</th>
                    <th className="py-4 px-6 bg-slate-950">ENVIADO</th>
                    <th className="py-4 px-6 bg-slate-950">ESTADO CONCILIADO</th>
                    <th className="py-4 px-6 bg-slate-950 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-medium">
                  {allPlanillas.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/60 text-slate-300 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-200">{p.match}</td>
                      <td className="py-4 px-6 font-mono text-[#CCFF00] text-sm">{p.result}</td>
                      <td className="py-4 px-6 text-slate-400">{p.venue}</td>
                      <td className="py-4 px-6 text-slate-400">{p.referee}</td>
                      <td className="py-4 px-6 text-[10px] font-mono text-slate-500">{p.time}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase font-bold border border-emerald-500/20">
                          <CheckCircle2 size={10} /> {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => setShownPlanilla(p)} 
                          className="px-3 py-1.5 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 rounded text-[10.5px] font-semibold transition shadow-sm"
                        >
                          Ver Ficha Detallada
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 shrink-0 text-right">
               <span className="text-[10px] text-slate-500 font-mono">Total de planillas: {allPlanillas.length}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
