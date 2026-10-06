/**
 * @powerlift/shared/constants
 * Shared constants, RPE percentages, muscle groups, and powerlifting standards.
 */

export const RPE_PERCENT_TABLE: Record<number, Record<number, number>> = {
  10: { 1: 1.000, 2: 0.955, 3: 0.922, 4: 0.892, 5: 0.863, 6: 0.837, 7: 0.811, 8: 0.786, 9: 0.762, 10: 0.739 },
  9.5: { 1: 0.978, 2: 0.939, 3: 0.907, 4: 0.878, 5: 0.850, 6: 0.824, 7: 0.799, 8: 0.774, 9: 0.751, 10: 0.723 },
  9:   { 1: 0.955, 2: 0.922, 3: 0.892, 4: 0.863, 5: 0.837, 6: 0.811, 7: 0.786, 8: 0.762, 9: 0.739, 10: 0.707 },
  8.5: { 1: 0.939, 2: 0.907, 3: 0.878, 4: 0.850, 5: 0.824, 6: 0.799, 7: 0.774, 8: 0.751, 9: 0.723, 10: 0.694 },
  8:   { 1: 0.922, 2: 0.892, 3: 0.863, 4: 0.837, 5: 0.811, 6: 0.786, 7: 0.762, 8: 0.739, 9: 0.707, 10: 0.680 },
  7.5: { 1: 0.907, 2: 0.878, 3: 0.850, 4: 0.824, 5: 0.799, 6: 0.774, 7: 0.751, 8: 0.723, 9: 0.694, 10: 0.667 },
  7:   { 1: 0.892, 2: 0.863, 3: 0.837, 4: 0.811, 5: 0.786, 6: 0.762, 7: 0.739, 8: 0.707, 9: 0.680, 10: 0.653 }
};

export const COMPETITION_LIFTS = ['Squat', 'Bench Press', 'Deadlift'] as const;

export const PRIMARY_MUSCLE_GROUPS = [
  'chest', 'back', 'quads', 'hamstrings', 'glutes', 'shoulders', 'biceps', 'triceps', 'calves', 'abs'
] as const;
