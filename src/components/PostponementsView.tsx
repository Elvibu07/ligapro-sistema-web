import React, { useState } from "react";
import { Clock, AlertTriangle, FileUp, ListChecks, Check, X, ShieldAlert, FileText, Ban } from "lucide-react";
import { Match, Club } from "../types";
import ValidationBlockModal from "./ValidationBlockModal";
import { validatePostponement } from "../lib/validations";
import { logValidationBlock } from "../lib/services/auditLog";
import type { ValidationResult } from "../lib/validations/types";

interface PostponementsViewProps {
  matches: Match[];
  clubs: Club[];
  onMatchesChange: (updatedMatches: Match[]) => void;
  userRole: string;
  postponements?: PostponementRequest[];
  onAddPostponement?: (req: Omit<PostponementRequest, 'id'>) => Promise<PostponementRequest>;
  onUpdatePostponement?: (id: string, updates: Partial<PostponementRequest>) => Promise<PostponementRequest>;
  currentUserEmail?: string;
}

interface PostponementRequest {
  id: string;
  matchId: string;
  originalLabel: string;
  reason: string;
  proposedDate: string;
  proposedTime: string;
  fileName: string;
  status: "Pendiente" | "Aprobado" | "Rechazado";
  dateRequested: string;
}

export default function PostponementsView({ 
  matches, 
  clubs, 
  onMatchesChange, 
  userRole,
  postponements,
  onAddPostponement,
  onUpdatePostponement,
  currentUserEmail = "admin@ligapro.ec"
}: PostponementsViewProps) {
  const [localRequests, setLocalRequests] = useState<PostponementRequest[]>([
    {
      id: "POST-102",
      matchId: "match-3",
      originalLabel: "Aucas vs El Nacional",
      reason: "Copa Libertadores - Desplazamiento Internacional",
      proposedDate: "2026-05-27",
      proposedTime: "19:00",
      fileName: "informe_oficial_conmebol_102.pdf",
      status: "Pendiente",
      dateRequested: "2026-05-21"
    }
  ]);

  const activeRequests = postponements || localRequests;

  // ─── Validation modal state ────────────────────────────────────────────────
  const [validationError, setValidationError] = useState<ValidationResult | null>(null);

  // Form states
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    matches.filter(m => m.status === "Programado")[0]?.id || ""
  );
  const [selectedReason, setSelectedReason] = useState<string>("Compromiso Copa Libertadores / Sudamericana");
  const [proposedDate, setProposedDate] = useState<string>("2026-06-03");
  const [proposedTime, setProposedTime] = useState<string>("16:00");
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // Helper resolvers
  const getClubShortName = (id: string) => {
    return clubs.find(c => c.id === id)?.shortName || id;
  };

  const getMatchLabel = (m: Match) => {
    return `${getClubShortName(m.homeTeamId)} vs ${getClubShortName(m.awayTeamId)} (${m.date})`;
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0].name);
    }
  };

  const simulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId) {
      alert("No hay ningún partido programado seleccionado.");
      return;
    }

    const matchObj = matches.find(m => m.id === selectedMatchId);
    if (!matchObj) return;

    // ─── VALIDACIÓN 2.5 — Postergación (48h/24h) ────────────────────────────
    const validation = validatePostponement(
      matchObj.date,
      matchObj.time,
      proposedDate,
      proposedTime,
      uploadedFile !== ""
    );

    if (!validation.valid) {
      setValidationError(validation);
      logValidationBlock('2.5', 'Postergaciones', currentUserEmail, validation.message, validation.details);
      return;
    }

    const brandNew: PostponementRequest = {
      id: "POST-" + Math.floor(100 + Math.random() * 900),
      matchId: selectedMatchId,
      originalLabel: getMatchLabel(matchObj),
      reason: selectedReason,
      proposedDate: proposedDate,
      proposedTime: proposedTime,
      fileName: uploadedFile,
      status: "Pendiente",
      dateRequested: new Date().toISOString().split("T")[0]
    };

    if (onAddPostponement) {
      const { id, ...reqData } = brandNew;
      onAddPostponement(reqData).catch(err => console.error("Error creating postponement request:", err));
    } else {
      setLocalRequests([brandNew, ...localRequests]);
    }
    setUploadedFile("");
    alert("Solicitud de postergación registrada formalmente en COMET. Evaluando por el tribunal deportivo...");
  };

  const handleResolveRequest = (reqId: string, action: "Aprobado" | "Rechazado") => {
    if (onUpdatePostponement) {
      onUpdatePostponement(reqId, { status: action })
        .then(() => {
          if (action === "Aprobado") {
            const targetReq = activeRequests.find(r => r.id === reqId);
            if (targetReq) {
              const updatedMatches = matches.map(m => {
                if (m.id === targetReq.matchId) {
                  return {
                    ...m,
                    status: "Postergado" as const,
                    date: targetReq.proposedDate,
                    time: targetReq.proposedTime
                  };
                }
                return m;
              });
              onMatchesChange(updatedMatches);
            }
          }
        })
        .catch(err => console.error("Error updating postponement request:", err));
    } else {
      const resolvedReqs = localRequests.map(r => {
        if (r.id === reqId) {
          return { ...r, status: action };
        }
        return r;
      });
      setLocalRequests(resolvedReqs);

      if (action === "Aprobado") {
        const targetReq = activeRequests.find(r => r.id === reqId);
        if (targetReq) {
          const updatedMatches = matches.map(m => {
            if (m.id === targetReq.matchId) {
              return {
                ...m,
                status: "Postergado" as const,
                date: targetReq.proposedDate,
                time: targetReq.proposedTime
              };
            }
            return m;
          });
          onMatchesChange(updatedMatches);
        }
      }
    }
  };

  return (
    <div className="space-y-6 text-left" id="postponements-view-container">
      
      {/* ─── VALIDATION BLOCK MODAL ──────────────────────────────────────────── */}
      <ValidationBlockModal
        validation={validationError}
        onClose={() => setValidationError(null)}
      />

      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="text-[#CCFF00]" size={20} /> Solicitudes de Postergación de Partidos
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Protocolo de reprogramación regulada por coincidencia de torneos CONMEBOL, convocatorias nacionales de Fecha FIFA o fuerza mayor acreditada.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Column: Postponement Registration Form (2/5 size) */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden p-5">
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <span className="text-[9.5px] font-mono text-[#CCFF00] font-bold uppercase tracking-wider block">
              Formulario de Solicitud
            </span>
            <h3 className="text-xs text-slate-300 font-extrabold flex items-center gap-1.5 font-sans">
              <AlertTriangle size={14} className="text-amber-500" /> Registro de Fuerza Mayor (Art. 28)
            </h3>

            {/* Match select */}
            <div>
              <label className="block text-slate-400 font-mono text-[10px] mb-1">Partido a Reprogramar *</label>
              <select 
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-white rounded focus:outline-none"
                required
              >
                {matches.filter(m => m.status === "Programado").map(m => (
                  <option key={m.id} value={m.id}>{getMatchLabel(m)}</option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-slate-400 font-mono text-[10px] mb-1">Causa del Aplazamiento *</label>
              <select 
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-white rounded focus:outline-none"
                required
              >
                <option value="Compromiso Copa Libertadores / Sudamericana">Compromiso Copa Libertadores / Sudamericana</option>
                <option value="Convocatoria Selección Nacional (Fecha FIFA / Máximo 3 citados)">Convocatoria Selección Nacional (Fecha FIFA / Máximo 3 citados)</option>
                <option value="Fuerza Mayor Climática (Inundación, Tormenta Eléctrica)">Fuerza Mayor Climática (Inundación, Tormenta Eléctrica)</option>
                <option value="Garantías de Seguridad / Estado de Excepción">Garantías de Seguridad / Estado de Excepción</option>
              </select>
            </div>

            {/* Proposed Dates & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-mono text-[10px] mb-1">Nueva Fecha Propuesta *</label>
                <input 
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-white rounded focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 font-mono text-[10px] mb-1">Hora Tentativa *</label>
                <input 
                  type="time"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-white rounded focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Drag & Drop File Upload Area */}
            <div>
              <label className="block text-slate-400 font-mono text-[10px] mb-1">Documentación Legal Soporte (Resolución/Oficio COMET) *</label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  isDragging 
                    ? "border-[#CCFF00] bg-slate-900/60" 
                    : uploadedFile 
                    ? "border-emerald-500/50 bg-slate-950/40" 
                    : "border-slate-800 hover:border-slate-700 bg-slate-900/10"
                }`}
              >
                <input 
                  type="file"
                  id="pdf-postpone-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={simulateFileUpload}
                />
                <label htmlFor="pdf-postpone-upload" className="w-full h-full cursor-pointer flex flex-col items-center justify-center">
                  <FileUp size={22} className={uploadedFile ? "text-emerald-400" : "text-slate-450"} />
                  {uploadedFile ? (
                    <div className="mt-2.5">
                      <p className="text-[10px] font-sans font-bold text-emerald-400 leading-tight truncate max-w-[180px]">{uploadedFile}</p>
                      <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5 block">Documento Vinculado Correctamente</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-center">
                      <p className="text-[10px] text-slate-450 leading-tight">Drag & drop o haga Clic para subir PDF</p>
                      <span className="text-[8px] font-mono text-slate-600 block mt-1">Límite 10MB • Obligatorio para avalar</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#CCFF00] text-slate-950 font-extrabold rounded-lg text-xs hover:bg-[#b0dc00] transition duration-200 active:scale-95"
            >
              Registrar Pedido Oficial
            </button>
          </form>
        </div>

        {/* Right Column: Solicitudes History / Approve Table (3/5 size) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 overflow-hidden">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 mb-4 block select-none">
              Historial de Solicitudes de Postergación
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-mono text-[9px] uppercase">
                    <th className="py-3 px-3">SOLICITUD</th>
                    <th className="py-3 px-3">PARTIDO ORIGINAL</th>
                    <th className="py-3 px-3">MOTIVO / RAZÓN</th>
                    <th className="py-3 px-3">NUEVA FECHA</th>
                    <th className="py-3 px-3">DOCUMENTO</th>
                    <th className="py-3 px-3 text-center">ESTADO</th>
                    <th className="py-3 px-3 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-semibold text-slate-300">
                  {activeRequests.map((r) => {
                    let statusBadge = "bg-slate-900 text-slate-400 border border-slate-800";
                    if (r.status === "Aprobado") statusBadge = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                    if (r.status === "Rechazado") statusBadge = "bg-red-500/10 text-red-400 border border-red-500/20";

                    return (
                      <tr key={r.id} className="hover:bg-slate-900/30 transition">
                        <td className="py-4 px-3 font-mono font-bold text-slate-200">{r.id}</td>
                        <td className="py-4 px-3 text-slate-100">{r.originalLabel}</td>
                        <td className="py-4 px-3 font-normal text-slate-400 max-w-[140px] truncate" title={r.reason}>{r.reason}</td>
                        <td className="py-4 px-3 font-mono text-[#CCFF00]">{r.proposedDate} {r.proposedTime}</td>
                        <td className="py-4 px-3 font-normal text-slate-500">
                          <span className="flex items-center gap-1">
                            <FileText size={12} className="text-slate-400" />
                            <span className="truncate max-w-[80px]" title={r.fileName}>{r.fileName}</span>
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono leading-none tracking-tight font-extrabold uppercase ${statusBadge}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          {r.status === "Pendiente" ? (
                            <div className="flex justify-end gap-1.5">
                              {userRole === "Administrador General" ? (
                                <>
                                  <button 
                                    onClick={() => handleResolveRequest(r.id, "Aprobado")}
                                    className="p-1 px-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 duration-200 rounded text-[9px] font-mono uppercase"
                                    title="Aprobar postergación"
                                  >
                                    Aprobar
                                  </button>
                                  <button 
                                    onClick={() => handleResolveRequest(r.id, "Rechazado")}
                                    className="p-1 px-1.5 bg-rose-500/10 text-rose-405 border border-rose-500/20 hover:bg-rose-500 hover:text-slate-950 duration-200 rounded text-[9px] font-mono uppercase"
                                    title="Denegar postergación"
                                  >
                                    Rechazar
                                  </button>
                                </>
                              ) : (
                                <span className="text-[9px] font-mono uppercase text-slate-600 italic">Sólo Admin</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500 select-none">No editable</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3.5 bg-slate-900 rounded-xl border border-slate-850 flex items-center space-x-2.5">
              <ShieldAlert className="text-amber-500 shrink-0" size={18} />
              <div className="text-[11px] font-sans text-slate-400 leading-relaxed">
                <strong>Cláusula de Postergaciones (Art. 28):</strong> Las reprogramaciones autorizadas modifican los relojes globales COMET y requieren justificación dentro del plazo de 48h con desfase máximo de 24h.
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
