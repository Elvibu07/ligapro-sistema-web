import React, { useState, useRef } from "react";
import { 
  FileSpreadsheet, Users, FileCheck, CheckCircle2, ShieldAlert, Award, Star, Signature, 
  Trash2, Plus, Sparkles, Hash, AlertTriangle, ShieldCheck, UserCog, Activity, ArrowRightLeft 
} from "lucide-react";
import { Match, Club, Player, ClubStaff } from "../types";
import ValidationBlockModal from "./ValidationBlockModal";
import {
  validateMinimumPlayers,
  validateMaximumPlayers,
  validateMaximumStaff,
  validateSheetDeliveryTime,
  validateDTSignature,
  validateSubstitutionLimit,
  validateSubstitutionMoments,
  validatePlayerNotSubstituted,
} from "../lib/validations";
import { logValidationBlock } from "../lib/services/auditLog";
import type { ValidationResult } from "../lib/validations/types";

interface MatchSheetsViewProps {
  matches: Match[];
  clubs: Club[];
  players: Player[];
  currentUserEmail?: string;
}

interface SubmittedSheet {
  id: string;
  matchId: string;
  matchLabel: string;
  clubId: string;
  clubName: string;
  dtName: string;
  playersCount: number;
  staffCount: number;
  dateCreated: string;
  status: "Firmado" | "En Revisión" | "Habilitado";
  cryptographicHash?: string;
  starters: Player[];
  benched: Player[];
  substitutions: SubstitutionEvent[];
}

interface SubstitutionEvent {
  id: string;
  playerOutId: string;
  playerOutName: string;
  playerInId: string;
  playerInName: string;
  momentIndex: number;
  minute: number;
}

// ─── Mock Staff Data (until DB migration runs) ─────────────────────────────
const MOCK_CLUB_STAFF: Record<string, ClubStaff[]> = {
  "barcelona-sc": [
    { id: "staff-1", clubId: "barcelona-sc", name: "Dr. Roberto Medina", role: "Médico", status: "Activo" },
    { id: "staff-2", clubId: "barcelona-sc", name: "Segundo Alejandro Castillo", role: "Director Técnico", status: "Activo" },
    { id: "staff-21", clubId: "barcelona-sc", name: "Orlando Wellington", role: "Asistente", status: "Activo" },
    { id: "staff-22", clubId: "barcelona-sc", name: "Rubén Valenzuela", role: "Preparador Físico", status: "Activo" },
  ],
  "ldu-quito": [
    { id: "staff-3", clubId: "ldu-quito", name: "Dr. Luis Ramírez", role: "Médico", status: "Activo" },
    { id: "staff-4", clubId: "ldu-quito", name: "Pablo Marini", role: "Director Técnico", status: "Activo" },
  ],
};

export default function MatchSheetsView({ matches, clubs, players, currentUserEmail = "admin@ligapro.ec" }: MatchSheetsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"construccion" | "fina-validacion" | "recientes" | "sustituciones">("construccion");

  // State of submitted sheets
  const [submittedSheets, setSubmittedSheets] = useState<SubmittedSheet[]>([]);

  // Interactive sheet-building states
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || "");
  const [selectedClubId, setSelectedClubId] = useState<string>("barcelona-sc");

  // Roster arrays
  const [starters, setStarters] = useState<Player[]>([]);
  const [benched, setBenched] = useState<Player[]>([]);
  const [staffList, setStaffList] = useState<ClubStaff[]>([]);

  // Signature canvas simulation state
  const [dtNameForm, setDtNameForm] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [generatedHash, setGeneratedHash] = useState("");

  // Signature Drawing Track
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ─── Validation modal state ────────────────────────────────────────────────
  const [validationError, setValidationError] = useState<ValidationResult | null>(null);

  // Substitution Live View State
  const [subSelectedSheetId, setSubSelectedSheetId] = useState<string>("");
  const [subPlayerOutId, setSubPlayerOutId] = useState<string>("");
  const [subPlayerInId, setSubPlayerInId] = useState<string>("");
  const [subMomentIndex, setSubMomentIndex] = useState<number>(1);
  const [subMinute, setSubMinute] = useState<string>("45");

  // Helper resolvers
  const activeMatch = matches.find(m => m.id === selectedMatchId) || matches[0];
  const activeClub = clubs.find(c => c.id === selectedClubId) || clubs[0];

  const availableClubPlayers = players.filter(
    p => p.clubId === selectedClubId && 
    !starters.some(s => s.id === p.id) && 
    !benched.some(b => b.id === p.id)
  );

  const availableClubStaff = (MOCK_CLUB_STAFF[selectedClubId] || []).filter(
    s => !staffList.some(ls => ls.id === s.id)
  );

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleAddPlayer = (player: Player, target: "starter" | "bench") => {
    // VALIDACIÓN 3.2 — Máximo 23 jugadores
    const maxVal = validateMaximumPlayers(starters.length + benched.length + 1);
    if (!maxVal.valid) {
      setValidationError(maxVal);
      logValidationBlock('3.2', 'Planillas', currentUserEmail, maxVal.message, { current: starters.length + benched.length });
      return;
    }

    if (target === "starter") {
      if (starters.length >= 11) {
        setValidationError({
          valid: false,
          ruleCode: '3.2',
          message: 'Máximo permitido de 11 jugadores titulares.'
        });
        return;
      }
      setStarters([...starters, player]);
    } else {
      // 12 suplentes máximo en LigaPro (11 titulares + 12 = 23 total)
      if (benched.length >= 12) {
        setValidationError({
          valid: false,
          ruleCode: '3.2',
          message: 'Máximo permitido de 12 suplentes.'
        });
        return;
      }
      setBenched([...benched, player]);
    }
  };

  const handleAddStaff = (staff: ClubStaff) => {
    // VALIDACIÓN 3.3 — Máximo 10 staff
    const maxStaffVal = validateMaximumStaff(staffList.length + 1);
    if (!maxStaffVal.valid) {
      setValidationError(maxStaffVal);
      logValidationBlock('3.3', 'Planillas', currentUserEmail, maxStaffVal.message, { staffCount: staffList.length });
      return;
    }
    setStaffList([...staffList, staff]);
    
    // Auto-fill DT signature name if DT added
    if (staff.role === 'Director Técnico' && !dtNameForm) {
      setDtNameForm(staff.name);
    }
  };

  const handleRemovePlayer = (id: string, from: "starter" | "bench") => {
    if (from === "starter") setStarters(starters.filter(p => p.id !== id));
    else setBenched(benched.filter(p => p.id !== id));
  };

  const handleRemoveStaff = (id: string) => {
    setStaffList(staffList.filter(s => s.id !== id));
  };

  // Rule Warnings Live
  const hasGoalkeeper = starters.some(p => p.position === "Arquero");
  const hasSuspendedPlayer = starters.some(p => p.status === "Suspendido") || benched.some(p => p.status === "Suspendido");
  const suspendedNames = [...starters, ...benched].filter(p => p.status === "Suspendido").map(p => p.name);

  // Signature Canvas Helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setIsSigned(true);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
    setGeneratedHash("");
  };

  const generateCryptographicSignature = () => {
    // VALIDACIÓN 3.1 — Mínimo 7 jugadores
    const minPlayersVal = validateMinimumPlayers(starters.length);
    if (!minPlayersVal.valid) {
      setValidationError(minPlayersVal);
      logValidationBlock('3.1', 'Planillas', currentUserEmail, minPlayersVal.message, { starters: starters.length });
      return;
    }

    // VALIDACIÓN 3.4 — 70 Minutos de anticipación
    if (activeMatch) {
      const timeVal = validateSheetDeliveryTime(activeMatch.date, activeMatch.time);
      if (!timeVal.valid) {
        setValidationError(timeVal);
        logValidationBlock('3.4', 'Planillas', currentUserEmail, timeVal.message, timeVal.details);
        return; // This could be a soft warning depending on strictness, but we block here as per rules
      }
    }

    // VALIDACIÓN 3.5 — Firma DT
    const signVal = validateDTSignature(dtNameForm, isSigned);
    if (!signVal.valid) {
      setValidationError(signVal);
      logValidationBlock('3.5', 'Planillas', currentUserEmail, signVal.message);
      return;
    }

    const seed = dtNameForm + starters.length + Date.now();
    let hash = "0x7a81";
    for (let i = 0; i < 8; i++) {
      hash += Math.floor(Math.random() * 16).toString(16);
    }
    hash += "ae8281f9a2b99cef812d8a57e3240ee00a";
    setGeneratedHash(hash);

    const newSheet: SubmittedSheet = {
      id: "SHEET-" + Math.floor(500 + Math.random() * 100),
      matchId: activeMatch.id,
      matchLabel: `${getClubShortName(activeMatch.homeTeamId)} vs ${getClubShortName(activeMatch.awayTeamId)}`,
      clubId: activeClub.id,
      clubName: activeClub.shortName,
      dtName: dtNameForm,
      playersCount: starters.length + benched.length,
      staffCount: staffList.length,
      dateCreated: new Date().toISOString().split("T")[0],
      status: "Firmado",
      cryptographicHash: hash,
      starters: [...starters],
      benched: [...benched],
      substitutions: []
    };

    setSubmittedSheets([newSheet, ...submittedSheets]);

    window.dispatchEvent(new CustomEvent('ligapro-notification', {
      detail: { text: `Planilla COMET firmada para ${newSheet.clubName}`, type: "planillas", view: "planillas" }
    }));

    alert("Planilla de juego validada y firmada digitalmente con éxito.");
  };

  // ─── SUBSTITUTIONS LIVE MATCH HANDLER ──────────────────────────────────────
  const handleRegisterSubstitution = (e: React.FormEvent) => {
    e.preventDefault();
    const sheetIndex = submittedSheets.findIndex(s => s.id === subSelectedSheetId);
    if (sheetIndex === -1) return;
    
    const sheet = submittedSheets[sheetIndex];

    if (!subPlayerOutId || !subPlayerInId) {
      alert("Seleccione al jugador que sale y al que ingresa.");
      return;
    }

    // VALIDACIÓN 3.6 — Máximo 5 sustituciones
    const maxSubVal = validateSubstitutionLimit(sheet.substitutions.length);
    if (!maxSubVal.valid) {
      setValidationError(maxSubVal);
      logValidationBlock('3.6', 'Planillas', currentUserEmail, maxSubVal.message);
      return;
    }

    // Calcular momentos usados hasta ahora
    const momentsUsed = new Set(sheet.substitutions.map(s => s.momentIndex)).size;
    const isNewMoment = !sheet.substitutions.some(s => s.momentIndex === subMomentIndex);

    // VALIDACIÓN 3.6b — Máximo 3 momentos (si este es un momento nuevo, verificamos)
    if (isNewMoment) {
      const maxMomentsVal = validateSubstitutionMoments(momentsUsed);
      if (!maxMomentsVal.valid) {
        setValidationError(maxMomentsVal);
        logValidationBlock('3.6', 'Planillas', currentUserEmail, maxMomentsVal.message);
        return;
      }
    }

    // VALIDACIÓN 3.7 — Jugador que ingresa no puede haber sido sustituido antes
    const previouslySubstitutedIds = sheet.substitutions.map(s => s.playerOutId);
    const playerInName = sheet.benched.find(p => p.id === subPlayerInId)?.name || subPlayerInId;
    
    const notSubbedVal = validatePlayerNotSubstituted(subPlayerInId, playerInName, previouslySubstitutedIds);
    if (!notSubbedVal.valid) {
      setValidationError(notSubbedVal);
      logValidationBlock('3.7', 'Planillas', currentUserEmail, notSubbedVal.message, { playerInId: subPlayerInId });
      return;
    }

    // Apply substitution
    const updatedSheet = { ...sheet };
    const playerOutName = [...sheet.starters, ...sheet.benched].find(p => p.id === subPlayerOutId)?.name || subPlayerOutId;

    updatedSheet.substitutions.push({
      id: "SUB-" + Date.now(),
      playerOutId: subPlayerOutId,
      playerOutName,
      playerInId: subPlayerInId,
      playerInName,
      momentIndex: subMomentIndex,
      minute: parseInt(subMinute) || 0
    });

    // Update roster theoretically (in memory for UI display limits)
    // Remove playerOut from active starters/field, put in playerIn
    const newSubmittedSheets = [...submittedSheets];
    newSubmittedSheets[sheetIndex] = updatedSheet;
    setSubmittedSheets(newSubmittedSheets);

    setSubPlayerOutId("");
    setSubPlayerInId("");
    alert("Cambio registrado exitosamente en COMET.");
  };

  const getClubShortName = (id: string) => clubs.find(c => c.id === id)?.shortName || id;

  const activeSubSheet = submittedSheets.find(s => s.id === subSelectedSheetId);

  return (
    <div className="space-y-6 text-left" id="match-sheets-view-container">
      
      {/* ─── VALIDATION BLOCK MODAL ──────────────────────────────────────────── */}
      <ValidationBlockModal
        validation={validationError}
        onClose={() => setValidationError(null)}
      />

      {/* View Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="text-[#CCFF00]" size={20} /> Gestión de Planillas de Juego COMET
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Consola integrada de selección de nóminas oficiales, control de sustituciones en vivo, validación de reglas 3.1 a 3.7 y firmas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-850 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("construccion")}
          className={`px-4 py-2 text-xs font-bold transition whitespace-nowrap rounded-t-lg border-b-2 ${
            activeSubTab === "construccion" ? "border-[#CCFF00] bg-slate-900/60 text-[#CCFF00]" : "border-transparent text-slate-405 hover:text-slate-200"
          }`}
        >
          1. Construcción Nómina
        </button>
        <button
          onClick={() => setActiveSubTab("fina-validacion")}
          className={`px-4 py-2 text-xs font-bold transition whitespace-nowrap rounded-t-lg border-b-2 ${
            activeSubTab === "fina-validacion" ? "border-[#CCFF00] bg-slate-900/60 text-[#CCFF00]" : "border-transparent text-slate-405 hover:text-slate-200"
          }`}
        >
          2. Validación y Firma
        </button>
        <button
          onClick={() => setActiveSubTab("recientes")}
          className={`px-4 py-2 text-xs font-bold transition whitespace-nowrap rounded-t-lg border-b-2 ${
            activeSubTab === "recientes" ? "border-[#CCFF00] bg-slate-900/60 text-[#CCFF00]" : "border-transparent text-slate-405 hover:text-slate-200"
          }`}
        >
          3. Planillas Auditadas
        </button>
        <button
          onClick={() => setActiveSubTab("sustituciones")}
          className={`px-4 py-2 text-xs font-bold transition whitespace-nowrap rounded-t-lg border-b-2 flex items-center gap-1.5 ${
            activeSubTab === "sustituciones" ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-transparent text-slate-405 hover:text-amber-200"
          }`}
        >
          <Activity size={14} /> 4. Control Sustituciones
        </button>
      </div>

      {/* ─── TAB 1: CONSTRUCCIÓN ────────────────────────────────────────────── */}
      {activeSubTab === "construccion" && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-mono text-[9px] uppercase mb-1">Paso 1: Seleccione el Partido Oficial</label>
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-white rounded focus:none"
              >
                {matches.map(m => (
                  <option key={m.id} value={m.id}>
                    Round {m.round}: {getClubShortName(m.homeTeamId)} vs {getClubShortName(m.awayTeamId)} ({m.date} {m.time})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-mono text-[9px] uppercase mb-1">Paso 2: Construir Nómina para Club</label>
              <select
                value={selectedClubId}
                onChange={(e) => {
                  setSelectedClubId(e.target.value);
                  setStarters([]);
                  setBenched([]);
                  setStaffList([]);
                }}
                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-white rounded focus:none"
              >
                <option value="barcelona-sc">Barcelona Sporting Club</option>
                <option value="ldu-quito">Liga Deportiva Universitaria</option>
                <option value="ind-valle">Independiente del Valle</option>
                <option value="emelec">Club Sport Emelec</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            
            {/* COLUMN 1: AVAILABLE ROSTER */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-left xl:col-span-1">
              <div className="border-b border-slate-900 pb-2 mb-3">
                <span className="text-[9px] font-mono text-[#CCFF00] uppercase font-bold tracking-wider">Planilla Activa</span>
                <h4 className="text-xs font-black text-slate-200">Deportistas Habilitados</h4>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 mb-4">
                {availableClubPlayers.map((player) => {
                  const isSuspended = player.status === "Suspendido";
                  return (
                    <div key={player.id} className={`p-2 rounded-xl flex items-center justify-between transition ${isSuspended ? "bg-red-500/5 border border-red-500/10" : "bg-slate-900/50 hover:bg-slate-900"}`}>
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <img src={player.image} alt={player.name} className="w-8 h-8 rounded object-cover" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <p className={`text-xs font-bold leading-tight truncate max-w-[100px] ${isSuspended ? "text-red-400" : "text-slate-200"}`}>{player.name}</p>
                          <span className="text-[9px] font-mono text-slate-500 block uppercase mt-0.5">#{player.number} • {player.position}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {isSuspended ? (
                          <span className="text-[8px] font-mono font-bold uppercase text-red-500 bg-red-500/10 px-1 py-0.5 rounded flex items-center justify-center">SANCIONADO</span>
                        ) : (
                          <>
                            <button onClick={() => handleAddPlayer(player, "starter")} className="px-1.5 py-1 bg-slate-950 hover:bg-[#CCFF00] hover:text-slate-950 rounded text-[8px] font-mono font-bold transition">+ TITULAR</button>
                            <button onClick={() => handleAddPlayer(player, "bench")} className="px-1.5 py-1 bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 rounded text-[8px] font-mono font-bold transition">+ SUPLENTE</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-b border-slate-900 pb-2 mb-3">
                <h4 className="text-xs font-black text-slate-200">Cuerpo Técnico (Staff)</h4>
              </div>
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {availableClubStaff.map(staff => (
                  <div key={staff.id} className="p-2 rounded-xl bg-slate-900/50 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200 truncate">{staff.name}</p>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{staff.role}</span>
                    </div>
                    <button onClick={() => handleAddStaff(staff)} className="px-1.5 py-1 bg-slate-950 hover:bg-fuchsia-500 hover:text-white rounded text-[8px] font-mono font-bold transition">+ STAFF</button>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2,3,4: BUILDER */}
            <div className="xl:col-span-3 space-y-4 text-left">
              
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                <span className="text-[9px] font-mono text-slate-500 block mb-2 uppercase">Validaciones en Tiempo Real COMET (Reglas 3.1 - 3.3)</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${starters.length === 11 ? "bg-emerald-500 text-slate-950" : starters.length >= 7 ? "bg-amber-500 text-slate-950" : "bg-red-500 text-white"}`}>
                      {starters.length}
                    </span>
                    <span className="text-[11px] font-bold text-slate-350" title="Mínimo 7 para iniciar (Art. 47)">Titulares (Min 7)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${benched.length <= 12 ? "bg-emerald-500 text-slate-950" : "bg-red-500 text-white"}`}>
                      {benched.length}
                    </span>
                    <span className="text-[11px] font-bold text-slate-350" title="Máximo 12 suplentes (Art. 45)">Suplentes (Max 12)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${staffList.length <= 10 ? "bg-emerald-500 text-slate-950" : "bg-red-500 text-white"}`}>
                      {staffList.length}
                    </span>
                    <span className="text-[11px] font-bold text-slate-350" title="Máximo 10 personas de staff">Staff (Max 10)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${hasGoalkeeper ? "bg-emerald-500 text-slate-950" : "bg-amber-500 text-slate-950"}`}>
                      {hasGoalkeeper ? "✓" : "!"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-350">Arquero</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* TITULARES */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl min-h-[300px]">
                  <div className="border-b border-slate-900 pb-2 mb-3 select-none flex justify-between items-center">
                    <span className="text-xs font-black text-slate-250 flex items-center gap-1"><Star size={12} className="text-[#CCFF00]" /> Titulares ({starters.length}/11)</span>
                  </div>
                  <div className="space-y-1.5">
                    {starters.map(p => (
                      <div key={p.id} className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-200 truncate max-w-[120px]">{p.name} <span className="text-[9px] font-mono font-normal text-slate-450">({p.position})</span></span>
                        <button onClick={() => handleRemovePlayer(p.id, "starter")} className="p-1 text-slate-500 hover:text-red-500 transition"><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* SUPLENTES */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl min-h-[300px]">
                  <div className="border-b border-slate-900 pb-2 mb-3 select-none flex justify-between items-center">
                    <span className="text-xs font-black text-slate-250 flex items-center gap-1"><Award size={12} className="text-cyan-400" /> Suplentes ({benched.length}/12)</span>
                  </div>
                  <div className="space-y-1.5">
                    {benched.map(p => (
                      <div key={p.id} className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-200 truncate max-w-[120px]">{p.name} <span className="text-[9px] font-mono font-normal text-slate-450">({p.position})</span></span>
                        <button onClick={() => handleRemovePlayer(p.id, "bench")} className="p-1 text-slate-500 hover:text-red-500 transition"><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* STAFF */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl min-h-[300px]">
                  <div className="border-b border-slate-900 pb-2 mb-3 select-none flex justify-between items-center">
                    <span className="text-xs font-black text-slate-250 flex items-center gap-1"><UserCog size={12} className="text-fuchsia-400" /> Banca Staff ({staffList.length}/10)</span>
                  </div>
                  <div className="space-y-1.5">
                    {staffList.map(s => (
                      <div key={s.id} className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-200 truncate max-w-[120px]">{s.name} <span className="text-[9px] font-mono font-normal text-fuchsia-400">({s.role})</span></span>
                        <button onClick={() => handleRemoveStaff(s.id)} className="p-1 text-slate-500 hover:text-red-500 transition"><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  disabled={starters.length < 7} // Allow proceeding if min 7 (Rule 3.1 preview)
                  onClick={() => setActiveSubTab("fina-validacion")}
                  className="px-5 py-2 bg-[#CCFF00] hover:bg-[#b0dc00] transition disabled:opacity-30 text-slate-950 font-extrabold rounded-lg text-xs"
                >
                  Continuar a Validación y Firma →
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: FIRMA Y VALIDACIÓN ──────────────────────────────────────── */}
      {activeSubTab === "fina-validacion" && (
        <div className="space-y-6 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            
            <div className="lg:col-span-2 bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
              <span className="text-[9.5px] font-mono text-[#CCFF00] font-bold uppercase tracking-wider block">Paso Final</span>
              <h3 className="text-xs text-slate-200 font-extrabold flex items-center gap-1.5 leading-none">
                <ShieldCheck size={14} className="text-[#CCFF00]" /> Check de Elegibilidad Biométrica
              </h3>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                  <span className="text-slate-400">Total Jugadores Convocados:</span>
                  <span className={`font-mono font-bold ${starters.length + benched.length > 23 ? 'text-red-500' : 'text-slate-200'}`}>
                    {starters.length + benched.length} / 23 Max
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                  <span className="text-slate-400">Total Staff Autorizado:</span>
                  <span className={`font-mono font-bold ${staffList.length > 10 ? 'text-red-500' : 'text-slate-200'}`}>
                    {staffList.length} / 10 Max
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                  <span className="text-slate-400">Control Disciplinario Comet FEF:</span>
                  <span className={`font-semibold ${!hasSuspendedPlayer ? "text-emerald-400" : "text-red-500"}`}>
                    {!hasSuspendedPlayer ? "Aprobado ✓" : "Inhabilidad Legal"}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
              <span className="text-[9px] font-mono text-slate-500 uppercase block select-none">
                Autorización Digital Regulada - COMET FEF (Art. 45)
              </span>
              <h3 className="text-xs text-slate-250 font-extrabold flex items-center gap-1 font-sans">
                <Signature size={15} /> Firma Digital del Director Técnico Obligatoria
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] mb-1">Director Técnico Firmante (Responsable de Planilla) *</label>
                  <input 
                    type="text"
                    value={dtNameForm}
                    onChange={(e) => setDtNameForm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-slate-200 rounded focus:outline-none"
                    placeholder="E.g. Segundo Alejandro Castillo"
                  />
                </div>

                <div>
                  <span className="block text-slate-400 font-mono text-[10px] mb-1">Firme con el cursor sobre el recuadro negro *</span>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-1">
                    <canvas 
                      ref={canvasRef}
                      width={450}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={drawSignature}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full h-32 bg-slate-950 border border-dashed border-slate-900 rounded-lg cursor-crosshair"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button type="button" onClick={clearCanvas} className="p-1 px-3.5 bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 text-[10px] text-slate-350 transition font-bold">
                    Borrar Firma
                  </button>
                  <button 
                    type="button"
                    onClick={generateCryptographicSignature}
                    className="px-5 py-2 bg-[#CCFF00] text-slate-950 hover:bg-[#b0dc00] transition text-xs font-black rounded-lg"
                  >
                    Validar Normas y Estampar Sello COMET
                  </button>
                </div>

                {generatedHash && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="text-emerald-500" size={16} />
                      <span className="text-[10px] font-mono text-emerald-400 font-black">NÓNIMA FIRMADA Y CRIPTOGRÁFICAMENTE ASEGURADA</span>
                    </div>
                    <div className="mt-2 text-[9px] font-mono text-slate-400 flex items-center gap-1 select-all">
                      <Hash size={10} /> {generatedHash}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: RECIENTES ───────────────────────────────────────────────── */}
      {activeSubTab === "recientes" && (
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 overflow-hidden">
          <span className="text-[9.5px] font-mono text-[#CCFF00] font-bold uppercase tracking-wider block mb-1">
            Management Portal
          </span>
          <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 mb-4 border-b border-slate-900 pb-3">
            Planillas de Juego Recientes
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-mono text-[9px] uppercase">
                  <th className="py-3 px-3">ID PLANILLA</th>
                  <th className="py-3 px-3">PARTIDO OFICIAL</th>
                  <th className="py-3 px-3">CLUB EMISOR</th>
                  <th className="py-3 px-3">DT FIRMANTE</th>
                  <th className="py-3 px-3">CONVOCADOS</th>
                  <th className="py-3 px-3 text-center">SELLO DIGITAL / HASH</th>
                  <th className="py-3 px-3 text-right">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 font-semibold text-slate-300">
                {submittedSheets.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/30 transition">
                    <td className="py-4 px-3 font-mono font-bold text-slate-100">{s.id}</td>
                    <td className="py-4 px-3 text-slate-100 font-black">{s.matchLabel}</td>
                    <td className="py-4 px-3 text-[#CCFF00]">{s.clubName}</td>
                    <td className="py-4 px-3 text-slate-400">{s.dtName}</td>
                    <td className="py-4 px-3 font-mono text-center text-slate-300">{s.playersCount} Jug. / {s.staffCount} Staff</td>
                    <td className="py-4 px-3 text-center font-mono text-[9px] text-slate-500 max-w-[120px] truncate" title={s.cryptographicHash}>
                      {s.cryptographicHash || "Conexión manual"}
                    </td>
                    <td className="py-4 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {submittedSheets.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-6 text-slate-500">No hay planillas firmadas en esta sesión.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: SUSTITUCIONES ───────────────────────────────────────────── */}
      {activeSubTab === "sustituciones" && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 overflow-hidden">
            
            <div className="flex justify-between items-start border-b border-slate-900 pb-4 mb-4">
              <div>
                <span className="text-[9.5px] font-mono text-amber-500 font-bold uppercase tracking-wider block mb-1">
                  Control de Árbitro / 4to Oficial
                </span>
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                  <ArrowRightLeft size={16} /> Panel de Sustituciones en Vivo (Art. 3.6 / 3.7)
                </h3>
              </div>
              <div className="w-1/3">
                <select
                  value={subSelectedSheetId}
                  onChange={(e) => setSubSelectedSheetId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-white rounded focus:none"
                >
                  <option value="">-- Seleccione Planilla Firmada --</option>
                  {submittedSheets.map(s => (
                    <option key={s.id} value={s.id}>{s.clubName} ({s.matchLabel})</option>
                  ))}
                </select>
              </div>
            </div>

            {activeSubSheet ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Formulario de sustitución */}
                <form onSubmit={handleRegisterSubstitution} className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl space-y-4 text-xs">
                  <h4 className="font-bold text-slate-200">Registrar Cambio Oficial</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono text-[9px]">Sale (Titular/Cancha) 🔴</label>
                      <select 
                        required value={subPlayerOutId} onChange={e => setSubPlayerOutId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-white rounded"
                      >
                        <option value="">-- Seleccione --</option>
                        {activeSubSheet.starters.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                        {/* Incluir jugadores que entraron previamente para que puedan volver a salir */}
                        {activeSubSheet.substitutions.map(sub => (
                          <option key={`in-${sub.playerInId}`} value={sub.playerInId}>[Ingresado] {sub.playerInName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono text-[9px]">Ingresa (Suplente) 🟢</label>
                      <select 
                        required value={subPlayerInId} onChange={e => setSubPlayerInId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-white rounded"
                      >
                        <option value="">-- Seleccione --</option>
                        {activeSubSheet.benched.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono text-[9px]">Momento / Ventana (1-3) *</label>
                      <select 
                        required value={subMomentIndex} onChange={e => setSubMomentIndex(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-white rounded"
                      >
                        <option value="1">Ventana 1</option>
                        <option value="2">Ventana 2</option>
                        <option value="3">Ventana 3</option>
                        <option value="4">Entretiempo (No cuenta como ventana)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono text-[9px]">Minuto de Juego *</label>
                      <input 
                        type="number" required min="1" max="120"
                        value={subMinute} onChange={e => setSubMinute(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-white rounded font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition">
                      Validar Reglas y Ejecutar Cambio
                    </button>
                  </div>
                </form>

                {/* Historial de Cambios e Indicadores */}
                <div className="space-y-4">
                  
                  {/* Indicadores */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-center">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Cambios Realizados</span>
                      <span className="text-xl font-black text-slate-200">{activeSubSheet.substitutions.length} <span className="text-sm text-slate-500 font-normal">/ 5</span></span>
                    </div>
                    <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-center">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Ventanas Usadas</span>
                      <span className="text-xl font-black text-slate-200">
                        {new Set(activeSubSheet.substitutions.map(s => s.momentIndex).filter(m => m !== 4)).size} <span className="text-sm text-slate-500 font-normal">/ 3</span>
                      </span>
                    </div>
                  </div>

                  {/* Tabla Historial */}
                  <div className="bg-slate-900 border border-slate-850 rounded-lg overflow-hidden text-xs">
                    <div className="bg-slate-950 p-2 border-b border-slate-800 text-[9px] font-mono uppercase text-slate-500 font-bold">Historial de Sustituciones</div>
                    <div className="max-h-[180px] overflow-y-auto p-2 space-y-1.5">
                      {activeSubSheet.substitutions.map((sub, idx) => (
                        <div key={sub.id} className="flex items-center justify-between p-2 bg-slate-950 border border-slate-850 rounded">
                          <span className="font-mono text-slate-500 text-[10px]">#{idx+1} | Min {sub.minute}</span>
                          <div className="flex flex-col flex-1 mx-3 text-right pr-3 border-r border-slate-800">
                            <span className="text-red-400 font-bold flex items-center justify-end gap-1"><ArrowRightLeft size={10} className="rotate-180" /> Sale: {sub.playerOutName}</span>
                          </div>
                          <div className="flex flex-col flex-1 pl-1 text-left">
                            <span className="text-emerald-400 font-bold flex items-center gap-1"><ArrowRightLeft size={10} /> Entra: {sub.playerInName}</span>
                          </div>
                        </div>
                      ))}
                      {activeSubSheet.substitutions.length === 0 && (
                        <div className="p-4 text-center text-slate-500 font-mono text-[10px]">No se han registrado sustituciones.</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Seleccione una planilla firmada para habilitar el control de sustituciones en vivo.
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}
