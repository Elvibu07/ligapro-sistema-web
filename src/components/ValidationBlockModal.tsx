import React from "react";
import { ShieldAlert, X, AlertTriangle, Info } from "lucide-react";
import type { ValidationResult } from "../lib/validations/types";

interface ValidationBlockModalProps {
  /** The validation result to display */
  validation: ValidationResult | null;
  /** Callback to close the modal */
  onClose: () => void;
  /** Optional: severity style override */
  severity?: "error" | "warning" | "info";
}

/**
 * Modal de bloqueo de validación LIGAPRO.
 * Reemplaza los alert() nativos con un modal profesional, elegante y consistente.
 * Muestra el artículo del reglamento, el mensaje de error y la acción sugerida.
 */
export default function ValidationBlockModal({
  validation,
  onClose,
  severity = "error",
}: ValidationBlockModalProps) {
  if (!validation) return null;

  const isWarning = severity === "warning";
  const isInfo = severity === "info";

  const borderColor = isInfo
    ? "border-blue-500/30"
    : isWarning
    ? "border-amber-500/30"
    : "border-red-500/30";

  const iconBg = isInfo
    ? "bg-blue-500/10"
    : isWarning
    ? "bg-amber-500/10"
    : "bg-red-500/10";

  const iconColor = isInfo
    ? "text-blue-400"
    : isWarning
    ? "text-amber-400"
    : "text-red-400";

  const headerBg = isInfo
    ? "from-blue-500/5 to-transparent"
    : isWarning
    ? "from-amber-500/5 to-transparent"
    : "from-red-500/5 to-transparent";

  const Icon = isInfo ? Info : isWarning ? AlertTriangle : ShieldAlert;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div
        className={`bg-slate-950 border ${borderColor} rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-left`}
        style={{
          animation: "modalSlideIn 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          className={`bg-gradient-to-b ${headerBg} px-5 py-4 border-b border-slate-800/60 flex items-start justify-between`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}
            >
              <Icon size={20} className={iconColor} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  Reglamento LIGAPRO
                </span>
                {validation.ruleCode && (
                  <span
                    className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${iconBg} ${iconColor}`}
                  >
                    Regla {validation.ruleCode}
                  </span>
                )}
                {validation.article && (
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {validation.article}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-slate-100">
                {isInfo
                  ? "Información"
                  : isWarning
                  ? "Advertencia de Validación"
                  : "Operación Bloqueada"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {validation.message}
          </p>

          {/* Details section */}
          {validation.details &&
            Object.keys(validation.details).length > 0 && (
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/50">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                  Detalles Técnicos
                </span>
                <div className="space-y-1">
                  {Object.entries(validation.details).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between text-[10px] font-mono"
                    >
                      <span className="text-slate-500">{key}:</span>
                      <span className="text-slate-300 font-bold">
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/40 px-5 py-3 border-t border-slate-800/40 flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-600 select-none">
            Registro de auditoría generado automáticamente
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 font-extrabold rounded-lg text-xs transition active:scale-95 ${
              isInfo
                ? "bg-blue-500 text-slate-950 hover:bg-blue-400"
                : isWarning
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-red-500 text-white hover:bg-red-400"
            }`}
          >
            Entendido
          </button>
        </div>
      </div>

      {/* Inline keyframes for animation */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
