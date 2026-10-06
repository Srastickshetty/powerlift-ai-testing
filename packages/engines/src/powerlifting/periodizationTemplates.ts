/**
 * @powerlift/engines/powerlifting/periodizationTemplates
 * Generates periodized program microcycles and set prescriptions for powerlifting models:
 * - Linear progression
 * - Daily Undulating Periodization (DUP)
 * - Block Periodization (Accumulation, Intensification, Realization)
 * - RPE-Autoregulated (Top set + % back-offs)
 * - Percentage Waves (Prilepin / 5-3-1 waves)
 * Pure deterministic calculation.
 */

export type PeriodizationModel = 'linear' | 'dup' | 'block' | 'rpe_autoregulated' | 'percentage';

export interface PrescribedSet {
  setNumber: number;
  setType: 'TOP' | 'WORKING' | 'BACKOFF' | 'DELOAD';
  loadKg: number;
  intensityPercent: number;
  reps: number;
  targetRpe?: number;
  cue?: string;
}

export interface DayPrescription {
  dayNumber: number;
  focus: string;
  prescriptions: PrescribedSet[];
}

export function roundToPlate(weightKg: number, stepKg = 2.5): number {
  if (weightKg <= 0) return 0;
  return Math.round(weightKg / stepKg) * stepKg;
}

/**
 * Generate DUP daily microcycle for a main compound based on 1RM
 */
export function generateDupPrescription(oneRepMaxKg: number, weekNumber = 1): DayPrescription[] {
  const base1Rm = oneRepMaxKg;
  const weekLoadMod = 1 + (weekNumber - 1) * 0.02; // +2% per week across block

  return [
    {
      dayNumber: 1,
      focus: 'Hypertrophy / Volume',
      prescriptions: [
        {
          setNumber: 1,
          setType: 'WORKING',
          loadKg: roundToPlate(base1Rm * 0.70 * weekLoadMod),
          intensityPercent: 70,
          reps: 8,
          targetRpe: 7
        },
        {
          setNumber: 2,
          setType: 'WORKING',
          loadKg: roundToPlate(base1Rm * 0.70 * weekLoadMod),
          intensityPercent: 70,
          reps: 8,
          targetRpe: 7.5
        },
        {
          setNumber: 3,
          setType: 'WORKING',
          loadKg: roundToPlate(base1Rm * 0.70 * weekLoadMod),
          intensityPercent: 70,
          reps: 8,
          targetRpe: 8
        }
      ]
    },
    {
      dayNumber: 2,
      focus: 'Heavy Strength / Neural Drive',
      prescriptions: [
        {
          setNumber: 1,
          setType: 'TOP',
          loadKg: roundToPlate(base1Rm * 0.825 * weekLoadMod),
          intensityPercent: 82.5,
          reps: 4,
          targetRpe: 8
        },
        {
          setNumber: 2,
          setType: 'BACKOFF',
          loadKg: roundToPlate(base1Rm * 0.75 * weekLoadMod),
          intensityPercent: 75,
          reps: 4,
          targetRpe: 7
        },
        {
          setNumber: 3,
          setType: 'BACKOFF',
          loadKg: roundToPlate(base1Rm * 0.75 * weekLoadMod),
          intensityPercent: 75,
          reps: 4,
          targetRpe: 7.5
        }
      ]
    },
    {
      dayNumber: 3,
      focus: 'Speed & Bar Velocity / Platform Technique',
      prescriptions: [
        {
          setNumber: 1,
          setType: 'WORKING',
          loadKg: roundToPlate(base1Rm * 0.65),
          intensityPercent: 65,
          reps: 3,
          targetRpe: 6,
          cue: 'Maximum bar acceleration through sticking point'
        },
        {
          setNumber: 2,
          setType: 'WORKING',
          loadKg: roundToPlate(base1Rm * 0.65),
          intensityPercent: 65,
          reps: 3,
          targetRpe: 6,
          cue: 'Maximum bar acceleration through sticking point'
        },
        {
          setNumber: 3,
          setType: 'WORKING',
          loadKg: roundToPlate(base1Rm * 0.65),
          intensityPercent: 65,
          reps: 3,
          targetRpe: 6.5,
          cue: 'Maximum bar acceleration through sticking point'
        }
      ]
    }
  ];
}

/**
 * Generate Block Periodization phase parameters
 */
export function getBlockPhase(weekNumber: number): {
  phase: 'ACCUMULATION' | 'INTENSIFICATION' | 'REALIZATION' | 'DELOAD';
  avgIntensity: number;
  repsPerSet: number;
  weeklyWorkingSets: number;
} {
  const normWeek = ((weekNumber - 1) % 4) + 1; // 4-week block cycle

  switch (normWeek) {
    case 1:
      return { phase: 'ACCUMULATION', avgIntensity: 0.725, repsPerSet: 6, weeklyWorkingSets: 5 };
    case 2:
      return { phase: 'INTENSIFICATION', avgIntensity: 0.80, repsPerSet: 4, weeklyWorkingSets: 4 };
    case 3:
      return { phase: 'REALIZATION', avgIntensity: 0.875, repsPerSet: 2, weeklyWorkingSets: 3 };
    case 4:
    default:
      return { phase: 'DELOAD', avgIntensity: 0.60, repsPerSet: 4, weeklyWorkingSets: 2 };
  }
}
