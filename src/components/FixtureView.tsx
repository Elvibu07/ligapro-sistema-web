import React, { useState } from "react";
import { CalendarDays, MapPin, Tv, User, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2, Navigation, Landmark, Sun, Compass } from "lucide-react";
import { Match, Club, Stadium } from "../types";

interface FixtureViewProps {
  matches: Match[];
  clubs: Club[];
  stadiums: Stadium[];
}

export default function FixtureView({ matches, clubs, stadiums }: FixtureViewProps) {
  const [selectedRound, setSelectedRound] = useState<number>(12);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("match-1");

  // Filter matches for the selected round
  const roundMatches = matches.filter(m => m.round === selectedRound);

  // Active match helper
  const activeMatch = matches.find(m => m.id === selectedMatchId) || roundMatches[0] || matches[0];

  const getClubName = (id: string) => {
    return clubs.find(c => c.id === id)?.name || id;
  };

  const getClubShortName = (id: string) => {
    return clubs.find(c => c.id === id)?.shortName || id;
  };

  const getClubLogo = (id: string) => {
    return clubs.find(c => c.id === id)?.logo || "CLUB";
  };

  const getStadium = (id: string) => {
    return stadiums.find(s => s.id === id);
  };

  // Calendar days grid seed (representing May 2026 for instance)
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const matchHighlightDays = [12, 17, 23, 24, 25];

  // Handler to move rounds
  const changeRound = (dir: "prev" | "next") => {
    if (dir === "prev" && selectedRound > 1) {
      setSelectedRound(selectedRound - 1);
    } else if (dir === "next" && selectedRound < 15) {
      setSelectedRound(selectedRound + 1);
    }
  };

  return (
    <div className="space-y-6 text-left" id="fixture-view-container">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <CalendarDays className="text-[#CCFF00]" size={20} /> Fixture y Calendario de Partidos 2026
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Navegación oficial por jornadas de la Serie A. Haga clic en un partido para inspeccionar el informe meteorológico, de altitud y de infraestructura de la sede.
        </p>
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Match navigation/display */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Round Skipper Navigator */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center justify-between">
            <button 
              onClick={() => changeRound("prev")}
              disabled={selectedRound <= 1}
              className="p-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="text-center">
              <span className="text-[10px] font-mono text-[#CCFF00] font-bold uppercase tracking-widest block">Estadio Regular 2026</span>
              <h2 className="text-sm font-black text-slate-100 font-sans mt-0.5">Jornada {selectedRound} de 15</h2>
            </div>

            <button 
              onClick={() => changeRound("next")}
              disabled={selectedRound >= 15}
              className="p-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Round matches list */}
          <div className="space-y-3">
            {roundMatches.length > 0 ? (
              roundMatches.map((m) => {
                const isActive = m.id === selectedMatchId;
                
                // Status styles
                let statusLabel = "PROGRAMADO";
                let statusColor = "bg-slate-900 text-slate-400 border border-slate-800";
                
                if (m.status === "Finalizado") {
                  statusLabel = "FINALIZADO";
                  statusColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                } else if (m.status === "En Juego") {
                  statusLabel = "EN VIVO";
                  statusColor = "bg-red-500/15 text-red-500 border border-red-500/20 animate-pulse";
                } else if (m.status === "Postergado") {
                  statusLabel = "POSTERGADO";
                  statusColor = "bg-amber-500/10 text-amber-500 border border-amber-505/20";
                }

                return (
                  <div 
                    key={m.id}
                    id={`fixture-card-${m.id}`}
                    onClick={() => setSelectedMatchId(m.id)}
                    className={`p-4 rounded-xl text-left border cursor-pointer transition duration-200 ${
                      isActive 
                        ? "bg-slate-900/90 border-[#CCFF00] shadow-md" 
                        : "bg-slate-950 border-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[8.5px] font-mono leading-none px-2 py-0.5 rounded font-extrabold ${statusColor}`}>
                          {statusLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{m.date} • {m.time}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Tv size={11} className="text-slate-500" /> {m.tvChannel}
                      </span>
                    </div>

                    {/* Team versus row */}
                    <div className="grid grid-cols-7 items-center gap-2 py-1">
                      
                      {/* Home */}
                      <div className="col-span-3 flex items-center space-x-3 text-left">
                        <span className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-xs text-white">
                          {getClubLogo(m.homeTeamId)}
                        </span>
                        <span className="text-sm font-extrabold text-slate-200 truncate">{getClubShortName(m.homeTeamId)}</span>
                      </div>

                      {/* Score or VS ticker */}
                      <div className="col-span-1 text-center font-mono font-black text-sm text-slate-100">
                        {m.status === "Finalizado" || m.status === "En Juego" ? (
                          <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                            {m.homeScore ?? 0} - {m.awayScore ?? 0}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">VS</span>
                        )}
                      </div>

                      {/* Away */}
                      <div className="col-span-3 flex items-center justify-end space-x-3 text-right">
                        <span className="text-sm font-extrabold text-slate-200 truncate">{getClubShortName(m.awayTeamId)}</span>
                        <span className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-xs text-white">
                          {getClubLogo(m.awayTeamId)}
                        </span>
                      </div>

                    </div>

                    <div className="mt-3.5 pt-3.5 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-[#CCFF00]" /> {getStadium(m.stadiumId)?.name}
                      </span>
                      {m.refereeAppointed && (
                        <span className="flex items-center gap-1">
                          <User size={11} /> Árb: {m.refereeAppointed}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-950 border border-slate-850 p-12 text-center rounded-xl font-mono text-xs text-slate-500">
                <AlertCircle className="mx-auto mb-2 text-slate-700" size={24} />
                No hay partidos programados para esta jornada aún.
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar: Months Calendar & Stadium Info */}
        <div className="space-y-6">
          
          {/* Calendar Block (representing May 2026) */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-3">
              <span className="text-xs font-black text-slate-150 uppercase tracking-wider font-sans">Calendario</span>
              <span className="text-[10px] font-mono text-[#CCFF00] font-bold">Mayo 2026</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] mb-2 text-slate-500 font-bold">
              <span>DO</span><span>LU</span><span>MA</span><span>MI</span><span>JU</span><span>VI</span><span>SA</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
              {/* Empty offsets to represent starting month weekday */}
              <span className="text-slate-800 select-none">29</span>
              <span className="text-slate-800 select-none">30</span>
              
              {calendarDays.map((day) => {
                const isMatchDay = matchHighlightDays.includes(day);
                return (
                  <span 
                    key={day}
                    className={`py-1 rounded font-semibold ${
                      isMatchDay 
                        ? "bg-[#CCFF00]/15 text-[#CCFF00] font-black border border-[#CCFF00]/25" 
                        : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
            <p className="text-[9px] text-slate-500 font-mono mt-3 text-center uppercase">
              • Círculos resaltan fecha con partidos oficiales LigaPro
            </p>
          </div>

          {/* Active stadium info breakdown (Mockup 1 right panel) */}
          {activeMatch && (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden text-left relative">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800">
                <span className="text-[8px] font-mono text-[#CCFF00] font-bold uppercase tracking-wide block">
                  Información Técnica Del Estadio
                </span>
                <h3 className="text-xs font-black text-slate-100 flex items-center gap-1 uppercase mt-0.5 text-ellipsis overflow-hidden whitespace-nowrap">
                  <Landmark size={12} className="text-[#CCFF00]" /> {getStadium(activeMatch.stadiumId)?.name}
                </h3>
              </div>

              {/* Pseudo Satellite Image map frame */}
              <div className="h-28 bg-slate-900 border-b border-slate-900 flex flex-col items-center justify-center font-mono text-[10px] text-slate-500 relative select-none">
                <Compass className="animate-spin duration-300 w-8 h-8 text-slate-800 mb-1" />
                <span className="text-[8px] uppercase tracking-widest text-slate-500">Sincronización Satelital VOR</span>
                {/* Coordinates overlay tags */}
                <div className="absolute bottom-2 right-2 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] border border-slate-900">
                  LAT: {getStadium(activeMatch.stadiumId)?.locationCoords.lat}°
                </div>
              </div>

              {/* Details table */}
              <div className="p-4 space-y-2.5 text-xs">
                
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500 flex items-center gap-1"><Compass size={11} /> Ubicación / Ciudad:</span>
                  <span className="font-semibold text-slate-300 font-mono text-right">{getStadium(activeMatch.stadiumId)?.city}</span>
                </div>

                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500 flex items-center gap-1"><Navigation size={11} /> Altitud Deportiva:</span>
                  <span className="font-mono text-[#CCFF00] font-black text-right">
                    {getStadium(activeMatch.stadiumId)?.altitude} m s.n.m.
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500 flex items-center gap-1"><Sun size={11} /> Iluminación Luxometría:</span>
                  <span className="font-mono font-bold text-slate-300 text-end">
                    {getStadium(activeMatch.stadiumId)?.lightingLux} LUX
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500 flex items-center gap-1">🌿 Tipo de Césped:</span>
                  <span className="font-semibold text-slate-300 text-end">{getStadium(activeMatch.stadiumId)?.grassType}</span>
                </div>

                <div className="pt-3.5 border-t border-slate-900">
                  <div className="flex items-center space-x-2 bg-slate-900/45 p-2 rounded-lg border border-slate-850">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-200">Interconectividad VOR</p>
                      <p className="text-[9px] text-slate-500 font-mono">
                        {getStadium(activeMatch.stadiumId)?.vorConnectivity}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
              
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
