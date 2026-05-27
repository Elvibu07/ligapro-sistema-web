import React, { useState } from "react";
import { 
  Gavel, 
  FileText, 
  DollarSign, 
  ShieldAlert, 
  HelpCircle, 
  Plus, 
  Search, 
  Check, 
  X, 
  Award, 
  Calendar, 
  AlertCircle,
  FileMinus
} from "lucide-react";
import { Sanction } from "../types";

interface DisciplinesViewProps {
  sanctions: Sanction[];
  onSanctionsChange: (updatedSanctions: Sanction[]) => void;
  onAddSanction?: (sanction: Omit<Sanction, 'id'>) => Promise<Sanction>;
  onUpdateSanction?: (id: string, updates: Partial<Sanction>) => Promise<Sanction>;
}

export default function DisciplinesView({ sanctions, onSanctionsChange, onAddSanction, onUpdateSanction }: DisciplinesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("Todos");
  
  // Emit form state
  const [showEmitModal, setShowEmitModal] = useState(false);
  const [emitTargetType, setEmitTargetType] = useState<"Jugador" | "Club">("Jugador");
  const [emitTargetName, setEmitTargetName] = useState("");
  const [emitClubName, setEmitClubName] = useState("Barcelona S.C.");
  const [emitOffense, setEmitOffense] = useState("");
  const [emitSeverity, setEmitSeverity] = useState<"Baja" | "Media" | "Alta" | "Crítica">("Baja");
  const [emitFine, setEmitFine] = useState(500);
  const [emitSuspension, setEmitSuspension] = useState(1);

  // Appeal revision state selection
  const [reviewingSanction, setReviewingSanction] = useState<Sanction | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  const totalFinesUSD = sanctions.reduce((sum, s) => sum + s.fineUSD, 0);
  const pendingAppealsCount = sanctions.filter(s => s.appealDetails?.status === "Pendiente").length;
  const activeBansCount = sanctions.reduce((sum, s) => sum + s.matchesSuspended, 0);

  const handleEmitSanctionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emitTargetName || !emitOffense) {
      alert("Por favor rellene el nombre del sancionado y la ofensa cometida.");
      return;
    }

    const brandNew: Sanction = {
      id: "sanc-" + Date.now(),
      targetType: emitTargetType,
      targetName: emitTargetName,
      clubName: emitClubName,
      offense: emitOffense,
      severity: emitSeverity,
      fineUSD: Number(emitFine),
      matchesSuspended: emitTargetType === "Jugador" ? Number(emitSuspension) : 0,
      dateEmitted: new Date().toISOString().split("T")[0],
      resolved: false
    };

    if (onAddSanction) {
      const { id, ...sanctionData } = brandNew;
      onAddSanction(sanctionData).catch(err => console.error("Error creating sanction:", err));
    } else {
      onSanctionsChange([brandNew, ...sanctions]);
    }
    setShowEmitModal(false);

    // Reset Form
    setEmitTargetName("");
    setEmitOffense("");
    setEmitFine(500);
    setEmitSuspension(1);
    setEmitSeverity("Baja");
  };

  const handleResolveSanction = (id: string) => {
    if (onUpdateSanction) {
      onUpdateSanction(id, { resolved: true, fineUSD: 0 }).catch(err => console.error("Error updating sanction:", err));
    } else {
      const updated = sanctions.map(s => {
        if (s.id === id) {
          return { ...s, resolved: true, fineUSD: 0 }; // representing payment complete
        }
        return s;
      });
      onSanctionsChange(updated);
    }
  };

  const handleResolveAppeal = (sanctionId: string, status: "Aprobado" | "Rechazado") => {
    if (onUpdateSanction) {
      const sanction = sanctions.find(s => s.id === sanctionId);
      if (sanction && sanction.appealDetails) {
        const fineUSD = status === "Aprobado" ? Math.floor(sanction.fineUSD / 2) : sanction.fineUSD;
        const matchesSuspended = status === "Aprobado" ? Math.floor(sanction.matchesSuspended / 2) : sanction.matchesSuspended;
        const updatedAppeal = {
          ...sanction.appealDetails,
          status,
          resolutionComment: reviewComment || (status === "Aprobado" ? "Tribunal concede reducción por mérito." : "Tribunal ratifica sanción inicial en base a video de transmisión.")
        };
        onUpdateSanction(sanctionId, {
          fineUSD,
          matchesSuspended,
          appealDetails: updatedAppeal,
          resolved: status === "Aprobado"
        }).catch(err => console.error("Error resolving appeal:", err));
      }
    } else {
      const updated = sanctions.map(s => {
        if (s.id === sanctionId && s.appealDetails) {
          // If appeal is approved, reduce sanction fines and suspension matches by half!
          const fineUSD = status === "Aprobado" ? Math.floor(s.fineUSD / 2) : s.fineUSD;
          const matchesSuspended = status === "Aprobado" ? Math.floor(s.matchesSuspended / 2) : s.matchesSuspended;
          
          return {
            ...s,
            fineUSD,
            matchesSuspended,
            appealDetails: {
              ...s.appealDetails,
              status,
              resolutionComment: reviewComment || (status === "Aprobado" ? "Tribunal concede reducción por mérito." : "Tribunal ratifica sanción inicial en base a video de transmisión.")
            },
            resolved: status === "Aprobado"
          };
        }
        return s;
      });
      onSanctionsChange(updated);
    }
    setReviewingSanction(null);
    setReviewComment("");
  };

  const filteredSanctions = sanctions.filter(s => {
    const matchesSearch = s.targetName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.offense.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.clubName.toLowerCase().includes(searchTerm.toLowerCase());
    if (severityFilter === "Todos") return matchesSearch;
    return matchesSearch && s.severity === severityFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* View Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-white tracking-tight">Comisión Evaluadora y Control Disciplinario</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Boletín de sanciones, conciliaciones monetarias de multas y tribunal de apelación arbitral deportivo.</p>
        </div>
        <button
          onClick={() => setShowEmitModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#CCFF00] text-slate-950 font-extrabold rounded-lg text-xs hover:bg-[#b0dc00] transition mt-3 sm:mt-0 active:scale-95"
        >
          <Plus size={14} /> Registrar Nueva Sanción
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center justify-between text-left">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block select-none">Recaudación por Multas</span>
            <div className="text-2xl font-black text-rose-500 font-mono mt-1">${totalFinesUSD.toLocaleString()} USD</div>
            <p className="text-[9.5px] font-mono text-slate-500">Pendiente de descargo bancario</p>
          </div>
          <div className="bg-rose-500/10 p-3 rounded-lg text-rose-400">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center justify-between text-left">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block select-none">Apelaciones Activas</span>
            <div className="text-2xl font-black text-amber-500 font-mono mt-1">{pendingAppealsCount} Casos</div>
            <p className="text-[9.5px] font-mono text-amber-400">En revisión del Comité Arbitral</p>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-lg text-amber-400">
            <ShieldAlert size={22} />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center justify-between text-left">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block select-none">Jornadas Totales de Suspensión</span>
            <div className="text-2xl font-black text-slate-200 font-mono mt-1">{activeBansCount} Fechas</div>
            <p className="text-[9.5px] font-mono text-slate-500">Jugadores sancionados inactivos</p>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg text-[#CCFF00]">
            <Gavel size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Suspended Cases + Appeals */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left column: active Appeals list */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4 text-left">
          <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 flex items-center gap-1.5 border-b border-slate-900 pb-3">
             TRIBUNAL DE APELACIONES DE LA FEF / LIGAPRO
          </h3>
          
          <div className="space-y-3">
            {sanctions.filter(s => s.appealDetails).map((appeal) => {
              const status = appeal.appealDetails?.status || "Pendiente";
              
              return (
                <div key={appeal.id} className="bg-slate-900 rounded-xl p-3.5 border border-slate-850">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#CCFF00] font-mono">{appeal.clubName}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      status === "Pendiente" 
                        ? "bg-amber-500/15 text-amber-400" 
                        : status === "Aprobado"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}>
                      {status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-100">{appeal.targetName}</p>
                  <p className="text-[10.5px] text-slate-400 font-sans mt-1 leading-snug">
                     "{appeal.appealDetails?.appellantComment}"
                  </p>

                  <div className="mt-3.5 border-t border-slate-950 pt-3.5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500 text-[9.5px]">Multa: ${appeal.fineUSD} USD</span>
                    {status === "Pendiente" ? (
                      <button 
                        onClick={() => setReviewingSanction(appeal)}
                        className="px-2.5 py-1 bg-slate-950 border border-slate-850 text-[#CCFF00] rounded text-[10px] font-bold hover:bg-slate-900 transition"
                      >
                        Revisar Apelación
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">Resuelto</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Sanciones table */}
        <div className="xl:col-span-2 space-y-4 text-left">
          
          {/* Filters controls */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
              <input 
                type="text" 
                placeholder="Buscar sanciones por nombre u ofensa..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div className="flex items-center space-x-1 w-full sm:w-auto justify-end">
              {["Todos", "Baja", "Media", "Alta", "Crítica"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
                    severityFilter === sev 
                      ? "bg-slate-850 text-slate-100" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

          </div>

          {/* Table display */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden p-4">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 mb-3 block select-none">
              HISTORIAL DE PENALIZACIONES DE LA SEMANA
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-mono text-[9px] uppercase">
                    <th className="py-2.5 px-3">SANCIONADO</th>
                    <th className="py-2.5 px-3">CLUB</th>
                    <th className="py-2.5 px-3">OFENSA / TIPO SANCION</th>
                    <th className="py-2.5 px-3">GRAVEDAD</th>
                    <th className="py-2.5 px-3 font-mono">FECHAS SUSP.</th>
                    <th className="py-2.5 px-3">MULTA USD</th>
                    <th className="py-2.5 px-3 text-right">ESTADO / ACCIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium text-slate-300">
                  {filteredSanctions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/35">
                      <td className="py-3 px-3 font-bold text-slate-200">
                        {s.targetName}
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">{s.targetType}</span>
                      </td>
                      <td className="py-3 px-3 text-[#CCFF00] font-semibold">{s.clubName}</td>
                      <td className="py-3 px-3 font-normal text-slate-400 truncate max-w-[180px]" title={s.offense}>{s.offense}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          s.severity === "Crítica" ? "bg-red-500/10 text-red-500" :
                          s.severity === "Alta" ? "bg-orange-500/10 text-orange-400" :
                          s.severity === "Media" ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {s.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-100">{s.matchesSuspended > 0 ? `${s.matchesSuspended} partidos` : "—"}</td>
                      <td className="py-3 px-3 font-mono text-slate-100">${s.fineUSD.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right">
                        {s.resolved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded">
                            <Check size={11} /> Pago Completo
                          </span>
                        ) : (
                          <button
                            onClick={() => handleResolveSanction(s.id)}
                            className="px-2 py-0.5 bg-slate-900 hover:bg-[#CCFF00] hover:text-slate-950 font-bold border border-slate-800 rounded text-[10px] text-slate-300 transition"
                          >
                            Pagar Multa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

      {/* Emit Sanction Form Modal */}
      {showEmitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleEmitSanctionSubmit} 
            className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-left"
          >
            <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-[#CCFF00] uppercase block">Emisión penal</span>
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                  <Gavel size={16} /> REDACCIÓN DE SUSPENSIÓN & MULTA DISCIPLINARIA
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowEmitModal(false)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              
              {/* Target Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Destinatario</label>
                  <select 
                    value={emitTargetType}
                    onChange={(e) => setEmitTargetType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  >
                    <option value="Jugador">Futbolista / DT</option>
                    <option value="Club">Institución / Club de Fútbol</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Pertenece al Club</label>
                  <select 
                    value={emitClubName}
                    onChange={(e) => setEmitClubName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  >
                    <option value="Barcelona S.C.">Barcelona Sporting Club</option>
                    <option value="L.D.U. Quito">L.D.U. Quito</option>
                    <option value="IDV">Independiente del Valle</option>
                    <option value="C.S. Emelec">C.S. Emelec</option>
                    <option value="El Nacional">El Nacional</option>
                    <option value="S.D. Aucas">S.D. Aucas</option>
                  </select>
                </div>
              </div>

              {/* Target name & severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nombre Completo del Sancionado *</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Jhojan Julio / Club Social" 
                    value={emitTargetName}
                    onChange={(e) => setEmitTargetName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nivel de Gravedad</label>
                  <select 
                    value={emitSeverity}
                    onChange={(e) => setEmitSeverity(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  >
                    <option value="Baja">Baja (Multas leves, tarjetas)</option>
                    <option value="Media">Media (Uso de pirotecnia, demoras)</option>
                    <option value="Alta">Alta (Agresión, falta grave)</option>
                    <option value="Crítica">Crítica (Racismo, incidentes graves)</option>
                  </select>
                </div>
              </div>

              {/* Fines and Suspensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Sanción Económica (Multa USD) *</label>
                  <input 
                    type="number" 
                    min="0"
                    step="50"
                    value={emitFine}
                    onChange={(e) => setEmitFine(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Partidos Suspendidos (Fechas BAN)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="15"
                    value={emitSuspension}
                    disabled={emitTargetType === "Club"}
                    onChange={(e) => setEmitSuspension(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none disabled:bg-slate-950 disabled:text-slate-650"
                  />
                </div>
              </div>

              {/* Comments details */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Descripción Detallada del Informe de Comisaría *</label>
                <textarea 
                  placeholder="Redacte la ofensa exacta que ratificó el referí principal y los artículos infligidos del Código Orgánico Deportivo..."
                  value={emitOffense}
                  onChange={(e) => setEmitOffense(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 p-2 h-20 text-white rounded focus:outline-none resize-none"
                  required
                />
              </div>

            </div>

            <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowEmitModal(false)}
                className="px-4 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-[#CCFF00] text-slate-950 font-extrabold rounded text-xs hover:bg-[#b0dc00] transition"
              >
                Emitir Oficio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Appeal Dialog Modal code */}
      {reviewingSanction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-left">
            <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-[#CCFF00] block">Comité Colegiado Arbitral</span>
                <h4 className="text-sm font-black text-slate-100 uppercase">REVISIÓN DE CASO: {reviewingSanction.targetName}</h4>
              </div>
              <button 
                onClick={() => setReviewingSanction(null)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-300">
              
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850 space-y-2">
                <p className="font-bold text-slate-100 text-xs">Alineación en Conflicto</p>
                <div className="grid grid-cols-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Sanción Inicial:</span>
                    <span className="font-semibold text-slate-300">{reviewingSanction.matchesSuspended} Partidos / ${reviewingSanction.fineUSD} USD</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Club Solicitante:</span>
                    <span className="font-semibold text-[#CCFF00]">{reviewingSanction.clubName}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Informe de Apelación Oficial:</span>
                  <p className="text-[10.5px] italic text-slate-400 mt-1 leading-relaxed">
                    "{reviewingSanction.appealDetails?.appellantComment}"
                  </p>
                </div>
              </div>

              {/* Action comments input */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Comentario Explicativo del Decreto Técnico (Opcional)</label>
                <textarea 
                  placeholder="Justifique legalmente la rebaja o desestimación basándose en el Reglamento de Disciplina..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 p-2 h-16 text-white text-xs rounded focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-center text-xs">
                <button 
                  onClick={() => handleResolveAppeal(reviewingSanction.id, "Rechazado")}
                  className="py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded transition"
                >
                  <X className="inline-block mr-1" size={13} /> Ratificar Sanción (Denegar)
                </button>
                <button 
                  onClick={() => handleResolveAppeal(reviewingSanction.id, "Aprobado")}
                  className="py-1.5 text-xs bg-emerald-500 hover:bg-blue-600 text-slate-950 font-bold rounded transition"
                >
                  <Check className="inline-block mr-1" size={13} /> Conceder Reducción (Rebajar)
                </button>
              </div>

            </div>

            <div className="bg-slate-900 p-3.5 border-t border-slate-800 text-center select-none font-mono text-[9px] text-slate-500">
              *Los dectretos son irrevocables y modifican las planillas de juego.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
