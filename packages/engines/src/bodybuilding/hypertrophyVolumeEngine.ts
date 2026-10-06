/**
 * @powerlift/engines/bodybuilding/hypertrophyVolumeEngine
 * Hypertrophy volume landmarks (MV, MEV, MAV, MRV) and Volume Radar analysis.
 * Based on Dr. Mike Israetel & Schoenfeld sports science models.
 * Pure deterministic calculations.
 */

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'quads'
  | 'hamstrings'
  | 'side_delts'
  | 'rear_delts'
  | 'triceps'
  | 'biceps'
  | 'calves'
  | 'abs';

export interface VolumeLandmark {
  mv: number;  // Maintenance Volume (sets/week)
  mev: number; // Minimum Effective Volume (sets/week)
  mavMin: number; // Maximum Adaptive Volume Lower (sets/week)
  mavMax: number; // Maximum Adaptive Volume Upper (sets/week)
  mrv: number; // Maximum Recoverable Volume (sets/week)
}

export const VOLUME_LANDMARKS: Record<MuscleGroup, VolumeLandmark> = {
  chest:      { mv: 6, mev: 10, mavMin: 12, mavMax: 20, mrv: 22 },
  back:       { mv: 8, mev: 10, mavMin: 14, mavMax: 22, mrv: 25 },
  quads:      { mv: 6, mev: 8,  mavMin: 12, mavMax: 18, mrv: 20 },
  hamstrings: { mv: 4, mev: 6,  mavMin: 10, mavMax: 16, mrv: 20 },
  side_delts: { mv: 6, mev: 8,  mavMin: 16, mavMax: 22, mrv: 26 },
  rear_delts: { mv: 6, mev: 8,  mavMin: 12, mavMax: 18, mrv: 22 },
  triceps:    { mv: 4, mev: 6,  mavMin: 10, mavMax: 14, mrv: 18 },
  biceps:     { mv: 4, mev: 6,  mavMin: 10, mavMax: 14, mrv: 20 },
  calves:     { mv: 4, mev: 6,  mavMin: 8,  mavMax: 16, mrv: 20 },
  abs:        { mv: 0, mev: 4,  mavMin: 8,  mavMax: 16, mrv: 20 }
};

export type VolumeStatus = 'below_mev' | 'optimal_mav' | 'near_mrv' | 'exceeded_mrv';

export interface MuscleVolumeEvaluation {
  muscle: MuscleGroup;
  completedSets: number;
  landmarks: VolumeLandmark;
  status: VolumeStatus;
  statusMessage: string;
}

/**
 * Evaluate completed weekly volume against hypertrophic landmarks for a specific muscle.
 */
export function evaluateMuscleVolume(muscle: MuscleGroup, completedSets: number): MuscleVolumeEvaluation {
  const landmarks = VOLUME_LANDMARKS[muscle] || { mv: 4, mev: 6, mavMin: 10, mavMax: 16, mrv: 20 };

  let status: VolumeStatus = 'optimal_mav';
  let statusMessage = '';

  if (completedSets < landmarks.mev) {
    status = 'below_mev';
    statusMessage = `Below minimum effective stimulus (${completedSets}/${landmarks.mev} sets). Sub-optimal for hypertrophy.`;
  } else if (completedSets > landmarks.mrv) {
    status = 'exceeded_mrv';
    statusMessage = `Exceeded maximum recoverable volume (${completedSets}/${landmarks.mrv} sets). Risk of systemic fatigue accumulation and muscle loss.`;
  } else if (completedSets >= landmarks.mavMax) {
    status = 'near_mrv';
    statusMessage = `At upper ceiling of adaptive volume (${completedSets} sets). High stimulus, prepare for scheduled deload.`;
  } else {
    status = 'optimal_mav';
    statusMessage = `In the hypertrophy sweet-spot (${completedSets} sets, MAV: ${landmarks.mavMin}-${landmarks.mavMax}).`;
  }

  return {
    muscle,
    completedSets,
    landmarks,
    status,
    statusMessage
  };
}

/**
 * Generate full body volume radar metrics comparing planned vs completed sets
 */
export function evaluateVolumeRadar(actualSetsMap: Partial<Record<MuscleGroup, number>>): MuscleVolumeEvaluation[] {
  const muscles = Object.keys(VOLUME_LANDMARKS) as MuscleGroup[];
  return muscles.map((muscle) => {
    const count = actualSetsMap[muscle] || 0;
    return evaluateMuscleVolume(muscle, count);
  });
}
