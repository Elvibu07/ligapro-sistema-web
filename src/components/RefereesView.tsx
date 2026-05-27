import React, { useState, useEffect } from "react";
import { User, Shuffle, AlertCircle, CheckCircle2, RotateCcw, Award, Info, Scale, Users, ShieldAlert } from "lucide-react";
import { Referee, Match, Club } from "../types";

interface RefereesViewProps {
  referees: Referee[];
  matches: Match[];
  clubs: Club[];
  onMatchesChange: (updatedMatches: Match[]) => void;
}

export default function RefereesView({ referees, matches, clubs, onMatchesChange }: RefereesViewProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningText, setSpinningText] = useState("Listo para sorteo");
  const [spinClass, setSpinClass] = useState("");
  
  // Conflicted referees tracking helper
  const getRefereeConflictWarning = (ref: Referee, match: Match) => {
    // Check if referee's hometown province matches home team province or if they have declared conflicts in types
    const declaredConflicts = ref.activeConflicts;
    const isHomeConflict = declaredConflicts.some(tc => match.homeTeamId.includes(tc.toLowerCase().replace(/[^a-z0-9]/g, "-")));
    const isAwayConflict = declaredConflicts.some(tc => match.awayTeamId.includes(tc.toLowerCase().replace(/[^a-z0-9]/g, "-")));
    
    if (isHomeConflict || isAwayConflict) {
      return `RESTRICCIÓN ACTIVA: El referí posee conflicto declarado / origen con ${isHomeConflict ? "Equipo Local" : "Equipo Visitante"}.`;
    }
    return null;
  };

  const executeSorteo = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    let count = 0;
    
    const interval = setInterval(() => {
      // Pick random referee name for animation effect
      const randomRef = referees[Math.floor(Math.random() * referees.length)];
      setSpinningText(`Sorteando bolillero... ${randomRef.name.toUpperCase()}`);
      count++;

      if (count > 15) {
        clearInterval(interval);
        
        // Finalize raffle assignment: assign random referees to scheduled matches!
        const assignedMatches = matches.map((match) => {
          // Find a referee that ideally doesn't have an intense conflicts for this match if possible
          let chosenRef = referees[Math.floor(Math.random() * referees.length)];
          
          // Try 5 times to avoid direct conflict
          let attempt = 0;
          while (attempt < 5) {
            const conflict = getRefereeConflictWarning(chosenRef, match);
            if (!conflict) break;
            chosenRef = referees[Math.floor(Math.random() * referees.length)];
            attempt++;
          }

          return {
            ...match,
            refereeAppointed: chosenRef.name
          };
        });

        onMatchesChange(assignedMatches);
        setIsSpinning(false);
        setSpinningText("Sorteo Arbitral Completado con Certificación");
        window.dispatchEvent(new CustomEvent('ligapro-notification', {
          detail: {
            text: "Sorteo Arbitral Completado para la Jornada 12",
            type: "arbitraje",
            view: "arbitros"
          }
        }));
      }
    }, 120);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold font-sans text-white tracking-tight">Designación y Sorteo de Árbitros</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">Asignación balística por bolillero mecánico televisado o designación directa por Comité de Árbitros LigaPro.</p>
      </div>

      {/* Raffle Sorteo simulation container */}
      <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-850 rounded-2xl p-6 text-center text-white relative overflow-hidden">
        
        <div className="max-w-xl mx-auto space-y-4 py-3">
          <span className="bg-[#CCFF00]/10 text-[#CCFF00] font-mono text-[9px] font-bold px-3 py-1 rounded border border-[#CCFF00]/25 uppercase tracking-widest inline-block select-none">
            BOLILLERO DIGITAL HOMOLOGADO
          </span>
          <h2 className="text-lg font-black tracking-tight text-slate-100">
             Sorteo de Árbitros - Jornada 12 LigaPro
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
             Haga click abajo para emular la jaula de bolillas rotatorias mecánicas. El sistema emparejará referís de categoría FIFA garantizando transparencia.
          </p>

          {/* Lottery Cage visual screen */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs max-w-xs mx-auto my-4 flex items-center justify-center h-20 shadow-inner">
            <span className={`font-semibold tracking-wider text-center ${isSpinning ? "text-[#CCFF00] animate-pulse" : "text-emerald-400 animate-none"}`}>
              {spinningText}
            </span>
          </div>

          <button
            onClick={executeSorteo}
            disabled={isSpinning}
            className="px-6 py-2.5 bg-[#CCFF00] text-slate-950 font-black rounded-lg text-xs tracking-wide hover:bg-[#b5e000] transition active:scale-95 disabled:bg-slate-900 disabled:text-slate-600 border border-transparent disabled:border-slate-800"
          >
            {isSpinning ? "Sorteando Bolillas Real-Time..." : "Iniciar Sorteo Arbitral Mecanizado"}
          </button>
        </div>

      </div>

      {/* Matches with active Arbitral Designation list */}
      <div className="space-y-4">
        <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 block pb-1 select-none">
          DESIGNACIONES PARA LA FECHA DE TORNEO
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => {
            const refereeName = match.refereeAppointed || "Sin designar (Reclame sorteo)";
            const refDetail = referees.find(r => r.name === refereeName);
            const warningConflict = refDetail ? getRefereeConflictWarning(refDetail, match) : null;

            return (
              <div key={match.id} className="bg-slate-950 border border-slate-855 rounded-2xl overflow-hidden flex flex-col justify-between">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-905 bg-slate-900/40">
                  <span className="text-[9.5px] font-mono text-slate-500 uppercase block mb-1">PROGRAMACIÓN OFICIAL</span>
                  <p className="text-xs font-black text-slate-200">
                    {clubs.find(c => c.id === match.homeTeamId)?.shortName} vs {clubs.find(c => c.id === match.awayTeamId)?.shortName}
                  </p>
                </div>

                <div className="p-4 space-y-3.5">
                  
                  {/* Assigned Referi details block */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-850 flex items-center justify-between text-left">
                    <div>
                      <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Árbitro Central</span>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">{refereeName}</p>
                      {refDetail && (
                        <span className="text-[9.5px] font-mono text-[#CCFF00] uppercase block mt-1">Cataría: {refDetail.category} • {refDetail.province}</span>
                      )}
                    </div>
                    <User size={20} className="text-slate-600" />
                  </div>

                  {/* Conflict indicators banner */}
                  {warningConflict ? (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[10.5px] font-mono flex items-start space-x-1.5 leading-snug">
                       <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-500" />
                       <span>{warningConflict}</span>
                    </div>
                  ) : match.refereeAppointed ? (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-mono flex items-start space-x-1.5 leading-snug">
                       <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-400" />
                       <span>AUSENCIA DE CONFLICTO DE BIAS. Referí apto para ejercer juzgamiento.</span>
                    </div>
                  ) : null}

                </div>

                {/* Footer action */}
                <div className="p-3 bg-slate-900/60 border-t border-slate-900 flex items-center justify-between text-[10.5px] font-sans">
                  <span className="text-slate-500 text-[9.5px]">Sede: {match.tvChannel}</span>
                  <span className="font-mono text-[9px] text-[#CCFF00] font-bold uppercase">Acreditación: OK</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
