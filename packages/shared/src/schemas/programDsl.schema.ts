/**
 * packages/shared/src/schemas/programDsl.schema.ts
 * Program DSL (Domain Specific Language) Zod schema.
 * Defines the canonical structured format for both Powerlifting and Bodybuilding programs.
 */

import { z } from 'zod';

export const DslTrackSchema = z.enum(['powerlifting', 'bodybuilding']);
export const DslLevelSchema = z.enum(['novice', 'intermediate', 'advanced', 'elite']);
export const DslProgressionTypeSchema = z.enum([
  'dup',
  'linear',
  'block',
  'rpe_auto',
  'double_prog'
]);

export const DslPhaseSchema = z.enum([
  'accumulation',
  'intensification',
  'realization',
  'peaking',
  'taper',
  'deload'
]);

export const DslSlotTypeSchema = z.enum(['main', 'variation', 'accessory']);

export const DslLoadSchema = z.object({
  type: z.enum(['pct_e1rm', 'absolute_kg', 'rpe_target']),
  v: z.number().nonnegative()
});

export const DslSchemeSchema = z.object({
  sets: z.number().int().positive(),
  reps: z.number().int().positive().optional(),
  repRange: z.tuple([z.number().int().positive(), z.number().int().positive()]).optional(),
  load: DslLoadSchema.optional(),
  rpe: z.number().min(5).max(10).optional(),
  rir: z.number().min(0).max(5).optional(),
  restSec: z.number().int().nonnegative().optional(),
  tempo: z.string().optional(),
  technique: z.enum(['straight', 'pause', 'tempo', 'myoreps', 'dropset', 'cluster', 'superset']).default('straight'),
  notes: z.string().optional()
});

export const DslSlotSchema = z.object({
  slot: DslSlotTypeSchema,
  pattern: z.string().optional(),
  targetMuscle: z.string().optional(),
  exerciseRef: z.string().min(1),
  scheme: DslSchemeSchema
});

export const DslDaySchema = z.object({
  d: z.number().int().min(1).max(7),
  name: z.string().min(1),
  slots: z.array(DslSlotSchema).min(1)
});

export const DslWeekSchema = z.object({
  w: z.number().int().positive(),
  phase: DslPhaseSchema.default('accumulation'),
  days: z.array(DslDaySchema).min(1)
});

export const DslMetaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  track: DslTrackSchema,
  level: DslLevelSchema,
  days: z.number().int().min(2).max(7),
  weeks: z.number().int().min(1).max(52),
  goal: z.string().min(1),
  author: z.string().optional(),
  source: z.string().min(1), // Mandatory provenance tracking
  licence: z.string().min(1), // Mandatory licence compliance
  description: z.string().optional()
});

export const DslProgressionSchema = z.object({
  type: DslProgressionTypeSchema,
  params: z.record(z.string(), z.any()).default({})
});

export const ProgramDslSchema = z.object({
  meta: DslMetaSchema,
  progression: DslProgressionSchema,
  weeks: z.array(DslWeekSchema).min(1)
});

export type DslTrack = z.infer<typeof DslTrackSchema>;
export type DslLevel = z.infer<typeof DslLevelSchema>;
export type DslProgressionType = z.infer<typeof DslProgressionTypeSchema>;
export type DslPhase = z.infer<typeof DslPhaseSchema>;
export type DslSlotType = z.infer<typeof DslSlotTypeSchema>;
export type DslLoad = z.infer<typeof DslLoadSchema>;
export type DslScheme = z.infer<typeof DslSchemeSchema>;
export type DslSlot = z.infer<typeof DslSlotSchema>;
export type DslDay = z.infer<typeof DslDaySchema>;
export type DslWeek = z.infer<typeof DslWeekSchema>;
export type DslMeta = z.infer<typeof DslMetaSchema>;
export type DslProgression = z.infer<typeof DslProgressionSchema>;
export type ProgramDsl = z.infer<typeof ProgramDslSchema>;
