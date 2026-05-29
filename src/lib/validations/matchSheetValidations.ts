/**
 * Validaciones de Negocio — Módulo 3: PLANILLAS DE JUEGO
 * Reglamento de Competiciones LIGAPRO
 */
import type { ValidationResult } from './types';

/**
 * VALIDACIÓN 3.1 — Mínimo 7 jugadores identificados para iniciar (Art. 47)
 */
export function validateMinimumPlayers(identifiedCount: number): ValidationResult {
  if (identifiedCount < 7) {
    return {
      valid: false,
      ruleCode: '3.1',
      article: 'Art. 47',
      message: `El partido no puede iniciarse. Se requiere un mínimo de 7 jugadores identificados. Actualmente hay ${identifiedCount} jugadores identificados.`,
      details: { current: identifiedCount, minimum: 7 },
    };
  }
  return { valid: true, message: 'Mínimo de jugadores cumplido.', ruleCode: '3.1', article: 'Art. 47' };
}

/**
 * VALIDACIÓN 3.2 — Máximo 23 jugadores en planilla (Art. 45)
 * 11 titulares + 12 suplentes = 23 máximo.
 */
export function validateMaximumPlayers(totalCount: number): ValidationResult {
  if (totalCount >= 23) {
    return {
      valid: false,
      ruleCode: '3.2',
      article: 'Art. 45',
      message: 'No puedes agregar más jugadores. La planilla admite un máximo de 23 jugadores (11 titulares + 12 suplentes).',
      details: { current: totalCount, maximum: 23 },
    };
  }
  return { valid: true, message: 'Límite de jugadores dentro del rango.', ruleCode: '3.2', article: 'Art. 45' };
}

/**
 * VALIDACIÓN 3.3 — Máximo 10 personas de staff en planilla (Art. 45)
 */
export function validateMaximumStaff(staffCount: number): ValidationResult {
  if (staffCount >= 10) {
    return {
      valid: false,
      ruleCode: '3.3',
      article: 'Art. 45',
      message: 'No puedes agregar más integrantes al staff. El máximo permitido es 10 personas entre cuerpo técnico y staff técnico.',
      details: { current: staffCount, maximum: 10 },
    };
  }
  return { valid: true, message: 'Staff dentro del límite.', ruleCode: '3.3', article: 'Art. 45' };
}

/**
 * VALIDACIÓN 3.3b — Staff Obligatorio (Art. 45 y 63)
 * Se requiere obligatoriamente un Médico y un Director Técnico.
 */
export function validateMandatoryStaff(staffList: any[]): ValidationResult {
  const hasMedico = staffList.some(s => s.role === 'Médico');
  const hasDT = staffList.some(s => s.role === 'Director Técnico');
  
  if (!hasMedico || !hasDT) {
    const missing = [];
    if (!hasMedico) missing.push('Médico');
    if (!hasDT) missing.push('Director Técnico');
    
    return {
      valid: false,
      ruleCode: '3.3b',
      article: 'Art. 45',
      message: `La planilla de juego no puede ser aprobada sin el personal técnico obligatorio. Falta registrar: ${missing.join(' y ')}.`,
      details: { hasMedico, hasDT },
    };
  }
  return { valid: true, message: 'Personal técnico obligatorio presente.', ruleCode: '3.3b', article: 'Art. 45' };
}

/**
 * VALIDACIÓN 3.4 — Entrega con 70 minutos de anticipación (Art. 45)
 * La planilla debe entregarse al menos 70 minutos antes del inicio del partido.
 */
export function validateSheetDeliveryTime(
  matchDate: string,
  matchTime: string
): ValidationResult {
  const matchDT = new Date(`${matchDate}T${matchTime}:00`);
  const now = new Date();
  const diffMs = matchDT.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes < 70) {
    return {
      valid: false,
      ruleCode: '3.4',
      article: 'Art. 45',
      message: 'Atención: el tiempo límite para entregar la planilla ha vencido (70 minutos antes del partido). El club queda en riesgo de perder el partido por incomparecencia (3-0).',
      details: {
        matchDateTime: `${matchDate} ${matchTime}`,
        currentTime: now.toISOString(),
        minutesRemaining: Math.round(diffMinutes),
        requiredMinutes: 70,
      },
    };
  }
  return { valid: true, message: 'Planilla entregada a tiempo.', ruleCode: '3.4', article: 'Art. 45' };
}

/**
 * VALIDACIÓN 3.5 — Firma del Director Técnico obligatoria (Art. 45)
 * La planilla no puede entregarse sin el nombre y firma del DT.
 */
export function validateDTSignature(
  dtName: string,
  isSigned: boolean
): ValidationResult {
  if (!dtName.trim()) {
    return {
      valid: false,
      ruleCode: '3.5',
      article: 'Art. 45',
      message: 'La planilla no tiene la firma del Director Técnico. Tienes 10 minutos para corregirlo antes de que el partido sea declarado perdido.',
      details: { hasDTName: false, isSigned: false },
    };
  }
  if (!isSigned) {
    return {
      valid: false,
      ruleCode: '3.5',
      article: 'Art. 45',
      message: 'La planilla no tiene la firma del Director Técnico. Tienes 10 minutos para corregirlo antes de que el partido sea declarado perdido.',
      details: { hasDTName: true, isSigned: false },
    };
  }
  return { valid: true, message: 'Firma del DT presente.', ruleCode: '3.5', article: 'Art. 45' };
}

/**
 * VALIDACIÓN 3.6 — Máximo 5 sustituciones por partido (Disposición Cuarta)
 * Cada equipo puede hacer máximo 5 sustituciones, en no más de 3 momentos distintos.
 */
export function validateSubstitutionLimit(subsCount: number): ValidationResult {
  if (subsCount >= 5) {
    return {
      valid: false,
      ruleCode: '3.6',
      message: 'No puedes realizar más sustituciones. Este equipo ya utilizó las 5 sustituciones permitidas.',
      details: { substitutionsMade: subsCount, maximum: 5 },
    };
  }
  return { valid: true, message: 'Sustituciones disponibles.', ruleCode: '3.6' };
}

/**
 * VALIDACIÓN 3.6b — Máximo 3 momentos de sustitución
 */
export function validateSubstitutionMoments(momentsUsed: number): ValidationResult {
  if (momentsUsed >= 3) {
    return {
      valid: false,
      ruleCode: '3.6',
      message: 'No puedes realizar más sustituciones en este momento. Ya se utilizaron los 3 momentos permitidos para hacer cambios.',
      details: { momentsUsed, maximumMoments: 3 },
    };
  }
  return { valid: true, message: 'Momentos de sustitución disponibles.', ruleCode: '3.6' };
}

/**
 * VALIDACIÓN 3.7 — Jugador sustituido no puede volver a jugar
 */
export function validatePlayerNotSubstituted(
  playerId: string,
  playerName: string,
  substitutedPlayerIds: string[]
): ValidationResult {
  if (substitutedPlayerIds.includes(playerId)) {
    return {
      valid: false,
      ruleCode: '3.7',
      message: 'Este jugador ya fue sustituido y no puede volver a ingresar al campo en este partido.',
      details: { playerId, playerName },
    };
  }
  return { valid: true, message: 'Jugador elegible para ingresar.', ruleCode: '3.7' };
}
