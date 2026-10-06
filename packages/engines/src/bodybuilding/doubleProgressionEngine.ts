/**
 * @powerlift/engines/bodybuilding/doubleProgressionEngine
 * Double progression logic for hypertrophy training.
 * First progress reps within range, then increment load once top of range is achieved.
 * Pure deterministic calculations.
 */

export interface LoggedSetResult {
  loadKg: number;
  reps: number;
  rir?: number;
}

export interface DoubleProgressionEvaluation {
  action: 'INCREASE_LOAD' | 'MAINTAIN_LOAD_ADD_REPS' | 'REDUCE_LOAD';
  nextLoadKg: number;
  rationale: string;
  loadIncrementKg: number;
}

export function evaluateDoubleProgression(
  minReps: number,
  maxReps: number,
  currentLoadKg: number,
  loggedSets: LoggedSetResult[],
  isLowerBodyOrCompound = false
): DoubleProgressionEvaluation {
  if (!loggedSets || loggedSets.length === 0) {
    return {
      action: 'MAINTAIN_LOAD_ADD_REPS',
      nextLoadKg: currentLoadKg,
      rationale: 'No logged sets. Maintain current prescription.',
      loadIncrementKg: 0
    };
  }

  const standardIncrement = isLowerBodyOrCompound ? 5.0 : 2.5;

  // Check if first set fell below minimum rep target
  if (loggedSets[0].reps < minReps) {
    const reducedLoad = Math.max(2.5, Math.round((currentLoadKg * 0.9) / 2.5) * 2.5);
    return {
      action: 'REDUCE_LOAD',
      nextLoadKg: reducedLoad,
      rationale: `First set achieved only ${loggedSets[0].reps} reps (target minimum ${minReps}). Reduce load to ${reducedLoad} kg to preserve hypertrophic quality.`,
      loadIncrementKg: -(currentLoadKg - reducedLoad)
    };
  }

  // Check if ALL sets reached or exceeded maximum rep target
  const allSetsMaxed = loggedSets.every((s) => s.reps >= maxReps);

  if (allSetsMaxed) {
    const nextLoad = currentLoadKg + standardIncrement;
    return {
      action: 'INCREASE_LOAD',
      nextLoadKg: nextLoad,
      rationale: `Double progression threshold unlocked! All sets reached top of rep range (≥${maxReps} reps). Increase load by +${standardIncrement} kg to ${nextLoad} kg.`,
      loadIncrementKg: standardIncrement
    };
  }

  // Still progressing inside rep range
  const totalReps = loggedSets.reduce((acc, s) => acc + s.reps, 0);
  return {
    action: 'MAINTAIN_LOAD_ADD_REPS',
    nextLoadKg: currentLoadKg,
    rationale: `Working inside target window (${minReps}-${maxReps} reps). Maintain ${currentLoadKg} kg and fight for additional reps across trailing sets next session.`,
    loadIncrementKg: 0
  };
}
