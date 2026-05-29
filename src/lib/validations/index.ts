/**
 * Barrel export para el sistema de validación LIGAPRO.
 */

// Types
export type { ValidationResult, ValidationBatchResult } from './types';
export { runValidations } from './types';

// Club validations (Module 1)
export {
  validateClubHasMedico,
  validateClubHasDT,
  validateClubEconomicApproval,
  validateClubNoActiveSanction,
  validateClubMinPlayers,
  validateClubHomeStadium,
} from './clubValidations';

// Match validations (Module 2)
export {
  validateMatchDateNotInPast,
  validateMatch15DayNotice,
  validateMatchNotOnFifaDate,
  validateUnifiedSchedule,
  validatePostponement,
} from './matchValidations';

// Match sheet validations (Module 3)
export {
  validateMinimumPlayers,
  validateMaximumPlayers,
  validateMaximumStaff,
  validateMandatoryStaff,
  validateSheetDeliveryTime,
  validateDTSignature,
  validateSubstitutionLimit,
  validateSubstitutionMoments,
  validatePlayerNotSubstituted,
} from './matchSheetValidations';

// FIFA dates
export { FIFA_DATES_2026 } from './fifaDates';
