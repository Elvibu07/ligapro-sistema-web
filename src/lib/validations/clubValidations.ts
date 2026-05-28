/**
 * Validaciones de Negocio — Módulo 1: CLUBES
 * Reglamento de Competiciones LIGAPRO
 */
import type { ValidationResult } from './types';
import type { ClubStaff, ClubEconomicApproval, Sanction } from '../../types';

/**
 * VALIDACIÓN 1.1 — Médico obligatorio
 * El club debe tener al menos un médico registrado y habilitado.
 */
export function validateClubHasMedico(clubStaff: ClubStaff[]): ValidationResult {
  const activeMedicos = clubStaff.filter(
    s => s.role === 'Médico' && s.status === 'Activo'
  );
  if (activeMedicos.length === 0) {
    return {
      valid: false,
      ruleCode: '1.1',
      message: 'No se puede continuar. El club no tiene un médico registrado y habilitado. Registra al médico antes de proceder.',
      details: { staffCount: clubStaff.length, medicosActivos: 0 },
    };
  }
  return { valid: true, message: 'Médico registrado correctamente.', ruleCode: '1.1' };
}

/**
 * VALIDACIÓN 1.2 — Director Técnico obligatorio
 * El club debe tener un DT registrado y habilitado.
 */
export function validateClubHasDT(clubStaff: ClubStaff[]): ValidationResult {
  const activeDTs = clubStaff.filter(
    s => s.role === 'Director Técnico' && s.status === 'Activo'
  );
  if (activeDTs.length === 0) {
    return {
      valid: false,
      ruleCode: '1.2',
      message: 'No se puede continuar. El club no tiene un Director Técnico registrado. Registra al DT antes de proceder.',
      details: { staffCount: clubStaff.length, dtsActivos: 0 },
    };
  }
  return { valid: true, message: 'Director Técnico registrado correctamente.', ruleCode: '1.2' };
}

/**
 * VALIDACIÓN 1.3 — Aprobación económica
 * El club debe tener aprobación de la Dirección de Control Económico.
 */
export function validateClubEconomicApproval(
  approval: ClubEconomicApproval | null | undefined
): ValidationResult {
  if (!approval || !approval.approved) {
    return {
      valid: false,
      ruleCode: '1.3',
      message: 'El club no puede ser habilitado. Falta la aprobación de la Dirección de Control Económico.',
      details: { approval: approval ?? null },
    };
  }
  return { valid: true, message: 'Aprobación económica vigente.', ruleCode: '1.3' };
}

/**
 * VALIDACIÓN 1.4 — Sanción activa
 * El club no debe tener sanciones o suspensiones activas.
 */
export function validateClubNoActiveSanction(
  sanctions: Sanction[],
  clubName: string
): ValidationResult {
  const activeSanctions = sanctions.filter(
    s =>
      s.targetType === 'Club' &&
      (s.clubName === clubName || s.targetName === clubName) &&
      !s.resolved
  );

  if (activeSanctions.length > 0) {
    const sanction = activeSanctions[0];
    const endDateStr = sanction.endDate || 'No definida';
    return {
      valid: false,
      ruleCode: '1.4',
      message: `Este club tiene una sanción activa que impide su participación. Sanción: ${sanction.offense}. Fecha de término: ${endDateStr}.`,
      details: {
        sanctionId: sanction.id,
        offense: sanction.offense,
        severity: sanction.severity,
        endDate: endDateStr,
      },
    };
  }
  return { valid: true, message: 'Sin sanciones activas.', ruleCode: '1.4' };
}

/**
 * VALIDACIÓN 1.5 — Cesión de localía prohibida
 * Ningún club puede ceder su localía a otro club.
 * Se verifica que el estadio asignado al partido corresponda al estadio sede del club local.
 */
export function validateClubHomeStadium(
  clubStadiumName: string,
  assignedStadiumName: string
): ValidationResult {
  // Normalize for comparison (trim, lowercase)
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  
  const clubNorm = normalize(clubStadiumName);
  const assignedNorm = normalize(assignedStadiumName);

  // Check if they refer to the same stadium (partial match to handle naming variations)
  const isMatch =
    clubNorm === assignedNorm ||
    clubNorm.includes(assignedNorm) ||
    assignedNorm.includes(clubNorm);

  if (!isMatch && clubStadiumName && assignedStadiumName) {
    return {
      valid: false,
      ruleCode: '1.5',
      message: 'Operación no permitida. Los clubes no pueden ceder la localía bajo ningún motivo según el Reglamento de Competiciones LIGAPRO.',
      details: {
        clubStadium: clubStadiumName,
        assignedStadium: assignedStadiumName,
      },
    };
  }
  return { valid: true, message: 'Localía válida.', ruleCode: '1.5' };
}
