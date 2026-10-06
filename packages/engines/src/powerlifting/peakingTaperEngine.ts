/**
 * @powerlift/engines/powerlifting/peakingTaperEngine
 * Evidence-based powerlifting peaking and taper calculation.
 * Preserves high neural intensity (88-93% 1RM) while reducing fatigue via 40-60% volume cut.
 * Pure deterministic calculation.
 */

export interface PeakingTaperWeek {
  weeksOut: number;
  stageName: string;
  volumeReductionPercent: number; // 0 to 60%
  intensityRange: { min: number; max: number }; // % of 1RM
  recommendedReps: string;
  focus: string;
  isOpenerCheckWeek: boolean;
  recommendedRestDaysBeforeMeet?: number;
}

export function calculatePeakingTaperSchedule(weeksOut: number): PeakingTaperWeek {
  if (weeksOut > 4) {
    return {
      weeksOut,
      stageName: 'Late Intensification Phase',
      volumeReductionPercent: 0,
      intensityRange: { min: 82.5, max: 87.5 },
      recommendedReps: '3-4 reps',
      focus: 'High specific volume at competition bar speeds',
      isOpenerCheckWeek: false
    };
  }

  if (weeksOut === 4) {
    return {
      weeksOut: 4,
      stageName: 'Peaking Block — Heavy Triple Waves',
      volumeReductionPercent: 15,
      intensityRange: { min: 85, max: 90 },
      recommendedReps: '2-3 reps',
      focus: 'Last heavy multiple-rep exposure',
      isOpenerCheckWeek: false
    };
  }

  if (weeksOut === 3) {
    return {
      weeksOut: 3,
      stageName: 'Peaking Block — Heavy Singles @ RPE 8.5',
      volumeReductionPercent: 25,
      intensityRange: { min: 88, max: 92.5 },
      recommendedReps: '1 rep',
      focus: 'Platform command adherence and groove confirmation',
      isOpenerCheckWeek: false
    };
  }

  if (weeksOut === 2) {
    return {
      weeksOut: 2,
      stageName: 'Taper Phase 1 — Opener Rehearsal',
      volumeReductionPercent: 40,
      intensityRange: { min: 90, max: 92.5 },
      recommendedReps: '1 rep',
      focus: 'Test planned 1st attempts under strict competition standards',
      isOpenerCheckWeek: true
    };
  }

  // Final week / meet week (weeksOut <= 1)
  return {
    weeksOut: 1,
    stageName: 'Meet Week Taper — Fatigue Dissipation',
    volumeReductionPercent: 60,
    intensityRange: { min: 70, max: 80 },
    recommendedReps: '2-3 light technical reps',
    focus: 'Bar speed primer, maintain muscle tension, flush CNS fatigue',
    isOpenerCheckWeek: false,
    recommendedRestDaysBeforeMeet: 3
  };
}
