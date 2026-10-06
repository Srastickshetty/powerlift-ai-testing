/**
 * @powerlift/engines/bodybuilding/intensityTechniquesGating
 * Gating and volume limits for bodybuilding advanced intensity techniques:
 * drop sets, rest-pause, myo-reps, lengthened partials.
 * Pure deterministic calculations.
 */

export type IntensityTechnique = 'drop_set' | 'rest_pause' | 'myo_reps' | 'lengthened_partials';

export interface GatingDecision {
  allowed: boolean;
  maxSetsPerWeek: number;
  reason: string;
  allowedExercisesFilter: 'machines_cables_only' | 'isolations_only' | 'none';
}

export function evaluateIntensityTechniqueGating(
  technique: IntensityTechnique,
  trainingAgeYears: number,
  isDeloadWeek: boolean,
  isAxialCompound = false // e.g. Barbell Squat, Deadlift, Bent Over Row
): GatingDecision {
  if (isDeloadWeek) {
    return {
      allowed: false,
      maxSetsPerWeek: 0,
      reason: 'Deload week active: Intensity techniques are strictly disabled to permit systemic nervous system recovery.',
      allowedExercisesFilter: 'none'
    };
  }

  if (isAxialCompound) {
    return {
      allowed: false,
      maxSetsPerWeek: 0,
      reason: 'Technique disallowed on free barbell compound lifts with heavy axial loading to prevent lumbar breakdown.',
      allowedExercisesFilter: 'none'
    };
  }

  if (trainingAgeYears < 1.5) {
    return {
      allowed: false,
      maxSetsPerWeek: 0,
      reason: 'Gated: Athletes with <1.5 years of training age achieve maximal hypertrophic adaptations from pristine straight sets without excessive peripheral fatigue.',
      allowedExercisesFilter: 'none'
    };
  }

  if (trainingAgeYears < 3.0) {
    return {
      allowed: true,
      maxSetsPerWeek: 1,
      reason: 'Intermediate lifter unlocked: Permitted on final set of machine or cable movements (max 1 set per muscle group per week).',
      allowedExercisesFilter: 'machines_cables_only'
    };
  }

  // Advanced lifter (>= 3 years)
  return {
    allowed: true,
    maxSetsPerWeek: 2,
    reason: 'Advanced lifter unlocked: Permitted on final sets of machine or isolation movements (max 2 sets per muscle group per week).',
    allowedExercisesFilter: 'machines_cables_only'
  };
}
