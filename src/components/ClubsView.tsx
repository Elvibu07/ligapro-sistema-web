import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Building2, 
  Globe, 
  Mail, 
  User, 
  CheckSquare, 
  AlertCircle, 
  Clock, 
  Check, 
  X, 
  FileText, 
  Trash2,
  Calendar,
  Sparkles,
  Stethoscope,
  GraduationCap,
  DollarSign,
  ShieldAlert
} from "lucide-react";
import { Club, ClubStatus, ClubStaff, ClubEconomicApproval, Sanction } from "../types";
import ValidationBlockModal from "./ValidationBlockModal";
import {
  validateClubHasMedico,
  validateClubHasDT,
  validateClubEconomicApproval,
  validateClubNoActiveSanction,
  validateClubMinPlayers,
} from "../lib/validations";
import { logValidationBlock } from "../lib/services/auditLog";
import type { ValidationResult } from "../lib/validations/types";

interface ClubsViewProps {
  clubs: Club[];
  onClubsChange: (updatedClubs: Club[]) => void;
  onAddClub?: (club: Omit<Club, 'id' | 'squadCount'>) => Promise<Club>;
  onUpdateClub?: (id: string, updates: Partial<Club>) => Promise<Club>;
  onDeleteClub?: (id: string) => Promise<void>;
  sanctions?: Sanction[];
  players?: any[];
  currentUserEmail?: string;
}

// ─── Mock data for club staff & economic approvals (simulated until Supabase table is seeded) ─
const INITIAL_CLUB_STAFF: Record<string, ClubStaff[]> = {
  "barcelona-sc": [
    { id: "staff-1", clubId: "barcelona-sc", name: "Dr. Roberto Medina", role: "Médico", status: "Activo" },
    { id: "staff-2", clubId: "barcelona-sc", name: "Segundo Alejandro Castillo", role: "Director Técnico", status: "Activo" },
  ],
  "ldu-quito": [
    { id: "staff-3", clubId: "ldu-quito", name: "Dr. Luis Ramírez", role: "Médico", status: "Activo" },
    { id: "staff-4", clubId: "ldu-quito", name: "Pablo Marini", role: "Director Técnico", status: "Activo" },
  ],
  "ind-valle": [
    { id: "staff-5", clubId: "ind-valle", name: "Dr. Felipe Suárez", role: "Médico", status: "Activo" },
    { id: "staff-6", clubId: "ind-valle", name: "Martín Anselmi", role: "Director Técnico", status: "Activo" },
  ],
  "emelec": [
    { id: "staff-7", clubId: "emelec", name: "Dr. Jorge Meza", role: "Médico", status: "Activo" },
    // No DT — will trigger validation 1.2
  ],
  "el-nacional": [
    // No medico and no DT — will trigger validations 1.1 and 1.2
  ],
  "aucas": [
    { id: "staff-10", clubId: "aucas", name: "Dr. Carlos Villacís", role: "Médico", status: "Activo" },
    { id: "staff-11", clubId: "aucas", name: "Armando Osma", role: "Director Técnico", status: "Activo" },
  ],
};

const INITIAL_ECONOMIC_APPROVALS: Record<string, ClubEconomicApproval> = {
  "barcelona-sc": { id: "eco-1", clubId: "barcelona-sc", approved: true, approvedBy: "Dir. Control Económico", approvedDate: "2026-01-15", season: "2026" },
  "ldu-quito": { id: "eco-2", clubId: "ldu-quito", approved: true, approvedBy: "Dir. Control Económico", approvedDate: "2026-01-20", season: "2026" },
  "ind-valle": { id: "eco-3", clubId: "ind-valle", approved: true, approvedBy: "Dir. Control Económico", approvedDate: "2026-02-01", season: "2026" },
  "emelec": { id: "eco-4", clubId: "emelec", approved: false, approvedBy: "", approvedDate: "", season: "2026" },
  "el-nacional": { id: "eco-5", clubId: "el-nacional", approved: false, approvedBy: "", approvedDate: "", season: "2026" },
  "aucas": { id: "eco-6", clubId: "aucas", approved: true, approvedBy: "Dir. Control Económico", approvedDate: "2026-01-25", season: "2026" },
};

export default function ClubsView({ clubs, onClubsChange, onAddClub, onUpdateClub, onDeleteClub, sanctions = [], players = [], currentUserEmail = "admin@ligapro.ec" }: ClubsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [auditedClub, setAuditedClub] = useState<Club | null>(null);

  // Local state to simulate staff and economic additions
  const [localStaff, setLocalStaff] = useState<Record<string, ClubStaff[]>>(INITIAL_CLUB_STAFF);
  const [localEconomy, setLocalEconomy] = useState<Record<string, ClubEconomicApproval>>(INITIAL_ECONOMIC_APPROVALS);

  // ─── Validation modal state ────────────────────────────────────────────────
  const [validationError, setValidationError] = useState<ValidationResult | null>(null);

  // Form State for New Club
  const [newName, setNewName] = useState("");
  const [newShortName, setNewShortName] = useState("");
  const [newCity, setNewCity] = useState("Guayaquil");
  const [newStadium, setNewStadium] = useState("");
  const [newFounded, setNewFounded] = useState("1920-01-01");
  const [newRepresentative, setNewRepresentative] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDocEstatutos, setNewDocEstatutos] = useState(false);
  const [newDocSolvencia, setNewDocSolvencia] = useState(false);
  const [newDocMinisterio, setNewDocMinisterio] = useState(false);
  const [newDocLigaPro, setNewDocLigaPro] = useState(false);

  // Edit Form States inside detailed modal
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editShortName, setEditShortName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editStadium, setEditStadium] = useState("");
  const [editFounded, setEditFounded] = useState("");
  const [editRepresentative, setEditRepresentative] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const startEditing = () => {
    if (!auditedClub) return;
    setEditName(auditedClub.name);
    setEditShortName(auditedClub.shortName);
    setEditCity(auditedClub.city);
    setEditStadium(auditedClub.stadium || "");
    setEditFounded(auditedClub.founded || "");
    setEditRepresentative(auditedClub.legalRepresentative || "");
    setEditEmail(auditedClub.contactEmail || "");
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditedClub) return;
    if (!editName || !editShortName || !editStadium || !editRepresentative) {
      alert("Por favor rellene los campos obligatorios (*).");
      return;
    }

    const updates: Partial<Club> = {
      name: editName,
      shortName: editShortName,
      city: editCity,
      stadium: editStadium,
      founded: editFounded,
      legalRepresentative: editRepresentative,
      contactEmail: editEmail
    };

    if (onUpdateClub) {
      try {
        const updated = await onUpdateClub(auditedClub.id, updates);
        setAuditedClub(updated);
        setIsEditing(false);
      } catch (err: any) {
        alert(`Error al actualizar club en Supabase: ${err.message}`);
      }
    } else {
      const updated = clubs.map(club => {
        if (club.id === auditedClub.id) {
          return { ...club, ...updates };
        }
        return club;
      });
      onClubsChange(updated);
      setAuditedClub({ ...auditedClub, ...updates });
      setIsEditing(false);
    }
  };

  const handleAddStaff = (clubId: string, role: 'Médico' | 'Director Técnico') => {
    const name = window.prompt(`Ingrese el nombre completo del ${role}:`);
    if (name && name.trim().length > 0) {
      setLocalStaff(prev => ({
        ...prev,
        [clubId]: [
          ...(prev[clubId] || []).filter(s => s.role !== role),
          { id: `staff-${Date.now()}`, clubId, name: name.trim(), role, status: 'Activo' }
        ]
      }));
    }
  };

  const handleApproveEconomy = (clubId: string) => {
    if (window.confirm('¿Confirma la validación y aprobación del control económico para este club?')) {
      setLocalEconomy(prev => ({
        ...prev,
        [clubId]: {
          id: `eco-${Date.now()}`,
          clubId,
          approved: true,
          approvedBy: currentUserEmail || 'Admin',
          approvedDate: new Date().toISOString().split('T')[0],
          season: '2026'
        }
      }));
    }
  };

  // Counts
  const totalCount = clubs.length;
  const enabledCount = clubs.filter(c => c.status === "Habilitado").length;
  const observedCount = clubs.filter(c => c.status === "Observado").length;
  const pendingCount = clubs.filter(c => c.status === "Pendiente").length;

  /**
   * ─── VALIDACIONES 1.1, 1.2, 1.3, 1.4 — Habilitación de Club ─────────────
   * Se ejecutan antes de cambiar el estado a "Habilitado".
   */
  const runClubEnableValidations = (clubId: string, clubName: string): boolean => {
    const staff = localStaff[clubId] || [];
    const economicApproval = localEconomy[clubId] || null;

    // 1.1 — Médico obligatorio
    const medicoResult = validateClubHasMedico(staff);
    if (!medicoResult.valid) {
      setValidationError(medicoResult);
      logValidationBlock('1.1', 'Clubes', currentUserEmail, medicoResult.message, { clubId, clubName });
      return false;
    }

    // 1.2 — DT obligatorio
    const dtResult = validateClubHasDT(staff);
    if (!dtResult.valid) {
      setValidationError(dtResult);
      logValidationBlock('1.2', 'Clubes', currentUserEmail, dtResult.message, { clubId, clubName });
      return false;
    }

    // 1.3 — Aprobación económica
    const ecoResult = validateClubEconomicApproval(economicApproval);
    if (!ecoResult.valid) {
      setValidationError(ecoResult);
      logValidationBlock('1.3', 'Clubes', currentUserEmail, ecoResult.message, { clubId, clubName });
      return false;
    }

    // 1.4 — Sanción activa
    const sanctionResult = validateClubNoActiveSanction(sanctions, clubName);
    if (!sanctionResult.valid) {
      setValidationError(sanctionResult);
      logValidationBlock('1.4', 'Clubes', currentUserEmail, sanctionResult.message, { clubId, clubName });
      return false;
    }

    // 1.6 — Mínimo de 7 jugadores
    const minPlayersResult = validateClubMinPlayers(clubId, players);
    if (!minPlayersResult.valid) {
      setValidationError(minPlayersResult);
      logValidationBlock('1.6', 'Clubes', currentUserEmail, minPlayersResult.message, { clubId, clubName });
      return false;
    }

    return true;
  };

  const handleToggleDoc = async (clubId: string, docKey: "estatutos" | "solvencia" | "ministerioDeporte" | "registroLigaPro") => {
    const targetClub = clubs.find(c => c.id === clubId);
    if (!targetClub) return;

    const docStatus = { ...targetClub.legalDocStatus, [docKey]: !targetClub.legalDocStatus[docKey] };
    
    // Dynamic re-evaluator of overall authorization label
    let newStatus: ClubStatus = targetClub.status;
    const allChecked = docStatus.estatutos && docStatus.solvencia && docStatus.ministerioDeporte && docStatus.registroLigaPro;
    
    if (allChecked) {
      // ─── Run LIGAPRO validations before auto-enabling ─────────────────────
      if (!runClubEnableValidations(clubId, targetClub.name)) {
        // Validations failed — still update docs but don't auto-enable
        newStatus = "Observado";
      } else {
        newStatus = "Habilitado";
      }
    } else if (docStatus.estatutos && docStatus.ministerioDeporte) {
      newStatus = "Observado";
    } else {
      newStatus = "Pendiente";
    }

    if (onUpdateClub) {
      try {
        const updated = await onUpdateClub(clubId, { legalDocStatus: docStatus, status: newStatus });
        if (auditedClub && auditedClub.id === clubId) {
          setAuditedClub(updated);
        }
      } catch (err) {
        console.error("Error updating documents in Supabase:", err);
      }
    } else {
      const updated = clubs.map(club => {
        if (club.id === clubId) {
          return { ...club, legalDocStatus: docStatus, status: newStatus };
        }
        return club;
      });
      onClubsChange(updated);
      if (auditedClub && auditedClub.id === clubId) {
        setAuditedClub(updated.find(c => c.id === clubId) || null);
      }
    }
  };

  const handleUpdateStatus = async (clubId: string, newStatus: ClubStatus) => {
    // ─── VALIDACIONES 1.1-1.4: Bloquear habilitación si no cumple requisitos ─
    if (newStatus === "Habilitado") {
      const targetClub = clubs.find(c => c.id === clubId);
      if (targetClub && !runClubEnableValidations(clubId, targetClub.name)) {
        return; // Blocked by validation
      }
    }

    if (onUpdateClub) {
      try {
        const updated = await onUpdateClub(clubId, { status: newStatus });
        if (auditedClub && auditedClub.id === clubId) {
          setAuditedClub(updated);
        }
      } catch (err) {
        console.error("Error updating status in Supabase:", err);
      }
    } else {
      const updated = clubs.map(club => {
        if (club.id === clubId) {
          return { ...club, status: newStatus };
        }
        return club;
      });
      onClubsChange(updated);
      if (auditedClub && auditedClub.id === clubId) {
        setAuditedClub(updated.find(c => c.id === clubId) || null);
      }
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    if (window.confirm("¿Está seguro de eliminar el registro de este club? Se perderán las fichas adjuntas.")) {
      if (onDeleteClub) {
        try {
          await onDeleteClub(clubId);
          setAuditedClub(null);
        } catch (err) {
          console.error("Error deleting club in Supabase:", err);
        }
      } else {
        const updated = clubs.filter(c => c.id !== clubId);
        onClubsChange(updated);
        setAuditedClub(null);
      }
    }
  };

  const handleSaveClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newShortName || !newStadium || !newRepresentative) {
      alert("Por favor rellene los campos obligatorios (*).");
      return;
    }

    // Evaluate initial authorization status
    let initialStatus: ClubStatus = "Pendiente";
    const allChecked = newDocEstatutos && newDocSolvencia && newDocMinisterio && newDocLigaPro;
    if (allChecked) {
      initialStatus = "Habilitado";
    } else if (newDocEstatutos && newDocMinisterio) {
      initialStatus = "Observado";
    }

    const brandNew: Omit<Club, 'id' | 'squadCount'> = {
      name: newName,
      shortName: newShortName,
      slug: newShortName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      founded: newFounded,
      city: newCity,
      stadium: newStadium,
      status: initialStatus,
      legalRepresentative: newRepresentative,
      contactEmail: newEmail || "administracion@club.com",
      logo: newShortName.substring(0, 3).toUpperCase(),
      legalDocStatus: {
        estatutos: newDocEstatutos,
        solvencia: newDocSolvencia,
        ministerioDeporte: newDocMinisterio,
        registroLigaPro: newDocLigaPro
      }
    };

    if (onAddClub) {
      try {
        await onAddClub(brandNew);
        setShowAddDrawer(false);
      } catch (err: any) {
        alert(`Error al guardar en Supabase: ${err.message}`);
      }
    } else {
      const fullClub: Club = {
        ...brandNew,
        id: newShortName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        squadCount: 0
      };
      onClubsChange([...clubs, fullClub]);
      setShowAddDrawer(false);
    }

    // Reset Form
    setNewName("");
    setNewShortName("");
    setNewStadium("");
    setNewFounded("1920-01-01");
    setNewRepresentative("");
    setNewEmail("");
    setNewDocEstatutos(false);
    setNewDocSolvencia(false);
    setNewDocMinisterio(false);
    setNewDocLigaPro(false);
  };

  const filteredClubs = clubs.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "Todos") return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  // Helper to get staff info for a club
  const getClubStaff = (clubId: string) => localStaff[clubId] || [];
  const getClubEconomicApproval = (clubId: string) => localEconomy[clubId] || null;

  return (
    <div className="space-y-6">
      
      {/* ─── VALIDATION BLOCK MODAL ──────────────────────────────────────────── */}
      <ValidationBlockModal
        validation={validationError}
        onClose={() => setValidationError(null)}
      />

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-white tracking-tight">Habilitación y Registro de Clubes</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Auditoría previa y control legal de estatutos para habilitación de planillas de equipos profesionales.</p>
        </div>
        <button
          onClick={() => setShowAddDrawer(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#CCFF00] text-slate-950 font-extrabold rounded-lg text-xs hover:bg-[#b0dc00] transition mt-3 sm:mt-0 active:scale-95"
        >
          <Plus size={14} /> Registrar Nuevo Club
        </button>
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl text-left">
          <span className="text-[9px] font-mono text-slate-500 uppercase block select-none">Registrados</span>
          <span className="text-xl font-black text-slate-200 block mt-1">{totalCount} Clubes</span>
        </div>
        <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl text-left border-l-2 border-emerald-500">
          <span className="text-[9px] font-mono text-emerald-400 uppercase block select-none">Habilitados</span>
          <span className="text-xl font-black text-emerald-400 block mt-1">{enabledCount} Clubes</span>
        </div>
        <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl text-left border-l-2 border-amber-500">
          <span className="text-[9px] font-mono text-amber-500 uppercase block select-none">Observados</span>
          <span className="text-xl font-black text-amber-500 block mt-1">{observedCount} Clubes</span>
        </div>
        <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl text-left border-l-2 border-red-500">
          <span className="text-[9px] font-mono text-red-500 uppercase block select-none">Pendientes</span>
          <span className="text-xl font-black text-red-500 block mt-1">{pendingCount} Clubes</span>
        </div>
      </div>

      {/* Filters Box */}
      <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Buscar club por nombre o sede..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 w-full md:w-auto overflow-x-auto">
          {["Todos", "Habilitado", "Observado", "Pendiente"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === status 
                  ? "bg-slate-800 text-[#CCFF00]" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

      </div>

      {/* Clubs Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club) => {
          const staff = getClubStaff(club.id);
          const hasMedico = staff.some(s => s.role === 'Médico' && s.status === 'Activo');
          const hasDT = staff.some(s => s.role === 'Director Técnico' && s.status === 'Activo');
          const eco = getClubEconomicApproval(club.id);
          const hasEco = eco?.approved || false;

          return (
          <div key={club.id} className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden text-left flex flex-col justify-between hover:border-slate-850 shadow-md">
            
            {/* Header portion */}
            <div className="p-5 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-100 font-bold flex items-center justify-center text-sm shadow-sm">
                    {club.logo}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-200 leading-snug">{club.shortName}</h3>
                    <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1 uppercase mt-0.5">
                      <Globe size={10} /> {club.city}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded ${
                  club.status === "Habilitado" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : club.status === "Observado"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {club.status}
                </span>
              </div>

              {/* Specs */}
              <div className="my-4 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-500">Representante Legal:</span>
                  <span className="font-semibold text-slate-300 truncate max-w-[150px]">{club.legalRepresentative}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estadio Principal:</span>
                  <span className="font-semibold text-slate-300 truncate max-w-[150px]">{club.stadium || "No definido"}</span>
                </div>
              </div>

              {/* ─── LIGAPRO Compliance Indicators ────────────────────────── */}
              <div className="flex gap-1.5 mb-3">
                <span title="Médico" className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${hasMedico ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  <Stethoscope size={9} /> MED
                </span>
                <span title="Director Técnico" className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${hasDT ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  <GraduationCap size={9} /> DT
                </span>
                <span title="Aprobación Económica" className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${hasEco ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  <DollarSign size={9} /> ECO
                </span>
              </div>
            </div>

            {/* Checklist audit controls */}
            <div className="bg-slate-900/60 p-4 border-t border-b border-slate-900 text-left">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2 select-none">
                Estatus Documentación Legal
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <button 
                  onClick={() => handleToggleDoc(club.id, "estatutos")}
                  className={`flex items-center space-x-1.5 p-1 rounded hover:bg-slate-800 transition ${
                    club.legalDocStatus.estatutos ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <CheckSquare size={13} className={club.legalDocStatus.estatutos ? "fill-emerald-500/10" : ""} />
                  <span className="truncate">1. Estatutos Aprobados</span>
                </button>

                <button 
                  onClick={() => handleToggleDoc(club.id, "ministerioDeporte")}
                  className={`flex items-center space-x-1.5 p-1 rounded hover:bg-slate-800 transition ${
                    club.legalDocStatus.ministerioDeporte ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <CheckSquare size={13} className={club.legalDocStatus.ministerioDeporte ? "fill-emerald-500/10" : ""} />
                  <span className="truncate">2. Reg. Ministerio</span>
                </button>

                <button 
                  onClick={() => handleToggleDoc(club.id, "solvencia")}
                  className={`flex items-center space-x-1.5 p-1 rounded hover:bg-slate-800 transition ${
                    club.legalDocStatus.solvencia ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <CheckSquare size={13} className={club.legalDocStatus.solvencia ? "fill-emerald-500/10" : ""} />
                  <span className="truncate">3. Solvencia Finan.</span>
                </button>

                <button 
                  onClick={() => handleToggleDoc(club.id, "registroLigaPro")}
                  className={`flex items-center space-x-1.5 p-1 rounded hover:bg-slate-800 transition ${
                    club.legalDocStatus.registroLigaPro ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <CheckSquare size={13} className={club.legalDocStatus.registroLigaPro ? "fill-emerald-500/10" : ""} />
                  <span className="truncate">4. Certif. LigaPro</span>
                </button>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-950 flex items-center justify-between border-t border-slate-900">
              <span className="text-[10px] font-mono text-slate-500">Fundado: {club.founded}</span>
              <div className="flex space-x-1.5">
                <button
                  onClick={() => setAuditedClub(club)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded text-[10.5px] border border-slate-800 transition"
                >
                  Auditar Club
                </button>
                <button 
                  onClick={() => handleDeleteClub(club.id)}
                  aria-label="Eliminar registro de club"
                  className="p-1 text-slate-600 hover:text-red-400 rounded transition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

          </div>
          );
        })}
      </div>

      {/* Add New Club Side Drawer / Dialog Popup */}
      {showAddDrawer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleSaveClub} 
            className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-left"
          >
            <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-[#CCFF00] uppercase tracking-wider block">Área Administrativa</span>
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                  <Building2 size={16} /> REGISTRO DE NUEVO CLUB DE FÚTBOL
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddDrawer(false)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              
              {/* Core identity specs row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nombre Completo del Club *</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Club Deportivo Cuenca" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none focus:border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Siglas / Nombre para Marcador *</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Deportivo Cuenca" 
                    value={newShortName}
                    onChange={(e) => setNewShortName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none focus:border-slate-700"
                    required
                  />
                </div>
              </div>

              {/* Properties row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Provincia / Sede *</label>
                  <select 
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none focus:border-slate-700"
                  >
                    <option value="Guayaquil">Guayaquil (Guayas)</option>
                    <option value="Quito">Quito (Pichincha)</option>
                    <option value="Sangolquí">Sangolquí (Pichincha)</option>
                    <option value="Machala">Machala (El Oro)</option>
                    <option value="Cuenca">Cuenca (Azuay)</option>
                    <option value="Manta">Manta (Manabí)</option>
                    <option value="Ambato">Ambato (Tungurahua)</option>
                    <option value="Ibarra">Ibarra (Imbabura)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Estadio Sede Principal *</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Alejandro Serrano Aguilar" 
                    value={newStadium}
                    onChange={(e) => setNewStadium(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none focus:border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha de Fundación</label>
                  <input 
                    type="date" 
                    value={newFounded}
                    onChange={(e) => setNewFounded(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>

              {/* Management contact row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Representante Legal del Club *</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Ing. Nataly Villavicencio" 
                    value={newRepresentative}
                    onChange={(e) => setNewRepresentative(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none focus:border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Correo Electrónico Oficial *</label>
                  <input 
                    type="email" 
                    placeholder="E.g. secretaria@elclub.com" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>

              {/* Legal documents compliance area */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 mt-2 text-left">
                <span className="text-[9.5px] font-mono text-[#CCFF00] uppercase tracking-wider block mb-2 font-bold flex items-center gap-1">
                  <Sparkles size={11} /> Auditoría Previa Documentaria
                </span>
                <p className="text-[10px] text-slate-400 mb-3">Marque los requisitos que la institución ya ha cargado para ser habilitados de inmediato en el sistema.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newDocEstatutos} 
                      onChange={(e) => setNewDocEstatutos(e.target.checked)}
                      className="bg-slate-950 border border-slate-800 text-[#CCFF00] rounded focus:ring-0"
                    />
                    <span>1. Estatutos Registrados</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newDocMinisterio} 
                      onChange={(e) => setNewDocMinisterio(e.target.checked)}
                      className="bg-slate-950 border border-slate-800 text-[#CCFF00] rounded focus:ring-0"
                    />
                    <span>2. Registro en Ministerio Deporte</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newDocSolvencia} 
                      onChange={(e) => setNewDocSolvencia(e.target.checked)}
                      className="bg-slate-950 border border-slate-800 text-[#CCFF00] rounded focus:ring-0"
                    />
                    <span>3. Solvencia Económica Vigente</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newDocLigaPro} 
                      onChange={(e) => setNewDocLigaPro(e.target.checked)}
                      className="bg-slate-950 border border-slate-800 text-[#CCFF00] rounded focus:ring-0"
                    />
                    <span>4. Pago Alícuota LigaPro</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex items-center justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowAddDrawer(false)}
                className="px-4 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-[#CCFF00] text-slate-950 font-extrabold rounded text-xs hover:bg-[#b0dc00] transition"
              >
                Guardar Club
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Audited Detailed popup Dialog */}
      {auditedClub && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-left">
            <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 font-bold flex items-center justify-center text-xs text-white">
                  {auditedClub.logo}
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-[#CCFF00] uppercase block">Gestión e Inspección Legal</span>
                  <p className="text-sm font-black text-slate-100">{auditedClub.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={isEditing ? () => setIsEditing(false) : startEditing}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-[#CCFF00] hover:text-slate-950 text-[#CCFF00] font-black border border-[#CCFF00]/15 rounded text-[10px] transition"
                >
                  {isEditing ? "Ver Documentación" : "Editar Datos"}
                </button>
                <button 
                  onClick={() => {
                    setAuditedClub(null);
                    setIsEditing(false);
                  }}
                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs text-slate-300">
                <span className="text-[10px] font-mono text-[#CCFF00] uppercase tracking-widest block font-bold border-b border-slate-900 pb-1.5 mb-2 select-none">
                  EDICIÓN DE DATOS INSTITUCIONALES
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1 font-mono text-[9px] uppercase">Nombre Oficial del Club *</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded focus:outline-none focus:border-[#CCFF00]/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1 font-mono text-[9px] uppercase">Siglas / Marcador *</label>
                    <input 
                      type="text" 
                      value={editShortName}
                      onChange={(e) => setEditShortName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded focus:outline-none focus:border-[#CCFF00]/30"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1 font-mono text-[9px] uppercase">Sede / Provincia *</label>
                    <select 
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded focus:outline-none"
                    >
                      <option value="Guayaquil">Guayaquil</option>
                      <option value="Quito">Quito</option>
                      <option value="Sangolquí">Sangolquí</option>
                      <option value="Machala">Machala</option>
                      <option value="Cuenca">Cuenca</option>
                      <option value="Manta">Manta</option>
                      <option value="Ambato">Ambato</option>
                      <option value="Ibarra">Ibarra</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-400 font-medium mb-1 font-mono text-[9px] uppercase">Estadio Sede Principal *</label>
                    <input 
                      type="text" 
                      value={editStadium}
                      onChange={(e) => setEditStadium(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded focus:outline-none focus:border-[#CCFF00]/30"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1 font-mono text-[9px] uppercase">Representante Legal *</label>
                    <input 
                      type="text" 
                      value={editRepresentative}
                      onChange={(e) => setEditRepresentative(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded focus:outline-none focus:border-[#CCFF00]/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1 font-mono text-[9px] uppercase">Fecha de Fundación</label>
                    <input 
                      type="date" 
                      value={editFounded}
                      onChange={(e) => setEditFounded(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded focus:outline-none focus:border-[#CCFF00]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 font-mono text-[9px] uppercase">Correo Oficial del Club *</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded focus:outline-none focus:border-[#CCFF00]/30 font-mono"
                    required
                  />
                </div>

                <div className="pt-3 border-t border-slate-900 flex justify-end space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-450 rounded text-xs transition"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-[#CCFF00] text-slate-950 font-black rounded text-xs hover:bg-[#b0dc00] transition"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5 space-y-4 text-xs text-slate-300 max-h-[70vh] overflow-y-auto">
                
                {/* ─── LIGAPRO Staff & Economic Status ────────────────────── */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#CCFF00] uppercase tracking-widest block select-none font-bold">
                    Requisitos Reglamento LIGAPRO
                  </span>
                  
                  {(() => {
                    const staff = localStaff[auditedClub.id] || [];
                    const eco = localEconomy[auditedClub.id] || null;
                    const hasMed = staff.some(s => s.role === 'Médico' && s.status === 'Activo');
                    const hasDt = staff.some(s => s.role === 'Director Técnico' && s.status === 'Activo');
                    const dtName = staff.find(s => s.role === 'Director Técnico')?.name || 'No registrado';
                    const medName = staff.find(s => s.role === 'Médico')?.name || 'No registrado';
                    
                    return (
                      <div className="grid grid-cols-1 gap-2">
                        <div className={`flex items-center justify-between p-2.5 rounded-lg border ${hasMed ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
                          <div className="flex items-center gap-2">
                            <Stethoscope size={13} className={hasMed ? 'text-emerald-400' : 'text-red-400'} />
                            <div>
                              <span className="text-slate-200 font-semibold block">Médico del Club</span>
                              <span className="text-[10px] text-slate-500">{medName}</span>
                            </div>
                          </div>
                          {!hasMed ? (
                            <button onClick={() => handleAddStaff(auditedClub.id, 'Médico')} className="text-[9px] font-mono font-bold px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded transition">
                              REGISTRAR
                            </button>
                          ) : (
                            <span className="text-[9px] font-mono font-bold text-emerald-400">REGISTRADO ✓</span>
                          )}
                        </div>
                        
                        <div className={`flex items-center justify-between p-2.5 rounded-lg border ${hasDt ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
                          <div className="flex items-center gap-2">
                            <GraduationCap size={13} className={hasDt ? 'text-emerald-400' : 'text-red-400'} />
                            <div>
                              <span className="text-slate-200 font-semibold block">Director Técnico</span>
                              <span className="text-[10px] text-slate-500">{dtName}</span>
                            </div>
                          </div>
                          {!hasDt ? (
                            <button onClick={() => handleAddStaff(auditedClub.id, 'Director Técnico')} className="text-[9px] font-mono font-bold px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded transition">
                              REGISTRAR
                            </button>
                          ) : (
                            <span className="text-[9px] font-mono font-bold text-emerald-400">REGISTRADO ✓</span>
                          )}
                        </div>
                        
                        <div className={`flex items-center justify-between p-2.5 rounded-lg border ${eco?.approved ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
                          <div className="flex items-center gap-2">
                            <DollarSign size={13} className={eco?.approved ? 'text-emerald-400' : 'text-red-400'} />
                            <div>
                              <span className="text-slate-200 font-semibold block">Control Económico</span>
                              <span className="text-[10px] text-slate-500">{eco?.approved ? `Aprobado: ${eco.approvedDate}` : 'Sin aprobación'}</span>
                            </div>
                          </div>
                          {!eco?.approved ? (
                            <button onClick={() => handleApproveEconomy(auditedClub.id)} className="text-[9px] font-mono font-bold px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded transition">
                              APROBAR
                            </button>
                          ) : (
                            <span className="text-[9px] font-mono font-bold text-emerald-400">APROBADO ✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Document states with toggles */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block select-none">Modificaciones de Validación</span>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-855">
                      <div>
                        <h4 className="font-semibold text-slate-200">Requisito 1: Estatutos Oficiales</h4>
                        <p className="text-[11px] text-slate-500">Copia legalizada de estatutos e informe de asamblea inscritos.</p>
                      </div>
                      <button 
                        onClick={() => handleToggleDoc(auditedClub.id, "estatutos")}
                        className={`px-3 py-1 font-mono font-bold text-[10px] rounded ${
                          auditedClub.legalDocStatus.estatutos 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {auditedClub.legalDocStatus.estatutos ? "Aprobado [SÍ]" : "Pendiente [NO]"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-855">
                      <div>
                        <h4 className="font-semibold text-slate-200">Requisito 2: Acreditación de Directorio</h4>
                        <p className="text-[11px] text-slate-500">Registro emitido por la secretaría técnica del Ministerio del Deporte.</p>
                      </div>
                      <button 
                        onClick={() => handleToggleDoc(auditedClub.id, "ministerioDeporte")}
                        className={`px-3 py-1 font-mono font-bold text-[10px] rounded ${
                          auditedClub.legalDocStatus.ministerioDeporte 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {auditedClub.legalDocStatus.ministerioDeporte ? "Aprobado [SÍ]" : "Pendiente [NO]"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-855">
                      <div>
                        <h4 className="font-semibold text-slate-200">Requisito 3: Solvencia y Garantías</h4>
                        <p className="text-[11px] text-slate-500">Garantía líquida de deudas vencidas con la agremiación de futbolistas (AFE).</p>
                      </div>
                      <button 
                        onClick={() => handleToggleDoc(auditedClub.id, "solvencia")}
                        className={`px-3 py-1 font-mono font-bold text-[10px] rounded ${
                          auditedClub.legalDocStatus.solvencia 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {auditedClub.legalDocStatus.solvencia ? "Aprobado [SÍ]" : "Pendiente [NO]"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-855">
                      <div>
                        <h4 className="font-semibold text-slate-200">Requisito 4: Registro Regular LigaPro</h4>
                        <p className="text-[11px] text-slate-500">Pago de alícuota anual y fianza de participación aprobada.</p>
                      </div>
                      <button 
                        onClick={() => handleToggleDoc(auditedClub.id, "registroLigaPro")}
                        className={`px-3 py-1 font-mono font-bold text-[10px] rounded ${
                          auditedClub.legalDocStatus.registroLigaPro 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {auditedClub.legalDocStatus.registroLigaPro ? "Aprobado [SÍ]" : "Pendiente [NO]"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Force override state selectors */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-855 mt-4 text-left">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-2 font-bold select-none">Cambiar Estado Manual de Habilitación</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateStatus(auditedClub.id, "Habilitado")}
                      className={`flex-1 py-1.5 rounded font-bold text-[10.5px] transition ${
                        auditedClub.status === "Habilitado" ? "bg-emerald-500 text-slate-950" : "bg-slate-950 text-slate-400 hover:text-white"
                      }`}
                    >
                      Habilitar
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(auditedClub.id, "Observado")}
                      className={`flex-1 py-1.5 rounded font-bold text-[10.5px] transition ${
                        auditedClub.status === "Observado" ? "bg-amber-500 text-slate-950" : "bg-slate-950 text-slate-400 hover:text-white"
                      }`}
                    >
                      Sujeto a Observación
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(auditedClub.id, "Pendiente")}
                      className={`flex-1 py-1.5 rounded font-bold text-[10.5px] transition ${
                        auditedClub.status === "Pendiente" ? "bg-red-500 text-slate-950" : "bg-slate-950 text-slate-400 hover:text-white"
                      }`}
                    >
                      No Habilitar
                    </button>
                  </div>
                </div>

              </div>
            )}

            <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 text-center select-none font-mono text-[10px] text-slate-500">
              *Los cambios afectan las fichas de habilitación de jugadores de inmediato.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
