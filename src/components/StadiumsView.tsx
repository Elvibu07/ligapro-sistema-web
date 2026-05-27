import React, { useState } from "react";
import { MapPin, ShieldCheck, HelpCircle, Eye, AlertCircle, Sparkles, Compass, CheckCircle2 } from "lucide-react";
import { Stadium } from "../types";

interface StadiumsViewProps {
  stadiums: Stadium[];
  onStadiumsChange: (updatedStadiums: Stadium[]) => void;
  onUpdateStadium?: (id: string, updates: Partial<Stadium>) => Promise<Stadium>;
}

export default function StadiumsView({ stadiums, onStadiumsChange, onUpdateStadium }: StadiumsViewProps) {
  const [selectedStadiumId, setSelectedStadiumId] = useState<string>(stadiums[0]?.id || "");
  const selectedStadium = stadiums.find(st => st.id === selectedStadiumId) || stadiums[0] || null;

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

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold font-sans text-white tracking-tight">Inspección de Infraestructura y Estadios</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">Calificación de estadios en base a luxometría de luminarias, altitud geográfica y acometidas de fibra óptica para el VAR.</p>
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
            
            <div className="border-b border-slate-900 pb-2.5">
              <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Ficha Técnico Homologada</span>
              <h3 className="font-extrabold text-slate-200 line-clamp-2">{selectedStadium.name}</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-900 rounded">
                <span className="text-slate-500">Altitud de la Sede:</span>
                <span className="font-mono text-slate-300 font-bold">{selectedStadium.altitude} m sobre el nivel del mar</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900 rounded">
                <span className="text-slate-500">Composición Césped:</span>
                <span className="font-mono text-[#CCFF00] font-semibold">{selectedStadium.grassType}</span>
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
                 Las normativas de transmisiones HD internacionales exigen un flujo de luminosidad uniforme mínimo de **1,200 Lux**. Los estadios por debajo del estándar (como el Estadio Atahualpa con {selectedStadium.lightingLux} lux) reciben sanción económica o inhabilitación de juego nocturno.
              </p>
              
              {/* Dynamic trigger certified action */}
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

    </div>
  );
}
