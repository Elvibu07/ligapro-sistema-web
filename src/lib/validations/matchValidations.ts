/**
 * Validaciones de Negocio — Módulo 2: PROGRAMACIÓN DE PARTIDOS
 * Reglamento de Competiciones LIGAPRO
 */
import type { ValidationResult } from './types';
import type { Match, JornadaFifa } from '../../types';

/**
 * VALIDACIÓN 2.1 — Fecha en el pasado (CRÍTICA)
 * No se puede programar un partido en una fecha anterior a la fecha actual.
 */
export function validateMatchDateNotInPast(matchDate: string): ValidationResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(matchDate + 'T00:00:00');

  if (selected < today) {
    return {
      valid: false,
      ruleCode: '2.1',
      message: 'La fecha ingresada ya pasó. Por favor selecciona una fecha futura para programar el partido.',
      details: { selectedDate: matchDate, serverDate: today.toISOString().split('T')[0] },
    };
  }
  return { valid: true, message: 'Fecha válida.', ruleCode: '2.1' };
}

/**
 * VALIDACIÓN 2.2 — Notificación mínima de 15 días (Art. 25)
 * La fecha del partido debe ser al menos 15 días calendario posterior a la fecha actual.
 */
export function validateMatch15DayNotice(matchDate: string): ValidationResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(matchDate + 'T00:00:00');

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 15);

  if (selected < minDate) {
    const minDateStr = minDate.toISOString().split('T')[0];
    return {
      valid: false,
      ruleCode: '2.2',
      article: 'Art. 25',
      message: `La fecha seleccionada no cumple el plazo mínimo de 15 días de anticipación exigido por el Reglamento LIGAPRO (Art. 25). La fecha mínima permitida es: ${minDateStr}.`,
      details: { selectedDate: matchDate, minimumDate: minDateStr },
    };
  }
  return { valid: true, message: 'Plazo de 15 días cumplido.', ruleCode: '2.2', article: 'Art. 25' };
}

/**
 * VALIDACIÓN 2.3 — Jornada FIFA bloqueada para Serie A (Art. 26)
 * No se pueden programar partidos de Serie A durante fechas FIFA.
 * Esta restricción NO aplica para Serie B.
 */
export function validateMatchNotOnFifaDate(
  matchDate: string,
  serie: 'A' | 'B',
  jornadasFifa: JornadaFifa[]
): ValidationResult {
  // Solo aplica para Serie A
  if (serie !== 'A') {
    return { valid: true, message: 'Serie B no tiene restricción de fechas FIFA.', ruleCode: '2.3' };
  }

  const selected = new Date(matchDate + 'T00:00:00');

  for (const jornada of jornadasFifa) {
    const start = new Date(jornada.startDate + 'T00:00:00');
    const end = new Date(jornada.endDate + 'T23:59:59');

    if (selected >= start && selected <= end) {
      return {
        valid: false,
        ruleCode: '2.3',
        article: 'Art. 26',
        message: 'No es posible programar partidos de Serie A en esta fecha. Corresponde a una Jornada FIFA. Para Serie B esta restricción no aplica.',
        details: {
          matchDate,
          fifaPeriod: `${jornada.startDate} - ${jornada.endDate}`,
          description: jornada.description,
        },
      };
    }
  }

  return { valid: true, message: 'Fecha no coincide con jornada FIFA.', ruleCode: '2.3', article: 'Art. 26' };
}

/**
 * VALIDACIÓN 2.4 — Horario unificado en últimas dos fechas (Art. 27)
 * Todos los partidos de las dos últimas fechas de cualquier fase deben tener el mismo horario.
 */
export function validateUnifiedSchedule(
  matchRound: number,
  matchTime: string,
  totalRoundsInPhase: number,
  otherMatchesInSameRound: Match[]
): ValidationResult {
  // Check if this round is one of the last 2 rounds in the phase
  const isLastTwoRounds = matchRound >= totalRoundsInPhase - 1;

  if (!isLastTwoRounds) {
    return { valid: true, message: 'No aplica horario unificado para esta jornada.', ruleCode: '2.4' };
  }

  // Check if other matches in the same round have a different time
  const existingTimes = otherMatchesInSameRound
    .filter(m => m.round === matchRound)
    .map(m => m.time);

  if (existingTimes.length > 0) {
    const requiredTime = existingTimes[0];
    if (matchTime !== requiredTime) {
      return {
        valid: false,
        ruleCode: '2.4',
        article: 'Art. 27',
        message: `Esta fecha corresponde a una jornada con Horario Unificado. Todos los partidos deben iniciar a la misma hora. Ajusta el horario para que coincida con los demás partidos de esta jornada.`,
        details: {
          round: matchRound,
          requiredTime,
          attemptedTime: matchTime,
          totalRounds: totalRoundsInPhase,
        },
      };
    }
  }

  return { valid: true, message: 'Horario unificado cumplido.', ruleCode: '2.4', article: 'Art. 27' };
}

/**
 * VALIDACIÓN 2.5 — Postergación por partido internacional (48h / máx 24h) (Art. 28a)
 * Solo se permite postergar si el club tiene un partido internacional dentro de las 48 horas.
 * La nueva fecha no puede diferir más de 24 horas.
 */
export function validatePostponement(
  originalDate: string,
  originalTime: string,
  proposedDate: string,
  proposedTime: string,
  hasDocument: boolean
): ValidationResult {
  // Require documentation
  if (!hasDocument) {
    return {
      valid: false,
      ruleCode: '2.5',
      article: 'Art. 28a',
      message: 'La postergación solo puede aplicarse si existe un partido internacional CONMEBOL/FIFA dentro de las 48 horas del partido. La nueva fecha no puede diferir más de 24 horas de la fecha original.',
      details: { reason: 'Falta documentación adjunta' },
    };
  }

  // Calculate the difference in hours between original and proposed dates
  const originalDT = new Date(`${originalDate}T${originalTime}:00`);
  const proposedDT = new Date(`${proposedDate}T${proposedTime}:00`);
  const diffMs = Math.abs(proposedDT.getTime() - originalDT.getTime());
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours > 24) {
    return {
      valid: false,
      ruleCode: '2.5',
      article: 'Art. 28a',
      message: `La postergación solo puede aplicarse si existe un partido internacional CONMEBOL/FIFA dentro de las 48 horas del partido. La nueva fecha no puede diferir más de 24 horas de la fecha original.`,
      details: {
        originalDateTime: `${originalDate} ${originalTime}`,
        proposedDateTime: `${proposedDate} ${proposedTime}`,
        differenceHours: Math.round(diffHours * 10) / 10,
        maxHours: 24,
      },
    };
  }

  return { valid: true, message: 'Postergación dentro de los parámetros permitidos.', ruleCode: '2.5', article: 'Art. 28a' };
}
