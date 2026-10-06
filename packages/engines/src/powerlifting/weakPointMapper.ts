/**
 * @powerlift/engines/powerlifting/weakPointMapper
 * Maps mechanical sticking points & technique breakdowns to target compound variations.
 * Pure deterministic mapping.
 */

export type MainLift = 'squat' | 'bench' | 'deadlift';

export type SquatWeakPoint = 'hole' | 'midway' | 'lockout' | 'knee_valgus' | 'chest_cave';
export type BenchWeakPoint = 'chest' | 'mid_range' | 'lockout' | 'unstable_shelf';
export type DeadliftWeakPoint = 'off_floor' | 'knees' | 'lockout' | 'grip' | 'upper_back_rounding';

export type WeakPoint = SquatWeakPoint | BenchWeakPoint | DeadliftWeakPoint;

export interface VariationPrescription {
  variationName: string;
  focusRationale: string;
  recommendedIntensityPercent: number; // e.g. 70-80% of main 1RM
  recommendedRepRange: string;
  recommendedSets: number;
}

const WEAK_POINT_MAP: Record<MainLift, Record<string, VariationPrescription[]>> = {
  squat: {
    hole: [
      {
        variationName: '2-Second Pause Squats',
        focusRationale: 'Eliminates stretch reflex and forces high rate of force development out of the hole.',
        recommendedIntensityPercent: 72.5,
        recommendedRepRange: '3-4',
        recommendedSets: 4
      },
      {
        variationName: 'Pin Squats (Dead Stop below parallel)',
        focusRationale: 'Develops concentric starting strength from the exact sticking height.',
        recommendedIntensityPercent: 70,
        recommendedRepRange: '3',
        recommendedSets: 3
      }
    ],
    midway: [
      {
        variationName: 'Tempo Squats (3-1-0)',
        focusRationale: 'Reinforces torso rigidity and bar path stability during the deceleration phase.',
        recommendedIntensityPercent: 68,
        recommendedRepRange: '4-5',
        recommendedSets: 3
      }
    ],
    chest_cave: [
      {
        variationName: 'Front Squats',
        focusRationale: 'Heavily challenges thoracic extensor strength and quadriceps drive.',
        recommendedIntensityPercent: 65,
        recommendedRepRange: '5-6',
        recommendedSets: 4
      },
      {
        variationName: 'Safety Bar Squats',
        focusRationale: 'Forces thoracic extension without stressing shoulders/wrists.',
        recommendedIntensityPercent: 70,
        recommendedRepRange: '5',
        recommendedSets: 3
      }
    ],
    lockout: [
      {
        variationName: 'Belt Squats / Leg Press',
        focusRationale: 'Overloads quadriceps terminal extension with zero lumbar fatigue.',
        recommendedIntensityPercent: 75,
        recommendedRepRange: '8-10',
        recommendedSets: 3
      }
    ],
    knee_valgus: [
      {
        variationName: 'Bulgarian Split Squats',
        focusRationale: 'Eliminates unilateral glute medius and adductor imbalances.',
        recommendedIntensityPercent: 60,
        recommendedRepRange: '8-10',
        recommendedSets: 3
      }
    ]
  },
  bench: {
    chest: [
      {
        variationName: 'Spoto Press (1-inch off chest)',
        focusRationale: 'Builds maximum isometric tension and reversal strength at reversal point.',
        recommendedIntensityPercent: 72.5,
        recommendedRepRange: '4-5',
        recommendedSets: 4
      },
      {
        variationName: 'Long Pause Bench (2-3 sec pause)',
        focusRationale: 'Guarantees IPF competition pause confidence and chest speed.',
        recommendedIntensityPercent: 75,
        recommendedRepRange: '3',
        recommendedSets: 4
      }
    ],
    mid_range: [
      {
        variationName: 'Larsen Press (Feet up Bench)',
        focusRationale: 'Eliminates leg drive compensation, forcing pure pectoral and tricep drive.',
        recommendedIntensityPercent: 70,
        recommendedRepRange: '5-6',
        recommendedSets: 4
      }
    ],
    lockout: [
      {
        variationName: 'Close-Grip Bench Press',
        focusRationale: 'Shifts primary loading to triceps lateral and medial heads.',
        recommendedIntensityPercent: 72.5,
        recommendedRepRange: '6-8',
        recommendedSets: 4
      },
      {
        variationName: 'Floor Press',
        focusRationale: 'Overloads lockout and triceps terminal extension.',
        recommendedIntensityPercent: 77.5,
        recommendedRepRange: '4-5',
        recommendedSets: 3
      }
    ],
    unstable_shelf: [
      {
        variationName: 'Chest-Supported Dumbbell Rows',
        focusRationale: 'Reinforces the upper back and lat shelf required to stabilize the bar descent.',
        recommendedIntensityPercent: 65,
        recommendedRepRange: '10-12',
        recommendedSets: 4
      }
    ]
  },
  deadlift: {
    off_floor: [
      {
        variationName: 'Deficit Deadlifts (1-1.5 inch)',
        focusRationale: 'Increases range of motion to force superior leg drive and floor speed.',
        recommendedIntensityPercent: 67.5,
        recommendedRepRange: '4',
        recommendedSets: 3
      },
      {
        variationName: 'Snatch-Grip Deadlifts',
        focusRationale: 'Dramatically increases upper back tension and floor leg push.',
        recommendedIntensityPercent: 60,
        recommendedRepRange: '5',
        recommendedSets: 3
      }
    ],
    knees: [
      {
        variationName: 'Pause Deadlifts (Pause 1-inch below knee)',
        focusRationale: 'Forces patience in the wedge and prevents premature hip rise.',
        recommendedIntensityPercent: 70,
        recommendedRepRange: '3',
        recommendedSets: 4
      }
    ],
    lockout: [
      {
        variationName: 'Block Pulls (Just below knee)',
        focusRationale: 'Allows supramaximal loading to reinforce hip drive and glute lockout.',
        recommendedIntensityPercent: 82.5,
        recommendedRepRange: '3-4',
        recommendedSets: 3
      },
      {
        variationName: 'Barbell Romanian Deadlift',
        focusRationale: 'Builds hamstring and glute hypertrophy through deep stretch.',
        recommendedIntensityPercent: 60,
        recommendedRepRange: '8',
        recommendedSets: 3
      }
    ],
    grip: [
      {
        variationName: 'Deadlift Isometric Bar Holds (Top of last set)',
        focusRationale: 'Directly reinforces finger flexor endurance for platform 3rd attempts.',
        recommendedIntensityPercent: 75,
        recommendedRepRange: '15-sec hold',
        recommendedSets: 3
      }
    ],
    upper_back_rounding: [
      {
        variationName: 'Barbell Pendlay Rows',
        focusRationale: 'Dead-stop explosive pulling builds thoracic extensor isometric strength.',
        recommendedIntensityPercent: 65,
        recommendedRepRange: '6-8',
        recommendedSets: 4
      }
    ]
  }
};

/**
 * Return evidence-based variation prescriptions for a given lift and weak point.
 */
export function getVariationsForWeakPoint(lift: MainLift, weakPoint: string): VariationPrescription[] {
  const liftMap = WEAK_POINT_MAP[lift];
  if (!liftMap) return [];
  const normalizedKey = weakPoint.toLowerCase().replace(/[-\s]/g, '_');
  return liftMap[normalizedKey] || liftMap[Object.keys(liftMap)[0]] || [];
}
