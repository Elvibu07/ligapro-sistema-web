/**
 * Tipos base para el sistema de validación LIGAPRO.
 */

export interface ValidationResult {
  valid: boolean;
  message: string;
  /** Código de regla del reglamento, e.g. "1.1", "2.3" */
  ruleCode?: string;
  /** Artículo del reglamento LIGAPRO */
  article?: string;
  /** Detalles adicionales para el log de auditoría */
  details?: Record<string, any>;
}

/** Resultado con múltiples validaciones ejecutadas */
export interface ValidationBatchResult {
  allValid: boolean;
  results: ValidationResult[];
  /** Primera validación fallida (si alguna) */
  firstError?: ValidationResult;
}

/**
 * Ejecuta múltiples validaciones y retorna resultado batch.
 */
export function runValidations(...results: ValidationResult[]): ValidationBatchResult {
  const failures = results.filter(r => !r.valid);
  return {
    allValid: failures.length === 0,
    results,
    firstError: failures[0],
  };
}
