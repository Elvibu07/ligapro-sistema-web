import React, { useState } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  ShieldAlert, 
  FileCheck, 
  BookOpen, 
  Calendar, 
  Sparkles, 
  Scale, 
  FileSymlink, 
  UserPlus, 
  User, 
  Trash2, 
  CheckCircle2, 
  XSquare,
  X,
  PlusCircle,
  Hash,
  Eye,
  Award
} from "lucide-react";
import { Club, Player } from "../types";

interface SquadViewProps {
  clubs: Club[];
  players: Player[];
  onPlayersChange: (updatedPlayers: Player[]) => void;
  onAddPlayer?: (player: Omit<Player, 'id'>) => Promise<Player>;
  onUpdatePlayer?: (id: string, updates: Partial<Player>) => Promise<Player>;
  onDeletePlayer?: (id: string) => Promise<void>;
}

export default function SquadView({ clubs, players, onPlayersChange, onAddPlayer, onUpdatePlayer, onDeletePlayer }: SquadViewProps) {
  // Filter states
  const [selectedClubId, setSelectedClubId] = useState<string>("barcelona-sc");
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("Todos");
  
  // Interactive state dialogs
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showInscribeModal, setShowInscribeModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState(1);
  const [newPosition, setNewPosition] = useState<"Arquero" | "Defensa" | "Mediocampista" | "Delantero">("Mediocampista");
  const [newNationality, setNewNationality] = useState("Ecuatoriano");
  const [newBirthDate, setNewBirthDate] = useState("2000-01-01");
  const [newHeight, setNewHeight] = useState("1.80 m");
  const [newWeight, setNewWeight] = useState("75 kg");
  const [newContractUntil, setNewContractUntil] = useState("2026-12");
  
  // Requirement verification checklist
  const [newReqPhoto, setNewReqPhoto] = useState(true);
  const [newReqContract, setNewReqContract] = useState(true);
  const [newReqMedical, setNewReqMedical] = useState(true);
  const [newReqTransfer, setNewReqTransfer] = useState("Aprobado");

  const selectedClub = clubs.find(c => c.id === selectedClubId) || clubs[0];

  const handleInscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
      alert("Por favor escriba el nombre completo del jugador.");
      return;
    }

    const brandNewPlayer: Player = {
      id: "p-" + Date.now(),
      clubId: selectedClubId,
      name: newName,
      number: Number(newNumber),
      position: newPosition,
      nationality: newNationality,
      birthDate: newBirthDate,
      status: "Habilitado", // default with everything signed
      shirtNumber: Number(newNumber),
      matchesPlayed: 0,
      yellowCards: 0,
      redCards: 0,
      goals: 0,
      contractUntil: newContractUntil,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", // representative placeholder
      height: newHeight,
      weight: newWeight,
      documentStatus: {
        photoId: newReqPhoto,
        contractSigned: newReqContract,
        medicalCertificate: newReqMedical,
        transferCertificate: newReqTransfer,
      }
    };

    if (onAddPlayer) {
      const { id, ...playerData } = brandNewPlayer;
      onAddPlayer(playerData).catch(err => console.error("Error creating player:", err));
    } else {
      onPlayersChange([...players, brandNewPlayer]);
    }
    setShowInscribeModal(false);

    // Reset Form
    setNewName("");
    setNewNumber(9);
    setNewNationality("Ecuatoriano");
    setNewBirthDate("2000-01-01");
    setNewHeight("1.80 m");
    setNewWeight("75 kg");
  };

  const handleToggleDocStatus = (player: Player, key: "photoId" | "contractSigned" | "medicalCertificate") => {
    if (onUpdatePlayer) {
      const nextDocs = { ...player.documentStatus, [key]: !player.documentStatus[key] };
      let nextStatus = player.status;
      const allOk = nextDocs.photoId && nextDocs.contractSigned && nextDocs.medicalCertificate;
      const isSuspended = player.redCards > 0 || player.yellowCards >= 5;
      
      if (isSuspended) {
        nextStatus = "Suspendido";
      } else if (!allOk) {
        nextStatus = "Por Habilitar";
      } else {
        nextStatus = "Habilitado";
      }

      onUpdatePlayer(player.id, { documentStatus: nextDocs, status: nextStatus })
        .then(updated => {
          if (selectedPlayer && selectedPlayer.id === player.id) {
            setSelectedPlayer(updated);
          }
        })
        .catch(err => console.error("Error updating player:", err));
    } else {
      const updated = players.map(p => {
        if (p.id === player.id) {
          const nextDocs = { ...p.documentStatus, [key]: !p.documentStatus[key] };
          
          // Reevaluate habilitated label
          let nextStatus = p.status;
          const allOk = nextDocs.photoId && nextDocs.contractSigned && nextDocs.medicalCertificate;
          const isSuspended = p.redCards > 0 || p.yellowCards >= 5;
          
          if (isSuspended) {
            nextStatus = "Suspendido";
          } else if (!allOk) {
            nextStatus = "Por Habilitar";
          } else {
            nextStatus = "Habilitado";
          }

          return { ...p, documentStatus: nextDocs, status: nextStatus };
        }
        return p;
      });
      onPlayersChange(updated);
      if (selectedPlayer && selectedPlayer.id === player.id) {
        setSelectedPlayer(updated.find(p => p.id === player.id) || null);
      }
    }
  };

  const handleDeletePlayer = (playerId: string) => {
    if (window.confirm("¿Seguro de desvincular o revocar registro de este jugador del plantel?")) {
      if (onDeletePlayer) {
        onDeletePlayer(playerId)
          .then(() => {
            setSelectedPlayer(null);
          })
          .catch(err => console.error("Error deleting player:", err));
      } else {
        const updated = players.filter(p => p.id !== playerId);
        onPlayersChange(updated);
        setSelectedPlayer(null);
      }
    }
  };

  // Apply automated bans and document checks dynamically
  const processedPlayers = players.map(p => {
    const isSuspended = p.redCards > 0 || p.yellowCards >= 5;
    const allOk = p.documentStatus.photoId && p.documentStatus.contractSigned && p.documentStatus.medicalCertificate;
    
    let effectiveStatus = p.status;
    if (isSuspended) {
      effectiveStatus = "Suspendido";
    } else if (!allOk) {
      effectiveStatus = "Por Habilitar";
    } else {
      effectiveStatus = "Habilitado";
    }

    return { ...p, status: effectiveStatus as any };
  });

  const currentClubPlayers = processedPlayers.filter(p => p.clubId === selectedClubId);

  const filteredPlayers = currentClubPlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (positionFilter === "Todos") return matchesSearch;
    return matchesSearch && p.position === positionFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-white tracking-tight">Planteles de Fútbol Serie A</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Consola para la inscripción de futbolistas, pasaportes biométricos y auditoría de transferencias TMS / COMET.</p>
        </div>
      </div>

      {/* Selector and Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Ecuador LigaPro Clubs Sidebar Selection */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-[10px] uppercase font-mono text-slate-500 tracking-wider text-left border-b border-slate-900 pb-2">
            Selector de Equipos
          </h3>
          <div className="space-y-1">
            {clubs.map((c) => {
              const activeCount = processedPlayers.filter(p => p.clubId === c.id && p.status === "Habilitado").length;
              const totalCount = processedPlayers.filter(p => p.clubId === c.id).length;
              const isSelected = selectedClubId === c.id;

              return (
                <button
                  key={c.id}
                  id={`club-item-${c.id}`}
                  onClick={() => {
                    setSelectedClubId(c.id);
                    setPositionFilter("Todos");
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left text-xs ${
                    isSelected 
                      ? "bg-slate-900 border border-slate-800 text-white font-semibold" 
                      : "text-slate-400 hover:bg-slate-900/45 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-extrabold text-[9px] text-slate-200 shrink-0">
                      {c.logo}
                    </span>
                    <span className="truncate leading-tight">{c.shortName}</span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-500">
                    {activeCount}/{totalCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Player grid */}
        <div className="lg:col-span-3 space-y-4 text-left">
          
          {/* Filters controls bar */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <span className="text-sm font-black text-slate-200 truncate">
                {selectedClub?.name}
              </span>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                selectedClub?.status === "Habilitado" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"
              }`}>
                {selectedClub?.status}
              </span>
            </div>

            {/* Position and search */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto justify-end">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Filtrar planilla..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-white focus:outline-none"
                />
              </div>

              <select 
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg text-[11px] p-1.5 text-slate-300 w-full sm:w-auto focus:outline-none"
              >
                <option value="Todos">Todas las posiciones</option>
                <option value="Arquero">Arquero</option>
                <option value="Defensa">Defensa</option>
                <option value="Mediocampista">Mediocampista</option>
                <option value="Delantero">Delantero</option>
              </select>
            </div>

          </div>

          {/* Plantel Grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            
            {/* Real players cards */}
            {filteredPlayers.map((player) => {
              return (
                <div 
                  key={player.id} 
                  id={`player-card-${player.id}`}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-2xl overflow-hidden shadow duration-200 flex flex-col justify-between group text-left"
                >
                  
                  {/* Photo & main stats */}
                  <div className="p-4 flex items-center space-x-3.5 relative">
                    <img 
                      src={player.image} 
                      alt={player.name} 
                      className="w-14 h-14 rounded-xl object-cover border border-slate-800" 
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Position and number overlays */}
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-1.5 py-0.5 rounded uppercase">
                          {player.position}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">#{player.number}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-100 text-sm truncate mt-1 group-hover:text-[#CCFF00] transition">
                        {player.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{player.nationality}</p>
                    </div>

                    {/* Status badge */}
                    <span className={`absolute top-4 right-4 rounded-full h-3 w-3 border border-slate-900 shadow-sm ${
                      player.status === "Habilitado" 
                        ? "bg-emerald-500" 
                        : player.status === "Suspendido"
                        ? "bg-red-500 animate-pulse"
                        : "bg-amber-500"
                    }`} title={player.status}></span>
                  </div>

                  {/* Summary items */}
                  <div className="bg-slate-900/60 p-3 text-[11px] font-mono grid grid-cols-3 border-t border-b border-slate-900 border-dashed text-center">
                    <div>
                      <span className="text-slate-500 text-[9px] block">Partidos</span>
                      <span className="text-slate-300 font-bold">{player.matchesPlayed}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9px] block">T. Amarillas</span>
                      <span className="text-slate-300 font-bold text-amber-400">{player.yellowCards}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9px] block">T. Rojas</span>
                      <span className="text-slate-300 font-semibold text-red-500">{player.redCards}</span>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="p-3 bg-slate-950 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-500">Hasta: {player.contractUntil}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setSelectedPlayer(player)}
                        className="px-2.5 py-1 bg-slate-900 text-slate-300 hover:text-white border border-slate-800 rounded font-bold text-[10px] transition"
                      >
                        Ver Perfil
                      </button>
                      <button 
                        onClick={() => handleDeletePlayer(player.id)}
                        className="p-1 hover:text-red-500 text-slate-600 transition"
                        title="Remover deportista"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}

            {/* Simulated register card empty state trigger */}
            <div 
              onClick={() => setShowInscribeModal(true)}
              className="bg-slate-950 border-2 border-dashed border-slate-850 hover:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] hover:translate-y-[-2px] transition-all"
            >
              <UserPlus size={28} className="text-[#CCFF00]" />
              <h4 className="text-slate-300 text-xs font-bold mt-3">Inscribir Deportista</h4>
              <p className="text-[10px] text-slate-500 max-w-[170px] leading-snug mt-1">Habilite un nuevo profesional cargándole los requisitos obligatorios.</p>
            </div>

          </div>

          {filteredPlayers.length === 0 && (
            <div className="bg-slate-950 border border-slate-850 p-12 text-center rounded-2xl font-mono text-xs text-slate-500">
              <Users className="mx-auto mb-3 text-slate-700" size={32} />
              Ningún deportista cargado para la posición o filtro elegidos.
            </div>
          )}

        </div>

      </div>

      {/* Inscribe / Enroll New Player Dialog stepped code */}
      {showInscribeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleInscribeSubmit} 
            className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-left"
          >
            <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-[#CCFF00] uppercase block">Inscribir nuevo jugador</span>
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                  <UserPlus size={16} /> REGISTRO DE PLANILLA / SQUAD EN: {selectedClub.shortName}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowInscribeModal(false)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              
              {/* Name and jersey number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-medium mb-1">Nombre Completo del Deportista *</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Hernán Galíndez" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Número de Camiseta (#) *</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="99"
                    value={newNumber}
                    onChange={(e) => setNewNumber(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Position and attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Posición de Juego</label>
                  <select 
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  >
                    <option value="Arquero">Arquero</option>
                    <option value="Defensa">Defensa</option>
                    <option value="Mediocampista">Mediocampista</option>
                    <option value="Delantero">Delantero</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#CCFF00] font-medium mb-1">Estatura (Metros)</label>
                  <input 
                    type="text" 
                    placeholder="1.84 m" 
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Peso (kg)</label>
                  <input 
                    type="text" 
                    placeholder="79 kg" 
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contrato Vigente</label>
                  <input 
                    type="text" 
                    placeholder="2027-12" 
                    value={newContractUntil}
                    onChange={(e) => setNewContractUntil(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nacionalidad / Pasaporte</label>
                  <input 
                    type="text" 
                    placeholder="Ecuatoriano" 
                    value={newNationality}
                    onChange={(e) => setNewNationality(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha de Nacimiento</label>
                  <input 
                    type="date" 
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  />
                </div>
              </div>

              {/* Stepped requirement validation checklist */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 text-left space-y-3">
                <span className="text-[10px] font-mono text-[#CCFF00] font-bold uppercase tracking-wider block">
                  Pasaporte Biométrico & Credenciales Obligatorias
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newReqPhoto}
                      onChange={(e) => setNewReqPhoto(e.target.checked)}
                      className="bg-slate-950 border border-slate-800 text-[#CCFF00] rounded"
                    />
                    <span>Foto Registro</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newReqContract}
                      onChange={(e) => setNewReqContract(e.target.checked)}
                      className="bg-slate-950 border border-slate-800 text-[#CCFF00] rounded"
                    />
                    <span>Contrato Firmado</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newReqMedical}
                      onChange={(e) => setNewReqMedical(e.target.checked)}
                      className="bg-slate-950 border border-slate-800 text-[#CCFF00] rounded"
                    />
                    <span>Ficha Médica</span>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-950">
                  <label className="block text-slate-400 font-medium mb-1">Certificación TMS de Transferencia Internacional (Si Aplica)</label>
                  <select
                    value={newReqTransfer}
                    onChange={(e) => setNewReqTransfer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2 text-slate-300 rounded focus:outline-none text-[10px] font-mono"
                  >
                    <option value="Aprobado">Aprobado / No requiere (Pase Local)</option>
                    <option value="Pendiente">Pendiente de Certificado (ITC Internacional)</option>
                    <option value="N/A">Bajo revisión legal COMET</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowInscribeModal(false)}
                className="px-4 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-[#CCFF00] text-slate-950 font-extrabold rounded text-xs hover:bg-[#b0dc00] transition"
              >
                Inscribir Deportista
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Player Detailed Profile popup Dialog (Matching Javier Burrai profile views) */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-left">
            
            {/* Header info */}
            <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-left">
                <img 
                  src={selectedPlayer.image} 
                  alt={selectedPlayer.name} 
                  className="w-12 h-12 rounded-xl object-cover border border-slate-800" 
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[9px] font-mono text-[#CCFF00] uppercase block">Pasaporte del Deportista LigaPro</span>
                  <p className="text-base font-black text-slate-100">{selectedPlayer.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-300 overflow-y-auto max-h-[75vh]">
              
              {/* Stats and characteristics row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850 text-center flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Número</span>
                  <div className="text-3xl font-black text-slate-200 my-1 font-mono">#{selectedPlayer.number}</div>
                  <span className="text-[9.5px] font-mono text-[#CCFF00] uppercase font-bold">{selectedPlayer.position}</span>
                </div>
                
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850 text-center flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Tarjetas</span>
                  <div className="flex justify-center items-center space-x-4 my-2.5">
                    <div className="flex items-center space-x-1">
                      <div className="w-3.5 h-5 bg-amber-400 rounded-sm shadow border border-amber-300"></div>
                      <span className="font-bold text-slate-300 text-sm">{selectedPlayer.yellowCards}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3.5 h-5 bg-red-600 rounded-sm shadow border border-red-400"></div>
                      <span className="font-bold text-slate-300 text-sm">{selectedPlayer.redCards}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Suspendido: {selectedPlayer.status === "Suspendido" ? "SÍ" : "NO"}</span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850 text-center flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Goles Marcados</span>
                  <div className="text-3xl font-black text-slate-200 my-1 font-mono">{selectedPlayer.goals}</div>
                  <span className="text-[9.5px] font-mono text-slate-500 uppercase">{selectedPlayer.matchesPlayed} Partidos</span>
                </div>
              </div>

              {/* Bio specifics and physical metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-1.5 font-bold">
                    Ficha de Atributos Físicos
                  </span>
                  
                  <div className="flex justify-between p-2 bg-slate-900/40 rounded">
                    <span className="text-slate-500">Nacionalidad:</span>
                    <span className="font-mono text-slate-200">{selectedPlayer.nationality}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-900/40 rounded">
                    <span className="text-slate-500">Nacimiento (Edad):</span>
                    <span className="font-mono text-slate-300">{selectedPlayer.birthDate}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-900/40 rounded">
                    <span className="text-slate-500">Estatura / Peso:</span>
                    <span className="font-mono text-slate-300">{selectedPlayer.height} / {selectedPlayer.weight}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-900 pb-1.5 font-bold">
                    Contratos & Transferencias
                  </span>
                  
                  <div className="flex justify-between p-2 bg-slate-900/40 rounded">
                    <span className="text-slate-500">Vencimiento del Contrato:</span>
                    <span className="font-mono text-[#CCFF00] font-semibold">{selectedPlayer.contractUntil}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-900/40 rounded">
                    <span className="text-slate-500">Garantía TMS:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedPlayer.documentStatus.transferCertificate}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-900/40 rounded">
                    <span className="text-slate-500">Estado de Inscripción:</span>
                    <span className="font-mono text-slate-300">{selectedPlayer.status}</span>
                  </div>
                </div>

              </div>

              {/* Requirement credentials toggle checklists */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 mt-4 text-left">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1 font-bold">
                  Auditoría Pasaporte Técnico (Precedente)
                </span>
                <p className="text-[10px] text-slate-400 mb-3">Haga click en cada sello para alternar/auditar la correspondencia contractual.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <button 
                    onClick={() => handleToggleDocStatus(selectedPlayer, "photoId")}
                    className={`flex items-center space-x-2 p-2 bg-slate-950 rounded border transition text-left ${
                      selectedPlayer.documentStatus.photoId ? "text-emerald-400 border-emerald-500/20" : "text-slate-500 border-slate-900"
                    }`}
                  >
                    <CheckCircle2 size={14} className={selectedPlayer.documentStatus.photoId ? "text-emerald-500" : "text-slate-700"} />
                    <div className="truncate">
                      <p className="font-bold">1. Foto ID Registro</p>
                      <span className="text-[8px] text-slate-500 uppercase">{selectedPlayer.documentStatus.photoId ? "COMPLETADO" : "FALTA"}</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleToggleDocStatus(selectedPlayer, "contractSigned")}
                    className={`flex items-center space-x-2 p-2 bg-slate-950 rounded border transition text-left ${
                      selectedPlayer.documentStatus.contractSigned ? "text-emerald-400 border-emerald-500/20" : "text-slate-500 border-slate-900"
                    }`}
                  >
                    <CheckCircle2 size={14} className={selectedPlayer.documentStatus.contractSigned ? "text-emerald-500" : "text-slate-700"} />
                    <div className="truncate">
                      <p className="font-bold">2. Contrato Firmado</p>
                      <span className="text-[8px] text-slate-500 uppercase">{selectedPlayer.documentStatus.contractSigned ? "VÁLIDO" : "NO FIRMADO"}</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleToggleDocStatus(selectedPlayer, "medicalCertificate")}
                    className={`flex items-center space-x-2 p-2 bg-slate-950 rounded border transition text-left ${
                      selectedPlayer.documentStatus.medicalCertificate ? "text-emerald-400 border-emerald-500/20" : "text-slate-500 border-slate-900"
                    }`}
                  >
                    <CheckCircle2 size={14} className={selectedPlayer.documentStatus.medicalCertificate ? "text-emerald-500" : "text-slate-700"} />
                    <div className="truncate">
                      <p className="font-bold">3. Examen Médico</p>
                      <span className="text-[8px] text-slate-500 uppercase">{selectedPlayer.documentStatus.medicalCertificate ? "CERTIFICADO" : "EXPIRADO"}</span>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            <div className="bg-slate-900 px-5 py-3.5 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>FIFA COMET ID: LIGAPRO-A-{selectedPlayer.id.toUpperCase()}</span>
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="px-3 py-1 bg-slate-950 text-slate-300 rounded font-semibold border border-slate-800 hover:text-white"
              >
                Cerrar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
