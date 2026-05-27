import React, { useState, useRef } from "react";
import { FileSpreadsheet, Users, FileCheck, CheckCircle2, ShieldAlert, Award, Star, Signature, Trash2, Plus, Sparkles, Hash, AlertTriangle, ShieldCheck } from "lucide-react";
import { Match, Club, Player } from "../types";

interface MatchSheetsViewProps {
  matches: Match[];
  clubs: Club[];
  players: Player[];
}

interface SubmittedSheet {
  id: string;
  matchLabel: string;
  clubName: string;
  dtName: string;
  playersCount: number;
  dateCreated: string;
  status: "Firmado" | "En Revisión" | "Habilitado";
  cryptographicHash?: string;
}

export default function MatchSheetsView({ matches, clubs, players }: MatchSheetsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"recientes" | "construccion" | "fina-validacion">("construccion");

  // State of submitted sheets
  const [submittedSheets, setSubmittedSheets] = useState<SubmittedSheet[]>([
    {
      id: "SHEET-501",
      matchLabel: "Barcelona S.C. vs L.D.U. Quito",
      clubName: "Barcelona S.C.",
      dtName: "Segundo Alejandro Castillo",
      playersCount: 18,
      dateCreated: "2026-05-22",
      status: "Habilitado",
      cryptographicHash: "0x7a81bfae8281f9a2b99cef812d8a57e3240ee005"
    }
  ]);

  // Interactive sheet-building states
  const [selectedMatchId, setSelectedMatchId] = useState<string>("match-1");
  const [selectedClubId, setSelectedClubId] = useState<string>("barcelona-sc");

  // Roster arrays
  const [starters, setStarters] = useState<Player[]>([]);
  const [benched, setBenched] = useState<Player[]>([]);

  // Signature canvas simulation state
  const [dtNameForm, setDtNameForm] = useState("Segundo Alejandro Castillo");
  const [isSigned, setIsSigned] = useState(false);
  const [generatedHash, setGeneratedHash] = useState("");

  // Signature Drawing Track
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper resolvers
  const activeMatch = matches.find(m => m.id === selectedMatchId) || matches[0];
  const activeClub = clubs.find(c => c.id === selectedClubId) || clubs[0];

  // Fetch available players from the active club excluding those already assigned
  const availableClubPlayers = players.filter(
    p => p.clubId === selectedClubId && 
    !starters.some(s => s.id === p.id) && 
    !benched.some(b => b.id === p.id)
  );

  const handleAddPlayer = (player: Player, target: "starter" | "bench") => {
    if (target === "starter") {
      if (starters.length >= 11) {
        alert("Máximo permitido de 11 jugadores titulares.");
        return;
      }
      setStarters([...starters, player]);
    } else {
      if (benched.length >= 7) {
        alert("Máximo permitido de 7 jugadores suplentes.");
        return;
      }
      setBenched([...benched, player]);
    }
  };

  const handleRemovePlayer = (id: string, from: "starter" | "bench") => {
    if (from === "starter") {
      setStarters(starters.filter(p => p.id !== id));
    } else {
      setBenched(benched.filter(p => p.id !== id));
    }
  };

  // Rule Warnings
  const hasGoalkeeper = starters.some(p => p.position === "Arquero");
  const hasSuspendedPlayer = starters.some(p => p.status === "Suspendido") || benched.some(p => p.status === "Suspendido");
  const suspendedNames = [...starters, ...benched]
    .filter(p => p.status === "Suspendido")
    .map(p => p.name);

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
    
    // Get mouse coordinates
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
    if (!isSigned) {
      alert("Por favor trace la firma digital antes de guardar.");
      return;
    }
    const seed = dtNameForm + starters.length + Date.now();
    // Simulate generation of dynamic sha256 hash
    let hash = "0x7a81";
    for (let i = 0; i < 8; i++) {
      hash += Math.floor(Math.random() * 16).toString(16);
    }
    hash += "ae8281f9a2b99cef812d8a57e3240ee00a";
    setGeneratedHash(hash);

    // Save Submitted Sheet
    const newSheet: SubmittedSheet = {
      id: "SHEET-" + Math.floor(500 + Math.random() * 100),
      matchLabel: `${getClubShortName(activeMatch.homeTeamId)} vs ${getClubShortName(activeMatch.awayTeamId)}`,
      clubName: activeClub.shortName,
      dtName: dtNameForm,
      playersCount: starters.length + benched.length,
      dateCreated: new Date().toISOString().split("T")[0],
      status: "Firmado",
      cryptographicHash: hash
    };

    setSubmittedSheets([newSheet, ...submittedSheets]);

    window.dispatchEvent(new CustomEvent('ligapro-notification', {
      detail: {
        text: `Planilla COMET firmada para ${newSheet.clubName} en ${newSheet.matchLabel}`,
        type: "planillas",
        view: "planillas"
      }
    }));

    alert("Planilla de juego validada y firmada digitalmente con éxito.");
  };

  const getClubShortName = (id: string) => {
    return clubs.find(c => c.id === id)?.shortName || id;
  };

  return (
    <div className="space-y-6 text-left" id="match-sheets-view-container">
      
      {/* View Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="text-[#CCFF00]" size={20} /> Gestión de Planillas de Juego COMET
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Consola integrada de selección de nóminas oficiales, validación biométrica de sanciones pendientes y firma digital encriptada para cuerpos técnicos.
        </p>
      </div>

      {/* Tabs list inside screen */}
      <div className="flex border-b border-slate-850 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("construccion")}
          className={`px-4 py-2 text-xs font-bold transition whitespace-nowrap rounded-t-lg border-b-2 ${
            activeSubTab === "construccion" 
              ? "border-[#CCFF00] bg-slate-900/60 text-[#CCFF00]" 
              : "border-transparent text-slate-405 hover:text-slate-200"
          }`}
        >
          1. Construcción de Planilla (Mockup 6)
        </button>
        <button
          onClick={() => setActiveSubTab("fina-validacion")}
          className={`px-4 py-2 text-xs font-bold transition whitespace-nowrap rounded-t-lg border-b-2 ${
            activeSubTab === "fina-validacion" 
              ? "border-[#CCFF00] bg-slate-900/60 text-[#CCFF00]" 
              : "border-transparent text-slate-405 hover:text-slate-200"
          }`}
        >
          2. Validación de Nómina y Firma (Mockup 5)
        </button>
        <button
          onClick={() => setActiveSubTab("recientes")}
          className={`px-4 py-2 text-xs font-bold transition whitespace-nowrap rounded-t-lg border-b-2 ${
            activeSubTab === "recientes" 
              ? "border-[#CCFF00] bg-slate-900/60 text-[#CCFF00]" 
              : "border-transparent text-slate-405 hover:text-slate-200"
          }`}
        >
          3. Planillas Recientes Auditadas (Mockup 2)
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeSubTab === "construccion" && (
        <div className="space-y-6">
          
          {/* Pick Match and Club context bar */}
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
                    Round {m.round}: {getClubShortName(m.homeTeamId)} vs {getClubShortName(m.awayTeamId)} ({m.date})
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

          {/* SQUAD BUILDER WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* COLUMN 1: AVAILABLE PLAYERS */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-left">
              <div className="border-b border-slate-900 pb-2 mb-3">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Planilla Activa</span>
                <h4 className="text-xs font-black text-slate-200">Futbolistas Inscritos Habilitados</h4>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {availableClubPlayers.map((player) => {
                  const isSuspended = player.status === "Suspendido";
                  
                  return (
                    <div 
                      key={player.id} 
                      className={`p-2 rounded-xl flex items-center justify-between transition ${
                        isSuspended ? "bg-red-500/5 border border-red-500/10" : "bg-slate-900/50 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <img 
                          src={player.image} 
                          alt={player.name} 
                          className="w-8 h-8 rounded object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-bold leading-tight truncate ${isSuspended ? "text-red-400" : "text-slate-200"}`}>
                            {player.name}
                          </p>
                          <span className="text-[9px] font-mono text-slate-500 block uppercase mt-0.5">#{player.number} • {player.position}</span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        {isSuspended ? (
                          <span className="text-[8px] font-mono font-bold uppercase text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle size={10} /> SANCIONADO
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAddPlayer(player, "starter")}
                              className="px-1.5 py-1 bg-slate-950 hover:bg-[#CCFF00] hover:text-slate-950 rounded text-[9px] font-mono font-bold transition"
                              title="Asignar como Inicialista"
                            >
                              + TIT
                            </button>
                            <button
                              onClick={() => handleAddPlayer(player, "bench")}
                              className="px-1.5 py-1 bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 rounded text-[9px] font-mono font-bold transition"
                              title="Asignar Suplente"
                            >
                              + SUP
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2 & 3: STARTERS & BENCH */}
            <div className="lg:col-span-2 space-y-4 text-left">
              
              {/* Warnings and errors rules bento */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                <span className="text-[9px] font-mono text-slate-500 block mb-2 uppercase">Validaciones en Tiempo Real COMET</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Starter Limit check */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-mono font-black ${
                      starters.length === 11 ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-400 border border-slate-800"
                    }`}>
                      {starters.length === 11 ? "✓" : starters.length}
                    </span>
                    <span className="text-[11px] font-bold text-slate-350">Titulares (11)</span>
                  </div>

                  {/* Goalkeeper assigned check */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      hasGoalkeeper ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-400 border border-slate-800"
                    }`}>
                      {hasGoalkeeper ? "✓" : "!"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-350">Arquero Seleccionado</span>
                  </div>

                  {/* Suspended Players Alerts */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      !hasSuspendedPlayer ? "bg-emerald-500 text-slate-950" : "bg-red-500 text-slate-950 animate-bounce"
                    }`}>
                      {!hasSuspendedPlayer ? "✓" : "!"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-350">Libre de Sanciados</span>
                  </div>

                </div>

                {hasSuspendedPlayer && (
                  <div className="mt-3.5 p-2 bg-red-950/40 border border-red-500/20 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={16} />
                    <p className="text-[10px] text-red-400">
                      <strong>¡Falta de Elegibilidad!</strong> El deportista {suspendedNames.join(", ")} arrastra sanciones activas y no puede ser alineado legalmente.
                    </p>
                  </div>
                )}
              </div>

              {/* Grid: Starters (Left) vs Suplentes (Right) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Starter Nomina Box */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl min-h-[300px]">
                  <div className="border-b border-slate-900 pb-2 mb-3 select-none flex justify-between items-center">
                    <span className="text-xs font-black text-slate-250 flex items-center gap-1">
                      <Star size={12} className="text-[#CCFF00]" /> Formación Titular ({starters.length}/11)
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">Máx 11</span>
                  </div>

                  <div className="space-y-1.5">
                    {starters.map(p => (
                      <div key={p.id} className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 truncate">{p.name} <span className="text-[10px] font-mono font-normal text-slate-450">({p.position})</span></span>
                        <button 
                          onClick={() => handleRemovePlayer(p.id, "starter")}
                          className="p-1 text-slate-500 hover:text-red-500 transition duration-150"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {starters.length === 0 && (
                      <p className="text-slate-600 font-mono text-[10px] text-center pt-12">Por favor, asigne inicialistas desde el plantel disponible.</p>
                    )}
                  </div>
                </div>

                {/* Suplentes Nomina Box */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl min-h-[300px]">
                  <div className="border-b border-slate-900 pb-2 mb-3 select-none flex justify-between items-center">
                    <span className="text-xs font-black text-slate-250 flex items-center gap-1">
                      <Award size={12} className="text-cyan-400" /> Suplentes ({benched.length}/7)
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">Máx 7</span>
                  </div>

                  <div className="space-y-1.5">
                    {benched.map(p => (
                      <div key={p.id} className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 truncate">{p.name} <span className="text-[10px] font-mono font-normal text-slate-450">({p.position})</span></span>
                        <button 
                          onClick={() => handleRemovePlayer(p.id, "bench")}
                          className="p-1 text-slate-500 hover:text-red-500 transition duration-150"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {benched.length === 0 && (
                      <p className="text-slate-600 font-mono text-[10px] text-center pt-12">Por favor, asigne suplentes alternos.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Progress to step 2 trigger button */}
              <div className="flex justify-end pt-2">
                <button
                  disabled={starters.length === 0}
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

      {activeSubTab === "fina-validacion" && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            
            {/* Left: Validation summary list (2/5 size) */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
              <span className="text-[9.5px] font-mono text-[#CCFF00] font-bold uppercase tracking-wider block">
                Paso Final: Validación de Nómina
              </span>
              <h3 className="text-xs text-slate-200 font-extrabold flex items-center gap-1.5 leading-none">
                <ShieldCheck size={14} className="text-[#CCFF00]" /> Check de Elegibilidad Biométrica
              </h3>

              <div className="space-y-3 pt-2 text-xs">
                
                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                  <span className="text-slate-400">Total Jugadores Convocados:</span>
                  <span className="font-mono font-bold text-slate-200">{starters.length + benched.length} Deportistas</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-8c0">
                  <span className="text-slate-400">Línea de Arquero Registrado:</span>
                  <span className={`font-semibold ${hasGoalkeeper ? "text-emerald-400" : "text-amber-500"}`}>
                    {hasGoalkeeper ? "Cumple ✓" : "Advertencia: Sin portero"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                  <span className="text-slate-400">Control Disciplinario Comet FEF:</span>
                  <span className={`font-semibold ${!hasSuspendedPlayer ? "text-emerald-400" : "text-red-500"}`}>
                    {!hasSuspendedPlayer ? "Aprobado ✓" : "Inhabilidad Legal Detectada"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                  <span className="text-slate-400">Seguro e Inspecciones Médicas:</span>
                  <span className="text-emerald-400 font-semibold">100% Certificados Vigentes ✓</span>
                </div>

              </div>
              
              {/* Starters summary bullets print */}
              <div className="pt-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Nómina Titular Elegida:</span>
                <p className="text-[10.5px] text-slate-400 leading-relaxed font-mono">
                  {starters.map(p => `#${p.number} ${p.name}`).join(", ") || "No se han asignado titulares."}
                </p>
              </div>
            </div>

            {/* Right: Signature canvas board pad (3/5 size) -- MOCKUP 5 */}
            <div className="lg:col-span-3 bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
              <span className="text-[9px] font-mono text-slate-500 uppercase block select-none">
                Autorización Digital Regulada - COMET FEF
              </span>
              <h3 className="text-xs text-slate-250 font-extrabold flex items-center gap-1 font-sans">
                <Signature size={15} /> Firma Digital del Director Técnico
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] mb-1">Director Técnico Firmante (Responsable de Planilla) *</label>
                  <input 
                    type="text"
                    value={dtNameForm}
                    onChange={(e) => setDtNameForm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-slate-200 rounded focus:outline-none"
                    placeholder="Segundo Alejandro Castillo"
                  />
                </div>

                {/* Canvas Signature Workspace frame */}
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
                  <button 
                    type="button"
                    onClick={clearCanvas}
                    className="p-1 px-3.5 bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 text-[10px] text-slate-350 transition font-bold"
                  >
                    Borrar Firma
                  </button>

                  <button 
                    type="button"
                    disabled={!isSigned}
                    onClick={generateCryptographicSignature}
                    className="px-5 py-2 bg-[#CCFF00] text-slate-950 hover:bg-[#b0dc00] transition disabled:opacity-30 text-xs font-black rounded-lg"
                  >
                    Estampar Sello y Generar Acta COMET
                  </button>
                </div>

                {/* Cryptographic Hash block print if generated */}
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

      {activeSubTab === "recientes" && (
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 overflow-hidden">
          <span className="text-[9.5px] font-mono text-[#CCFF00] font-bold uppercase tracking-wider block mb-1">
            Management Portal
          </span>
          <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 mb-4 border-b border-slate-900 pb-3">
            Planillas de Juego Recientes (Mockup 2)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-mono text-[9px] uppercase">
                  <th className="py-3 px-3">ID PLANILLA</th>
                  <th className="py-3 px-3">PARTIDO OFICIAL</th>
                  <th className="py-3 px-3">CLUB EMISOR</th>
                  <th className="py-3 px-3">DIRECTOR TÉCNICO FIRMANTE</th>
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
                    <td className="py-4 px-3 font-mono text-center text-slate-300">{s.playersCount} Jugadores</td>
                    <td className="py-4 px-3 text-center font-mono text-[9px] text-slate-500 max-w-[120px] truncate" title={s.cryptographicHash}>
                      {s.cryptographicHash || "Conexión manual"}
                    </td>
                    <td className="py-4 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase ${
                        s.status === "Habilitado" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
