/**
 * @powerlift/engines/pr/prDetector
 * Pure PR detection engine: compares logged set against athlete historical bests.
 * Zero I/O or external dependencies.
 */

import { calculateE1RM } from '../e1rm/e1rmCalculator';

export interface HistoricalSet {
  weightKg: number;
  reps: number;
  rpe?: number;
}

export interface CandidateSet {
  weightKg: number;
  reps: number;
  rpe?: number;
}

export interface PrEvaluationResult {
  isPr: boolean;
  isE1rmPr: boolean;
  isRepPr: boolean;
  isWeightPr: boolean;
  previousBestE1rmKg: number;
  newE1rmKg: number;
  prDeltaKg: number;
  description: string;
}

export function evaluatePersonalRecord(
  candidate: CandidateSet,
  history: HistoricalSet[]
): PrEvaluationResult {
  const candidateE1rm = calculateE1RM({
    loadKg: candidate.weightKg,
    reps: candidate.reps,
    rpe: candidate.rpe || 10
  }).e1rmKg;

  if (!history || history.length === 0) {
    return {
      isPr: true,
      isE1rmPr: true,
      isRepPr: true,
      isWeightPr: true,
      previousBestE1rmKg: 0,
      newE1rmKg: candidateE1rm,
      prDeltaKg: candidateE1rm,
      description: `First logged performance: ${candidate.weightKg} kg x ${candidate.reps} (e1RM: ${candidateE1rm} kg)!`
    };
  }

  let bestE1rm = 0;
  let maxWeight = 0;
  let bestRepsAtWeight = 0;

  for (const h of history) {
    const e1rm = calculateE1RM({
      loadKg: h.weightKg,
      reps: h.reps,
      rpe: h.rpe || 10
    }).e1rmKg;

    if (e1rm > bestE1rm) bestE1rm = e1rm;
    if (h.weightKg > maxWeight) maxWeight = h.weightKg;
    if (Math.abs(h.weightKg - candidate.weightKg) < 0.5 && h.reps > bestRepsAtWeight) {
      bestRepsAtWeight = h.reps;
    }
  }

  const isE1rmPr = candidateE1rm > bestE1rm + 0.5;
  const isWeightPr = candidate.weightKg > maxWeight;
  const isRepPr = candidate.reps > bestRepsAtWeight && bestRepsAtWeight > 0;
  const isPr = isE1rmPr || isWeightPr || isRepPr;

  const prDeltaKg = isE1rmPr ? Math.round((candidateE1rm - bestE1rm) * 10) / 10 : 0;

  let description = 'Consistent working set completed.';
  if (isE1rmPr) {
    description = `🏆 All-Time e1RM PR! +${prDeltaKg} kg jump (${candidateE1rm} kg vs prev ${bestE1rm} kg).`;
  } else if (isWeightPr) {
    description = `🔥 Heaviest Load PR! Moved ${candidate.weightKg} kg for the first time.`;
  } else if (isRepPr) {
    description = `⚡ Rep PR! Hit ${candidate.reps} reps at ${candidate.weightKg} kg (prev: ${bestRepsAtWeight} reps).`;
  }

  return {
    isPr,
    isE1rmPr,
    isRepPr,
    isWeightPr,
    previousBestE1rmKg: bestE1rm,
    newE1rmKg: candidateE1rm,
    prDeltaKg,
    description
  };
}
