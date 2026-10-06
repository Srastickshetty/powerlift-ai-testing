/**
 * @powerlift/engines/powerlifting/volumeFatigueEngine
 * Sports science INOL (Intensity Number of Lifts), tonnage, and fatigue index calculation.
 * Pure deterministic calculations.
 */

export interface SetIntensityInput {
  loadKg: number;
  reps: number;
  oneRepMaxKg: number;
  rpe?: number;
}

export interface InolResult {
  setInol: number;
  intensityPercent: number;
}

export interface SessionVolumeMetrics {
  totalTonnageKg: number;
  totalReps: number;
  totalInol: number;
  inolRating: 'underload' | 'optimal' | 'tough' | 'excessive';
  rpeDrift: number;
}

/**
 * Calculate single set INOL: reps / (100 - intensityPercent)
 */
export function calculateSetInol(reps: number, loadKg: number, oneRepMaxKg: number): InolResult {
  if (oneRepMaxKg <= 0 || loadKg <= 0 || reps <= 0) {
    return { setInol: 0, intensityPercent: 0 };
  }

  const intensityPercent = Math.min(100, Math.max(0, (loadKg / oneRepMaxKg) * 100));

  // If intensity is >= 100%, cap denominator at 1 to prevent division by zero
  const denom = Math.max(1, 100 - intensityPercent);
  const setInol = Math.round((reps / denom) * 1000) / 1000;

  return {
    setInol,
    intensityPercent: Math.round(intensityPercent * 10) / 10
  };
}

/**
 * Calculate session-level volume, INOL, and RPE drift
 */
export function calculateSessionVolumeMetrics(sets: SetIntensityInput[]): SessionVolumeMetrics {
  if (!sets || sets.length === 0) {
    return {
      totalTonnageKg: 0,
      totalReps: 0,
      totalInol: 0,
      inolRating: 'underload',
      rpeDrift: 0
    };
  }

  let totalTonnageKg = 0;
  let totalReps = 0;
  let totalInol = 0;
  const workingRpes: number[] = [];

  for (const s of sets) {
    if (s.loadKg > 0 && s.reps > 0) {
      totalTonnageKg += s.loadKg * s.reps;
      totalReps += s.reps;

      if (s.oneRepMaxKg > 0) {
        const { setInol } = calculateSetInol(s.reps, s.loadKg, s.oneRepMaxKg);
        totalInol += setInol;
      }

      if (typeof s.rpe === 'number' && s.rpe >= 6) {
        workingRpes.push(s.rpe);
      }
    }
  }

  // Calculate RPE drift between first working set and last working set
  let rpeDrift = 0;
  if (workingRpes.length >= 2) {
    rpeDrift = Math.round((workingRpes[workingRpes.length - 1] - workingRpes[0]) * 10) / 10;
  }

  // Session INOL rating based on Hales / Prilepin standards
  let inolRating: SessionVolumeMetrics['inolRating'] = 'optimal';
  if (totalInol < 0.4) {
    inolRating = 'underload';
  } else if (totalInol <= 1.0) {
    inolRating = 'optimal';
  } else if (totalInol <= 1.8) {
    inolRating = 'tough';
  } else {
    inolRating = 'excessive';
  }

  return {
    totalTonnageKg: Math.round(totalTonnageKg * 10) / 10,
    totalReps,
    totalInol: Math.round(totalInol * 100) / 100,
    inolRating,
    rpeDrift
  };
}
