/**
 * @powerlift/engines/autoreg/autoregulationEngine
 * Intra-session autoregulation and set-to-set load adaptation engine.
 * Pure deterministic calculation.
 */

export interface AutoregInput {
  targetLoadKg: number;
  targetReps: number;
  targetRpe: number;
  actualReps: number;
  actualRpe: number;
  minIncrementKg?: number;
}

export interface AutoregResult {
  status: 'on_target' | 'overshot' | 'undershot';
  rpeDeviation: number;
  repDeviation: number;
  nextLoadKg: number;
  loadAdjustmentPct: number;
  actionAdvice: string;
}

export function autoregulateNextSet(input: AutoregInput): AutoregResult {
  const {
    targetLoadKg,
    targetReps,
    targetRpe,
    actualReps,
    actualRpe,
    minIncrementKg = 2.5
  } = input;

  const rpeDeviation = actualRpe - targetRpe;
  const repDeviation = actualReps - targetReps;

  // Each 1.0 RPE deviation maps to approx 2.5% load delta in standard 7-9 RPE powerlifting zones
  let deltaPct = 0;

  if (repDeviation < 0) {
    // Missed target reps -> significant fatigue
    deltaPct = -5.0 + repDeviation * 2.5;
  } else if (rpeDeviation > 0.5) {
    // Overshot target RPE -> drop weight
    deltaPct = -rpeDeviation * 2.5;
  } else if (rpeDeviation < -0.5 && repDeviation >= 0) {
    // Undershot target RPE -> add weight
    deltaPct = Math.abs(rpeDeviation) * 2.0;
  }

  // Cap adjustments to safe boundaries (-15% to +7.5%)
  deltaPct = Math.max(-15, Math.min(7.5, deltaPct));

  const rawNextLoad = targetLoadKg * (1 + deltaPct / 100);
  // Round to nearest plate increment
  const nextLoadKg = Math.round(rawNextLoad / minIncrementKg) * minIncrementKg;

  let status: 'on_target' | 'overshot' | 'undershot' = 'on_target';
  let actionAdvice = 'Pacing is on target. Maintain working weight for next set.';

  if (deltaPct < -1.0) {
    status = 'overshot';
    actionAdvice = `Fatigue elevated (+${rpeDeviation.toFixed(1)} RPE). Drop to ${nextLoadKg} kg to preserve velocity and prevent technical breakdown.`;
  } else if (deltaPct > 1.0) {
    status = 'undershot';
    actionAdvice = `Bar speed exceptionally high (-${Math.abs(rpeDeviation).toFixed(1)} RPE). Increase to ${nextLoadKg} kg to reach target stimulus.`;
  }

  return {
    status,
    rpeDeviation: Math.round(rpeDeviation * 10) / 10,
    repDeviation,
    nextLoadKg: Math.max(minIncrementKg, nextLoadKg),
    loadAdjustmentPct: Math.round(deltaPct * 10) / 10,
    actionAdvice
  };
}
