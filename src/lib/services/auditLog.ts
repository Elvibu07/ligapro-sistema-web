/**
 * Servicio de Auditoría LIGAPRO
 * Registra cada validación bloqueada con fecha, hora, usuario y motivo.
 */
import { supabase } from '../supabase';
import type { AuditLogEntry } from '../../types';

const STORAGE_KEY = 'ligapro-audit-log';

/**
 * Registra una entrada de auditoría en Supabase (o localStorage como fallback).
 */
export async function logAuditEntry(entry: AuditLogEntry): Promise<void> {
  const row = {
    action: entry.action,
    module: entry.module,
    user_email: entry.userEmail,
    reason: entry.reason,
    details: entry.details ?? {},
  };

  try {
    const { error } = await supabase.from('audit_log').insert(row);
    if (error) throw error;
  } catch (e: any) {
    console.warn('[Auditoría] Fallback a localStorage:', e.message);
    // Fallback to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      existing.push({ ...row, created_at: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // Silent fail
    }
  }
}

/**
 * Helper para registrar un bloqueo de validación.
 */
export async function logValidationBlock(
  ruleCode: string,
  module: string,
  userEmail: string,
  message: string,
  details?: Record<string, any>
): Promise<void> {
  return logAuditEntry({
    action: `VALIDACIÓN_BLOQUEADA [${ruleCode}]`,
    module,
    userEmail,
    reason: message,
    details: { ruleCode, ...details },
  });
}
