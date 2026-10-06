/**
 * @powerlift/engines/e1rm
 * Pure sports-science 1RM formulas and RPE conversion algorithms.
 * Completely deterministic with ZERO external dependencies or I/O.
 */

export type E1rmFormula = 'brzycki' | 'epley' | 'wathan' | 'lombardi';

export interface E1rmOptions {
  loadKg: number;
  reps: number;
  rpe?: number;
  formula?: E1rmFormula;
}

export interface E1rmResult {
  e1rmKg: number;
  effectiveReps: number;
  formula: E1rmFormula;
}

/**
 * Calculate effective reps considering RPE.
 * effectiveReps = reps + (10 - RPE)
 * E.g., 5 reps @ RPE 8 = 7 effective reps to failure.
 */
export function calculateEffectiveReps(reps: number, rpe = 10): number {
  if (reps <= 0) return 0;
  const clampedRpe = Math.min(10, Math.max(5, rpe));
  const rir = 10 - clampedRpe;
  return reps + rir;
}

/**
 * Calculate estimated 1RM using standard powerlifting equations.
 */
export function calculateE1RM({
  loadKg,
  reps,
  rpe = 10,
  formula = 'brzycki'
}: E1rmOptions): E1rmResult {
  if (loadKg <= 0 || reps <= 0) {
    return { e1rmKg: 0, effectiveReps: 0, formula };
  }

  const effectiveReps = calculateEffectiveReps(reps, rpe);

  // If a single rep @ RPE 10 was performed, e1RM is exactly the load
  if (effectiveReps <= 1) {
    return { e1rmKg: Math.round(loadKg * 10) / 10, effectiveReps: 1, formula };
  }

  let e1rm = 0;

  switch (formula) {
    case 'epley':
      // Epley: Load * (1 + 0.0333 * reps)
      e1rm = loadKg * (1 + 0.0333 * effectiveReps);
      break;

    case 'wathan':
      // Wathan: (100 * Load) / (48.8 + 53.8 * e^(-0.075 * reps))
      e1rm = (100 * loadKg) / (48.8 + 53.8 * Math.exp(-0.075 * effectiveReps));
      break;

    case 'lombardi':
      // Lombardi: Load * reps^0.10
      e1rm = loadKg * Math.pow(effectiveReps, 0.10);
      break;

    case 'brzycki':
    default:
      // Brzycki: Load / (1.0278 - 0.0278 * reps)
      const denominator = 1.0278 - 0.0278 * effectiveReps;
      e1rm = denominator > 0 ? loadKg / denominator : loadKg * 1.5;
      break;
  }

  return {
    e1rmKg: Math.round(e1rm * 10) / 10,
    effectiveReps,
    formula
  };
}

/**
 * Predict training load given target reps, target RPE, and true 1RM.
 */
export function calculateTargetLoad(oneRepMaxKg: number, targetReps: number, targetRpe = 8): number {
  if (oneRepMaxKg <= 0 || targetReps <= 0) return 0;
  const effectiveReps = calculateEffectiveReps(targetReps, targetRpe);
  // Invert Brzycki: Load = 1RM * (1.0278 - 0.0278 * effectiveReps)
  const factor = Math.max(0.4, 1.0278 - 0.0278 * effectiveReps);
  const rawLoad = oneRepMaxKg * factor;
  // Round to nearest 2.5kg standard plate increment
  return Math.round(rawLoad / 2.5) * 2.5;
}
