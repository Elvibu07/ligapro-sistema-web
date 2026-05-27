import React, { useState } from "react";
import { Tv2, CheckCircle2, AlertTriangle, Radio, Server, Compass, ShieldAlert, Cpu, RefreshCw, X } from "lucide-react";
import { VarCamera } from "../types";
import { initialVarCameras } from "../mockData";

export default function VarVorView() {
  const [cameras, setCameras] = useState<VarCamera[]>(initialVarCameras);
  const [selectedCamId, setSelectedCamId] = useState<string>("cam-1");

  const [checklist, setChecklist] = useState({
    opticalCalib: true,
    offside3D: true,
    intercomRefs: false, // Initial failure or unchecked
    redundancyUplink: true
  });

  const activeCam = cameras.find(c => c.id === selectedCamId) || cameras[0];

  const handleToggleChecklist = (key: keyof typeof checklist) => {
    const nextVal = !checklist[key];
    setChecklist({ ...checklist, [key]: nextVal });
    
    const checklistLabels: Record<string, string> = {
      opticalCalib: "Calibración Óptica General",
      offside3D: "Trazador de Fuera de Juego 3D",
      intercomRefs: "Radio Intercomunicadores Árbitros",
      redundancyUplink: "Redundancia de Uplink de Fibra"
    };

    window.dispatchEvent(new CustomEvent('ligapro-notification', {
      detail: {
        text: `${checklistLabels[key as string] || String(key)} fue ${nextVal ? 'verificado' : 'desmarcado'}`,
        type: "var",
        view: "var-vor"
      }
    }));
  };

  const handleCalibrateCamera = (camId: string) => {
    const updated = cameras.map(c => {
      if (c.id === camId) {
        return {
          ...c,
          status: "Óptimo" as const,
          lastVerified: new Date().toISOString().replace("T", " ").substring(0, 16)
        };
      }
      return c;
    });
    setCameras(updated);

    window.dispatchEvent(new CustomEvent('ligapro-notification', {
      detail: {
        text: `Lente óptico de la Cámara ${camId.toUpperCase()} calibrado con éxito`,
        type: "var",
        view: "var-vor"
      }
    }));
  };

  const isVarFullyCertified = checklist.opticalCalib && checklist.offside3D && checklist.intercomRefs && checklist.redundancyUplink && 
                             !cameras.some(c => c.status === "Fuera de Servicio");

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold font-sans text-white tracking-tight">Sometimiento Técnico VAR & Salas VOR</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">Panel de instrumentación física, cámaras ópticas de fuera de juego tridimensional y enlaces de radio encriptados.</p>
      </div>

      {/* Checklist and VOR credentials row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Technical Checklist */}
        <div className="bg-slate-950 border border-slate-855 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 border-b border-slate-900 pb-2 flex items-center gap-1.5 select-none">
            <Radio size={14} className="text-[#CCFF00]" /> Checklist de Rigurosidad Técnica VAR
          </h3>

          <div className="space-y-2 text-xs">
            
            <button 
              onClick={() => handleToggleChecklist("opticalCalib")}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                checklist.opticalCalib ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/25" : "bg-slate-900 text-slate-550 border-slate-900"
              }`}
            >
              <div>
                <h4 className="font-bold">1. Calibración Óptica General</h4>
                <p className="text-[10.5px] text-slate-500 mt-0.5">Sincronización milimétrica de lentes de barrido.</p>
              </div>
              <CheckCircle2 size={18} className={checklist.opticalCalib ? "fill-emerald-500/5" : ""} />
            </button>

            <button 
              onClick={() => handleToggleChecklist("offside3D")}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                checklist.offside3D ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/25" : "bg-slate-900 text-slate-550 border-slate-900"
              }`}
            >
              <div>
                <h4 className="font-bold">2. Trazador de Fuera de Juego 3D</h4>
                <p className="text-[10.5px] text-slate-500 mt-0.5">Línea de fuera de juego virtual triangulada mediante GPU.</p>
              </div>
              <CheckCircle2 size={18} className={checklist.offside3D ? "fill-emerald-500/5" : ""} />
            </button>

            <button 
              onClick={() => handleToggleChecklist("intercomRefs")}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                checklist.intercomRefs ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/25" : "bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-inner"
              }`}
            >
              <div>
                <h4 className="font-bold">3. Radio Intercomunicadores Árbitros</h4>
                <p className="text-[10.5px] text-slate-450 mt-0.5">Canal de comunicación de audio bidireccional VOR-Campo.</p>
              </div>
              <CheckCircle2 size={18} className={checklist.intercomRefs ? "fill-emerald-500/5" : ""} />
            </button>

            <button 
              onClick={() => handleToggleChecklist("redundancyUplink")}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                checklist.redundancyUplink ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/25" : "bg-slate-900 text-slate-550 border-slate-900"
              }`}
            >
              <div>
                <h4 className="font-bold">4. Redundancia de Uplink de Fibra</h4>
                <p className="text-[10.5px] text-slate-500 mt-0.5">Dualidad de enlaces (principal + respaldo de contingencia).</p>
              </div>
              <CheckCircle2 size={18} className={checklist.redundancyUplink ? "fill-emerald-500/5" : ""} />
            </button>

          </div>
        </div>

        {/* Video Operation Room (VOR) details and IP tables */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-855 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 border-b border-slate-900 pb-2 flex items-center gap-1.5 select-none">
             <Server size={14} className="text-[#CCFF00]" /> Estatus Credentials y Despliegue VOR
          </h3>

          <div className="space-y-3.5 text-xs">
            <p className="text-slate-400 leading-relaxed font-sans">
              La sala VOR centralizada se encuentra alojada en el Edificio Matriz de LigaPro en Guayaquil, intercomunicada con todos los estadios del país vía anillo de fibra óptica pura dedicada de baja latencia (&lt; 8ms).
            </p>

            <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-850 p-2">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-slate-950 text-slate-500 uppercase">
                    <th className="py-2 px-3">Sala VOR</th>
                    <th className="py-2 px-3">Estadio Vinculado</th>
                    <th className="py-2 px-3">IP de Enlace Encriptado</th>
                    <th className="py-2 px-3">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-950 font-medium text-slate-350">
                  <tr>
                    <td className="py-2 px-3 text-slate-100 font-bold">VOR-01</td>
                    <td className="py-2 px-3 truncate max-w-[130px]">Estadio Monumental</td>
                    <td className="py-2 px-3">10.150.2.14</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">ACTIVO</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-100 font-bold">VOR-02</td>
                    <td className="py-2 px-3 truncate max-w-[130px]">Estadio Rodrigo Paz</td>
                    <td className="py-2 px-3">10.150.2.15</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">ACTIVO</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-100 font-bold">VOR-03</td>
                    <td className="py-2 px-3 truncate max-w-[130px]">Estadio George Capwell</td>
                    <td className="py-2 px-3">10.150.3.1</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">RESERVADO</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Certification Badge */}
            <div className={`p-3.5 rounded-xl border ${
              isVarFullyCertified 
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
                : "bg-amber-500/10 border-amber-500/20 text-amber-500"
            }`}>
              <div className="flex items-center space-x-2">
                {isVarFullyCertified ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span className="font-extrabold uppercase font-sans text-xs tracking-wider">CERTIFICACIÓN COMPLETA EMITIDA</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    <span className="font-extrabold uppercase font-sans text-xs tracking-wider">REVISIÓN REQUERIDA (COMUNICACIONES INTERCOM)</span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-sans leading-relaxed">
                Todas las planillas y designaciones arbitrales para el encuentro quedarían descalificadas si el comisario de juego no certifica los radio enlaces el día del clásico. Tenga cuidado.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Football pitch camera map scheme dynamic interactives */}
      <div className="bg-slate-950 border border-slate-855 rounded-2xl p-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-350">
               DISTRIBUCIÓN DE CÁMARAS EN CAMPOS DE JUEGO (ESTADIO MONUMENTAL - BSC)
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
               Haga click sobre cualquier cámara rotulada (C1-C7) en la cancha táctica para ver telemetrías y recalibrar.
            </p>
          </div>
          <span className="text-[10px] bg-slate-900 border border-slate-850 px-3 py-1 font-mono text-[#CCFF00]">
             CALIBRACION OPTICA MILIMÉTRICA
          </span>
        </div>

        {/* Tactical pitch graphics representation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Soccer pitch vector design SVG */}
          <div className="lg:col-span-2 relative bg-emerald-950 rounded-2xl border border-emerald-800 p-4 h-64 overflow-hidden flex items-center justify-center select-none shadow-xl">
            
            {/* Tactical lines of pitch rendering beautifully in inline styles */}
            <div className="absolute inset-4 border-2 border-emerald-500/30 rounded flex items-center justify-center">
              
              {/* Half-way line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-emerald-500/30"></div>
              
              {/* Center circle */}
              <div className="absolute w-20 h-20 border-2 border-emerald-500/30 rounded-full"></div>
              
              {/* Left Penalty Area */}
              <div className="absolute left-0 top-14 bottom-14 w-12 border-y-2 border-r-2 border-emerald-500/30"></div>
              
              {/* Right Penalty Area */}
              <div className="absolute right-0 top-14 bottom-14 w-12 border-y-2 border-l-2 border-emerald-500/30"></div>
              
            </div>

            {/* Camera pins on field vectors */}
            {/* Camera 1 - Main Tactic Centered */}
            <button 
              onClick={() => setSelectedCamId("cam-1")}
              className={`absolute top-4 left-1/2 -translate-x-1/2 p-2 rounded-full font-mono font-bold text-[10px] transition shadow border ${
                selectedCamId === "cam-1" ? "bg-[#CCFF00] text-slate-950 scale-110 border-white" : "bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              C1
            </button>

            {/* Camera 2 - Tactical Broadcaster bottom */}
            <button 
              onClick={() => setSelectedCamId("cam-2")}
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-full font-mono font-bold text-[10px] transition shadow border ${
                selectedCamId === "cam-2" ? "bg-[#CCFF00] text-slate-950 scale-110 border-white" : "bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              C2
            </button>

            {/* Camera 3 - Offside South Left Top */}
            <button 
              onClick={() => setSelectedCamId("cam-3")}
              className={`absolute top-4 left-8 p-2 rounded-full font-mono font-bold text-[10px] transition shadow border ${
                selectedCamId === "cam-3" ? "bg-[#CCFF00] text-slate-950 scale-110 border-white" : "bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              C3
            </button>

            {/* Camera 4 - Offside North Right top */}
            <button 
              onClick={() => setSelectedCamId("cam-4")}
              className={`absolute top-4 right-8 p-2 rounded-full font-mono font-bold text-[10px] transition shadow border ${
                selectedCamId === "cam-4" ? "bg-[#CCFF00] text-slate-950 scale-110 border-white" : "bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              C4
            </button>

            {/* Camera 5 - Goal line Left South (Faulty camera!) */}
            <button 
              onClick={() => setSelectedCamId("cam-5")}
              className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full font-mono font-bold text-[10px] transition shadow border ${
                cameras.find(c => c.id === "cam-5")?.status === "Falla de Calibración" 
                  ? "bg-rose-600 text-white animate-pulse border-red-500 scale-110"
                  : selectedCamId === "cam-5" ? "bg-[#CCFF00] text-slate-950 border-white" 
                  : "bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              C5
            </button>

            {/* Camera 6 - Goal line Right North */}
            <button 
              onClick={() => setSelectedCamId("cam-6")}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full font-mono font-bold text-[10px] transition shadow border ${
                selectedCamId === "cam-6" ? "bg-[#CCFF00] text-slate-950 scale-110 border-white" : "bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              C6
            </button>

          </div>

          {/* Camera Telemetry detailed drawer */}
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-left space-y-4">
             <div className="border-b border-slate-850 pb-2">
               <span className="text-[9px] font-mono text-[#CCFF00] uppercase block">Hardware de Barrido</span>
               <h4 className="font-black text-slate-100 text-sm">{activeCam.name}</h4>
             </div>

             <div className="space-y-1.5 text-xs">
               <div className="flex justify-between">
                 <span className="text-slate-500">Angulación física:</span>
                 <span className="font-semibold text-slate-300">{activeCam.angle}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-500">Última validación:</span>
                 <span className="font-mono text-slate-400">{activeCam.lastVerified}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-500">Estatus Operativo:</span>
                 <span className={`font-mono font-bold ${activeCam.status === "Óptimo" ? "text-[#CCFF00]" : "text-rose-500 animate-pulse"}`}>
                    {activeCam.status}
                 </span>
               </div>
             </div>

             {/* Calibration button */}
             <div className="pt-2">
               {activeCam.status !== "Óptimo" ? (
                 <button 
                   onClick={() => handleCalibrateCamera(activeCam.id)}
                   className="w-full py-2 bg-rose-600 hover:bg-emerald-500 text-white hover:text-slate-950 hover:font-black transition text-xs font-bold rounded flex items-center justify-center gap-1.5 active:scale-95"
                 >
                   <RefreshCw size={13} className="animate-spin" /> Recalibrar Lentes de Alta Velocidad (C5)
                 </button>
               ) : (
                 <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-[10px] font-mono uppercase font-bold rounded">
                    LENTES DE BARRIDO CALIBRADOS: OK
                 </div>
               )}
             </div>
          </div>

        </div>

      </div>

    </div>
  );
}
