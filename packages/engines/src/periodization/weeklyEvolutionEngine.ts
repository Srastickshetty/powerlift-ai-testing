/**
 * @powerlift/engines/periodization/weeklyEvolutionEngine
 * Autonomous weekly mesocycle evolution & periodization engine.
 * Pure deterministic calculation.
 */

import { assessDeloadNeed, DeloadPrescription } from './deloadEngine';

export interface WeeklyCheckIn {
  fatigueScore1To10: number;
  sorenessScore1To10: number;
  jointPain0To10: number;
  sessionsCompleted: number;
  sessionsTargeted: number;
  averageSessionRpe: number;
  missedLiftsCount?: number;
}

export interface TrainingMaxes {
  squat: number;
  bench: number;
  deadlift: number;
}

export interface EvolutionInput {
  currentWeekNumber: number;
  totalCycleWeeks?: number;
  checkIn: WeeklyCheckIn;
  trainingMaxes: TrainingMaxes;
  currentWeeklySets: number;
}

export interface EvolutionDecision {
  nextWeekNumber: number;
  phase: 'accumulation' | 'intensification' | 'realization' | 'deload';
  volumeAdjustmentPct: number;
  intensityAdjustmentPct: number;
  updatedTrainingMaxes: TrainingMaxes;
  deloadPrescription?: DeloadPrescription;
  rationale: string;
}

export function evolveWeeklyMesocycle(input: EvolutionInput): EvolutionDecision {
  const {
    currentWeekNumber,
    totalCycleWeeks = 12,
    checkIn,
    trainingMaxes,
    currentWeeklySets
  } = input;

  const adherence = checkIn.sessionsTargeted > 0
    ? checkIn.sessionsCompleted / checkIn.sessionsTargeted
    : 1.0;

  // 1. Check for urgent deload condition
  const deload = assessDeloadNeed({
    currentWeeklyVolumeSets: currentWeeklySets,
    averageSessionRpe: checkIn.averageSessionRpe,
    consecutiveAccumulationWeeks: currentWeekNumber % 4 === 0 ? 4 : (currentWeekNumber % 4),
    fatigueScore1To10: checkIn.fatigueScore1To10,
    jointPain0To10: checkIn.jointPain0To10,
    performanceDropPercentage: (checkIn.missedLiftsCount || 0) > 1 ? 6 : 0
  });

  if (deload.isDeloadRecommended) {
    return {
      nextWeekNumber: currentWeekNumber + 1,
      phase: 'deload',
      volumeAdjustmentPct: -deload.volumeReductionPct,
      intensityAdjustmentPct: -deload.intensityReductionPct,
      updatedTrainingMaxes: { ...trainingMaxes },
      deloadPrescription: deload,
      rationale: deload.rationale
    };
  }

  // 2. Scheduled Deload on every 4th week of standard blocks
  if (currentWeekNumber % 4 === 0 && currentWeekNumber < totalCycleWeeks) {
    return {
      nextWeekNumber: currentWeekNumber + 1,
      phase: 'deload',
      volumeAdjustmentPct: -35,
      intensityAdjustmentPct: -10,
      updatedTrainingMaxes: { ...trainingMaxes },
      rationale: 'Scheduled 4th-week recovery microcycle. Dissipating accumulated fatigue before the next loading wave.'
    };
  }

  // 3. Low adherence check (<75% attendance)
  if (adherence < 0.75) {
    return {
      nextWeekNumber: currentWeekNumber, // Repeat the week
      phase: 'accumulation',
      volumeAdjustmentPct: 0,
      intensityAdjustmentPct: 0,
      updatedTrainingMaxes: { ...trainingMaxes },
      rationale: `Session adherence was ${(adherence * 100).toFixed(0)}%. Repeating current week to ensure full stimulus before increasing loads.`
    };
  }

  // 4. Progressive Overload Phase Progression
  let phase: 'accumulation' | 'intensification' | 'realization' = 'accumulation';
  let volumeAdjustmentPct = 0;
  let intensityAdjustmentPct = 2.0;

  if (currentWeekNumber <= 4) {
    phase = 'accumulation';
    volumeAdjustmentPct = 5.0; // Building work capacity
    intensityAdjustmentPct = 1.5;
  } else if (currentWeekNumber <= 8) {
    phase = 'intensification';
    volumeAdjustmentPct = -5.0; // Tapering sets, building bar weight
    intensityAdjustmentPct = 2.5;
  } else {
    phase = 'realization';
    volumeAdjustmentPct = -15.0; // High specificity singles & doubles
    intensityAdjustmentPct = 3.0;
  }

  // If lifter breezed through the week with low RPE (<7.5) and 0 pain, apply standard progression bonus
  let bonusKg = 0;
  if (checkIn.averageSessionRpe <= 7.5 && checkIn.jointPain0To10 <= 1) {
    bonusKg = 2.5;
  }

  const updatedTrainingMaxes: TrainingMaxes = {
    squat: Math.round(trainingMaxes.squat * (1 + intensityAdjustmentPct / 100) + bonusKg),
    bench: Math.round(trainingMaxes.bench * (1 + (intensityAdjustmentPct * 0.8) / 100) + (bonusKg ? 1.5 : 0)),
    deadlift: Math.round(trainingMaxes.deadlift * (1 + intensityAdjustmentPct / 100) + bonusKg)
  };

  return {
    nextWeekNumber: currentWeekNumber + 1,
    phase,
    volumeAdjustmentPct,
    intensityAdjustmentPct,
    updatedTrainingMaxes,
    rationale: `Optimal adaptation detected (RPE ${checkIn.averageSessionRpe.toFixed(1)}). Advancing to Week ${currentWeekNumber + 1} (${phase.toUpperCase()}) with +${intensityAdjustmentPct}% intensity.`
  };
}
