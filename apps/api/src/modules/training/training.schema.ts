import { z } from 'zod';
import { SetTypeSchema, ReadinessSchema, Readiness } from '@powerlift/shared';

export const LogSetSchema = z.object({
  clientUuid: z.string().min(1),
  plannedSetId: z.string().uuid().optional(),
  exerciseId: z.string().min(1),
  setType: SetTypeSchema.default('WORKING'),
  weightKg: z.number().nonnegative(),
  reps: z.number().int().positive(),
  rpe: z.number().min(5).max(10).default(8),
  rir: z.number().min(0).max(5).optional(),
  tempo: z.string().optional(),
  painScale0To10: z.number().min(0).max(10).default(0),
  painArea: z.string().optional(),
  isPr: z.boolean().default(false),
  note: z.string().optional()
});

export const BatchLogSetsSchema = z.object({
  sets: z.array(LogSetSchema).min(1)
});

export const StartSessionSchema = z.object({
  plannedSessionId: z.string().uuid().optional(),
  readiness: ReadinessSchema.default({}),
  notes: z.string().optional()
});

export const FinishSessionSchema = z.object({
  sessionRpe: z.number().min(1).max(10).default(8),
  notes: z.string().optional()
});

export const SwapExerciseSchema = z.object({
  plannedSessionId: z.string().uuid(),
  originalExerciseId: z.string().min(1),
  replacementExerciseId: z.string().min(1)
});

export const MissedSessionSchema = z.object({
  plannedSessionId: z.string().uuid(),
  action: z.enum(['shift', 'compress', 'drop'])
});

export const EvolveWeekSchema = z.object({
  fatigueScore1To10: z.number().min(1).max(10).default(5),
  sorenessScore1To10: z.number().min(1).max(10).default(5),
  jointPain0To10: z.number().min(0).max(10).default(0),
  sessionsCompleted: z.number().int().min(0).default(4),
  sessionsTargeted: z.number().int().min(1).default(4),
  averageSessionRpe: z.number().min(5).max(10).default(8.0),
  bodyweightKg: z.number().positive().optional()
});

export type LogSetInput = z.infer<typeof LogSetSchema>;
export type BatchLogSetsInput = z.infer<typeof BatchLogSetsSchema>;
export type StartSessionInput = z.infer<typeof StartSessionSchema>;
export type FinishSessionInput = z.infer<typeof FinishSessionSchema>;
export type SwapExerciseInput = z.infer<typeof SwapExerciseSchema>;
export type MissedSessionInput = z.infer<typeof MissedSessionSchema>;
export type EvolveWeekInput = z.infer<typeof EvolveWeekSchema>;
export { ReadinessSchema };
export type ReadinessInput = Readiness;

