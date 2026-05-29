import React, { useState } from "react";
import { MapPin, ShieldCheck, HelpCircle, Eye, AlertCircle, Sparkles, Compass, CheckCircle2, Edit, X, Save, Trash2 } from "lucide-react";
import { Stadium } from "../types";

interface StadiumsViewProps {
  stadiums: Stadium[];
  onStadiumsChange: (updatedStadiums: Stadium[]) => void;
  onUpdateStadium?: (id: string, updates: Partial<Stadium>) => Promise<Stadium>;
  onAddStadium?: (stadium: Omit<Stadium, "id">) => Promise<Stadium>;
  onDeleteStadium?: (id: string) => Promise<void>;
}

export default function StadiumsView({ stadiums, onStadiumsChange, onUpdateStadium, onAddStadium, onDeleteStadium }: StadiumsViewProps) {
  const [selectedStadiumId, setSelectedStadiumId] = useState<string>(stadiums[0]?.id || "");
  const selectedStadium = stadiums.find(st => st.id === selectedStadiumId) || stadiums[0] || null;

  // Edit States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStadiumId, setEditingStadiumId] = useState<string | null>(null); // null means adding new

  // Form Fields
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCapacity, setEditCapacity] = useState<number>(10000);
  const [editAltitude, setEditAltitude] = useState<number>(0);
  const [editLighting, setEditLighting] = useState<number>(1200);
  const [editVor, setEditVor] = useState<Stadium["vorConnectivity"]>("Fibra Única");
  const [editGrassHeight, setEditGrassHeight] = useState<number>(20);
  const [editGrassType, setEditGrassType] = useState<Stadium["grassType"]>("Césped Natural");
  const [editFifaQuality, setEditFifaQuality] = useState(false);

  const openModalForNew = () => {
    setEditingStadiumId(null);
    setEditName("");
    setEditCity("");
    setEditCapacity(10000);
    setEditAltitude(0);
    setEditLighting(1200);
    setEditVor("Fibra Única");
    setEditGrassHeight(22);
    setEditGrassType("Césped Natural");
    setEditFifaQuality(false);
    setShowEditModal(true);
  };

  const openModalForEdit = () => {
    if (!selectedStadium) return;
    setEditingStadiumId(selectedStadium.id);
    setEditName(selectedStadium.name);
    setEditCity(selectedStadium.city);
    setEditCapacity(selectedStadium.capacity);
    setEditAltitude(selectedStadium.altitude);
    setEditLighting(selectedStadium.lightingLux);
    setEditVor(selectedStadium.vorConnectivity);
    setEditGrassHeight(selectedStadium.grassHeight || 20);
    setEditGrassType(selectedStadium.grassType);
    setEditFifaQuality(selectedStadium.fifaQualityPro || false);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editName.trim() || !editCity.trim()) {
      alert("Por favor, ingrese el nombre y la ciudad del estadio antes de guardar.");
      return;
    }
    
    if (editingStadiumId === null) {
      // Adding new
      const newStadiumData: Omit<Stadium, "id"> = {
        name: editName,
        city: editCity,
        capacity: editCapacity,
        altitude: editAltitude,
        lightingLux: editLighting,
        vorConnectivity: editVor,
        grassHeight: editGrassHeight,
        grassType: editGrassType,
        fifaQualityPro: editFifaQuality,
        locationCoords: { lat: 0, lng: 0 },
        varCertified: false,
        lastInspectionDate: new Date().toISOString().split("T")[0],
        image: "https://images.unsplash.com/photo-1574629810360-1ff1f8b1a52b?auto=format&fit=crop&q=80&w=400"
      };

      if (onAddStadium) {
        await onAddStadium(newStadiumData).catch(err => console.error("Error adding stadium:", err));
      } else {
        const generatedId = "stadium-" + Date.now();
        onStadiumsChange([...stadiums, { ...newStadiumData, id: generatedId }]);
      }
    } else {
      // Editing existing
      const updates = {
        name: editName,
        city: editCity,
        capacity: editCapacity,
        altitude: editAltitude,
        lightingLux: editLighting,
        vorConnectivity: editVor,
        grassHeight: editGrassHeight,
        grassType: editGrassType,
        fifaQualityPro: editFifaQuality,
      };

      if (onUpdateStadium) {
        await onUpdateStadium(editingStadiumId, updates).catch(err => console.error("Error saving stadium:", err));
      } else {
        const updated = stadiums.map(s => s.id === editingStadiumId ? { ...s, ...updates } : s);
        onStadiumsChange(updated);
      }
    }
    
    setShowEditModal(false);
  };

  const handleToggleCertification = (stadiumId: string) => {
    const updated = stadiums.map(s => {
      if (s.id === stadiumId) {
        return {
          ...s,
          varCertified: !s.varCertified,
          lastInspectionDate: new Date().toISOString().split("T")[0]
        };
      }
      return s;
    });

    if (onUpdateStadium) {
      const stadium = stadiums.find(s => s.id === stadiumId);
      if (stadium) {
        onUpdateStadium(stadiumId, {
          varCertified: !stadium.varCertified,
          lastInspectionDate: new Date().toISOString().split("T")[0]
        }).catch(err => console.error("Error updating stadium:", err));
      }
    } else {
      onStadiumsChange(updated);
    }
  };

  const handleDelete = () => {
    if (!selectedStadium) return;
    if (window.confirm(`¿Está seguro de eliminar definitivamente el estadio "${selectedStadium.name}"?\n\nEsta acción es irreversible.`)) {
      if (onDeleteStadium) {
        onDeleteStadium(selectedStadium.id).catch(err => console.error("Error deleting stadium:", err));
      } else {
        const updated = stadiums.filter(s => s.id !== selectedStadium.id);
        onStadiumsChange(updated);
      }
      setSelectedStadiumId(stadiums.find(s => s.id !== selectedStadium.id)?.id || "");
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold font-sans text-white tracking-tight">Inspección de Infraestructura y Estadios</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Calificación de estadios en base a luxometría de luminarias, altitud geográfica y acometidas de fibra óptica para el VAR.</p>
        </div>
        <button 
          onClick={openModalForNew}
          className="mt-4 sm:mt-0 px-4 py-2 bg-[#CCFF00] text-slate-950 hover:bg-[#b0dc00] transition font-bold text-xs rounded-lg flex items-center gap-2"
        >
          <MapPin size={16} />
          Registrar Estadio
        </button>
      </div>

      {/* Grid: Stadium profiles list vs details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Stadium select sidebar cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stadiums.map((st) => {
            const isSelected = selectedStadium?.id === st.id;

            return (
              <div 
                key={st.id} 
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-[160px] cursor-pointer ${
                  isSelected 
                    ? "bg-slate-900 border-slate-800 text-white shadow-lg" 
                    : "bg-slate-950 border-slate-855 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                }`}
                onClick={() => setSelectedStadiumId(st.id)}
              >
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono text-slate-500 uppercase uppercase">{st.city}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${st.varCertified ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`}></span>
                  </div>
                  <h4 className="font-extrabold text-slate-200 leading-tight line-clamp-1">{st.name}</h4>
                  <p className="text-[10.5px] font-mono text-slate-500">Capacidad: {st.capacity.toLocaleString()} espectadores</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] font-mono font-semibold text-slate-450">{st.altitude} m s.n.m.</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCertification(st.id);
                    }}
                    className={`px-2.5 py-1 rounded text-[9.5px] font-mono font-bold transition uppercase ${
                      st.varCertified 
                        ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" 
                        : "bg-rose-550/15 text-rose-450 hover:bg-rose-550/25"
                    }`}
                  >
                    {st.varCertified ? "VAR: OK" : "OBSERVADO"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Selected Stadium detailed inspection report cards */}
        {selectedStadium && (
          <div className="bg-slate-950 border border-slate-855 rounded-2xl p-5 space-y-4">
            
            <div className="border-b border-slate-900 pb-2.5 flex justify-between items-start">
              <div>
                <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Ficha Técnico Homologada</span>
                <h3 className="font-extrabold text-slate-200 line-clamp-2">{selectedStadium.name}</h3>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={openModalForEdit}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded text-slate-400 hover:text-white transition"
                  title="Editar infraestructura"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 bg-slate-900 hover:bg-rose-900 border border-slate-850 hover:border-rose-800 rounded text-slate-400 hover:text-rose-200 transition"
                  title="Eliminar estadio"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-900 rounded">
                <span className="text-slate-500">Altitud de la Sede:</span>
                <span className="font-mono text-slate-300 font-bold">{selectedStadium.altitude} m sobre el nivel del mar</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900 rounded">
                <span className="text-slate-500">Composición Césped:</span>
                <span className="font-mono text-[#CCFF00] font-semibold flex items-center gap-2">
                  {selectedStadium.grassType}
                  {selectedStadium.grassType === "Césped Sintético" && (
                    <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase ${selectedStadium.fifaQualityPro ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {selectedStadium.fifaQualityPro ? "FIFA QUALITY PRO" : "SIN CERTIFICADO"}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900 rounded">
                <span className="text-slate-500">Altura del Césped:</span>
                <span className={`font-mono font-bold ${
                  !selectedStadium.grassHeight || selectedStadium.grassHeight < 20 || selectedStadium.grassHeight > 25 
                  ? "text-red-400" 
                  : "text-slate-300"
                }`}>
                  {selectedStadium.grassHeight || "No registrado"} mm
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900 rounded">
                <span className="text-slate-500">Fuerza Iluminación:</span>
                <span className="font-mono text-slate-300 font-bold">{selectedStadium.lightingLux} Lux (Potencia)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900 rounded">
                <span className="text-slate-500">Topología Fibra VOR:</span>
                <span className="font-mono text-cyan-450">{selectedStadium.vorConnectivity}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900 rounded">
                <span className="text-slate-500">Inspección Comisaría:</span>
                <span className="font-mono text-slate-400">{selectedStadium.lastInspectionDate}</span>
              </div>
            </div>

            {/* Technical audit advice box */}
            <div className="bg-slate-900 border border-dashed border-slate-800 p-4 rounded-xl space-y-2.5">
              <span className="text-[10px] font-mono uppercase text-[#CCFF00] font-bold flex items-center gap-1">
                 <Compass size={13} /> Parámetros de Inspección Táctica (Lux)
              </span>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">
                 Las normativas de transmisiones HD internacionales exigen un flujo de luminosidad uniforme mínimo de **1,200 Lux**. Además, según el **Art. 51**, la altura del césped debe estar entre 20mm y 25mm, y las canchas sintéticas deben portar el certificado FIFA QUALITY PRO vigente.
              </p>
              
              {/* Validation Warnings (Art. 51) */}
              {((selectedStadium.grassHeight ?? 0) < 20 || (selectedStadium.grassHeight ?? 0) > 25) && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2 mt-2">
                  <span className="text-[10px] font-mono text-red-400 block font-bold">Infracción (Art. 51): Altura de césped fuera del rango (20-25mm).</span>
                </div>
              )}
              {(selectedStadium.grassType === "Césped Sintético" && !selectedStadium.fifaQualityPro) && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2 mt-2">
                  <span className="text-[10px] font-mono text-red-400 block font-bold">Infracción (Art. 51): Carece de certificado FIFA Quality Pro. No apto.</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-950 flex items-center justify-between">
                <span className="text-[9.5px] font-mono text-slate-500">Estatus: {selectedStadium.varCertified ? "CERTIF. EMITIDO" : "NO APTO"}</span>
                <button
                  onClick={() => handleToggleCertification(selectedStadium.id)}
                  className={`px-3 py-1.5 font-mono text-[9px] font-black rounded-lg transition uppercase ${
                    selectedStadium.varCertified ? "bg-red-600 text-white hover:bg-red-700" : "bg-[#CCFF00] text-slate-950 hover:bg-[#b0dc00]"
                  }`}
                >
                  {selectedStadium.varCertified ? "Revocar Certif." : "Habilitar Estadio"}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleSaveEdit}
            className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-left"
          >
            <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-[#CCFF00] uppercase block">{editingStadiumId ? "Modificar" : "Registrar"}</span>
                <h3 className="text-sm font-black text-slate-100">{editingStadiumId ? "Datos de Infraestructura" : "Nuevo Estadio"}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nombre del Estadio *</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Ciudad *</label>
                  <input 
                    type="text" 
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Aforo Total</label>
                  <input 
                    type="number" 
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Altitud (msnm)</label>
                  <input 
                    type="number" 
                    value={editAltitude}
                    onChange={(e) => setEditAltitude(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#CCFF00] font-medium mb-1">Iluminación (Lux)</label>
                  <input 
                    type="number" 
                    value={editLighting}
                    onChange={(e) => setEditLighting(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Red VOR (VAR)</label>
                <select 
                  value={editVor}
                  onChange={(e) => setEditVor(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                >
                  <option value="Fibra Principal + Respaldo">Fibra Principal + Respaldo</option>
                  <option value="Fibra Única">Fibra Única</option>
                  <option value="Satelital">Satelital</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Altura Césped (mm)</label>
                  <input 
                    type="number" 
                    value={editGrassHeight}
                    onChange={(e) => setEditGrassHeight(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Composición</label>
                  <select 
                    value={editGrassType}
                    onChange={(e) => setEditGrassType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-850 p-2 text-white rounded focus:outline-none"
                  >
                    <option value="Césped Natural">Césped Natural</option>
                    <option value="Césped Mixto">Césped Mixto</option>
                    <option value="Césped Sintético">Césped Sintético</option>
                  </select>
                </div>
              </div>

              {editGrassType === "Césped Sintético" && (
                <div className="flex items-center pt-2">
                  <label className="flex items-center cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={editFifaQuality}
                      onChange={(e) => setEditFifaQuality(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 ${editFifaQuality ? 'bg-[#CCFF00] border-[#CCFF00]' : 'border-slate-600 bg-slate-900 group-hover:border-slate-500'}`}>
                      {editFifaQuality && <CheckCircle2 size={12} className="text-slate-950" />}
                    </div>
                    <span className="text-[10px] font-medium text-slate-300 uppercase">Certificado FIFA QUALITY PRO</span>
                  </label>
                </div>
              )}
            </div>

            <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-[#CCFF00] text-slate-950 font-extrabold rounded text-xs hover:bg-[#b0dc00] transition flex items-center gap-1.5"
              >
                <Save size={14} /> Guardar
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
