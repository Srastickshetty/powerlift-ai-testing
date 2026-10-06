/**
 * @powerlift/shared/schemas
 * Zod validation schemas for API inputs, outputs, and DB models.
 */

import { z } from 'zod';

export const TrackSchema = z.enum(['powerlifting', 'bodybuilding']);
export const UserRoleSchema = z.enum(['athlete', 'coach', 'admin']);
export const WeightUnitsSchema = z.enum(['kg', 'lbs']);
export const CoachAthleteStatusSchema = z.enum(['REQUESTED', 'ACTIVE', 'PAUSED', 'ENDED']);
export const CoachingModeSchema = z.enum(['COACH_LED', 'COPILOT']);
export const ProgramStatusSchema = z.enum(['DRAFT', 'APPROVED', 'ACTIVE', 'ARCHIVED']);
export const ProgramSourceSchema = z.enum(['AI', 'COACH', 'TEMPLATE', 'MARKET']);
export const SetTypeSchema = z.enum(['WARMUP', 'WORKING', 'TOP_SINGLE', 'BACKOFF', 'AMRAP', 'DROPSET']);

// User & Profile Schemas
export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  firebaseUid: z.string().min(1),
  role: UserRoleSchema.default('athlete'),
  email: z.string().email(),
  name: z.string().min(1)
});

export const AthleteProfileSchema = z.object({
  userId: z.string().uuid(),
  track: TrackSchema,
  sex: z.enum(['male', 'female', 'other']).optional(),
  dob: z.string().optional(),
  heightCm: z.number().positive().optional(),
  units: WeightUnitsSchema.default('kg'),
  trainingAgeYears: z.number().nonnegative().default(0),
  daysPerWeek: z.number().int().min(2).max(7).default(4),
  equipment: z.array(z.string()).default([]),
  injuries: z.array(z.string()).default([]),
  goals: z.record(z.string(), z.any()).default({}),
  diet: z.record(z.string(), z.any()).default({}),
  consent: z.record(z.string(), z.any()).default({})
});

export const PlProfileSchema = z.object({
  userId: z.string().uuid(),
  federation: z.string().default('IPF'),
  equipClass: z.enum(['raw', 'wraps', 'single_ply', 'multi_ply']).default('raw'),
  weightClass: z.string().default('83kg'),
  meetDate: z.string().nullable().optional(),
  weakPoints: z.record(z.string(), z.any()).default({}),
  style: z.record(z.string(), z.any()).default({})
});

export const BbProfileSchema = z.object({
  userId: z.string().uuid(),
  division: z.string().default('mens_physique'),
  showDate: z.string().nullable().optional(),
  lagging: z.array(z.string()).default([]),
  splitPref: z.string().default('PPL'),
  measurementsBaseline: z.record(z.string(), z.any()).default({})
});

// Coach Link Schema
export const CoachAthleteSchema = z.object({
  id: z.string().uuid().optional(),
  coachId: z.string().uuid(),
  athleteId: z.string().uuid(),
  status: CoachAthleteStatusSchema.default('REQUESTED'),
  mode: CoachingModeSchema.default('COPILOT'),
  startedAt: z.date().optional(),
  endedAt: z.date().nullable().optional()
});

// Session & Set Logging Schemas
export const SetLogSchema = z.object({
  id: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  plannedSetId: z.string().uuid().optional(),
  exerciseId: z.string().min(1),
  exerciseName: z.string().optional(),
  setType: SetTypeSchema.default('WORKING'),
  weightKg: z.number().nonnegative(),
  reps: z.number().int().positive(),
  rpe: z.number().min(5).max(10).default(8),
  rir: z.number().min(0).max(5).optional(),
  tempo: z.string().optional(),
  painScale0To10: z.number().min(0).max(10).default(0),
  painArea: z.string().optional(),
  isPr: z.boolean().default(false),
  videoId: z.string().optional(),
  note: z.string().optional(),
  clientUuid: z.string().min(1) // Unique client uuid for idempotent offline sync
});

export const SessionLogSchema = z.object({
  id: z.string().uuid().optional(),
  athleteId: z.string().uuid(),
  plannedSessionId: z.string().uuid().optional(),
  startedAt: z.string().or(z.date()),
  endedAt: z.string().or(z.date()).optional(),
  sessionRpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  readiness: z.record(z.string(), z.any()).default({}),
  sets: z.array(SetLogSchema).default([])
});

// Program Schemas
export const ProgramSchema = z.object({
  id: z.string().uuid().optional(),
  ownerId: z.string().uuid(),
  athleteId: z.string().uuid().nullable().optional(),
  track: TrackSchema,
  name: z.string().min(1),
  source: ProgramSourceSchema.default('AI'),
  isTemplate: z.boolean().default(false)
});

// Full Onboarding Input & Coach Brief Schema
export const OnboardingInputSchema = z.object({
  track: z.enum(['powerlifting', 'bodybuilding']),
  name: z.string().min(1),
  age: z.number().int().min(12).max(100),
  sex: z.enum(['male', 'female', 'other']),
  bodyweightKg: z.number().positive(),
  heightCm: z.number().positive(),
  units: WeightUnitsSchema.default('kg'),
  trainingAgeYears: z.number().nonnegative(),
  daysPerWeek: z.number().int().min(2).max(6).default(4),
  sessionLengthMinutes: z.number().int().min(30).max(180).default(75),
  equipment: z.array(z.string()).default(['barbell', 'squat_rack', 'bench']),
  injuries: z.array(z.string()).default([]),
  scheduleConstraints: z.array(z.string()).default([]),

  // Powerlifting specific
  plDetails: z.object({
    squat1rm: z.number().nonnegative().optional(),
    bench1rm: z.number().nonnegative().optional(),
    deadlift1rm: z.number().nonnegative().optional(),
    federation: z.string().default('IPF'),
    weightClass: z.string().default('83kg'),
    equipClass: z.enum(['raw', 'wraps', 'single_ply', 'multi_ply']).default('raw'),
    weakPoints: z.record(z.string(), z.any()).default({}),
    preferredStyles: z.record(z.string(), z.any()).default({})
  }).optional(),

  // Bodybuilding specific
  bbDetails: z.object({
    goal: z.enum(['hypertrophy', 'recomp', 'cut', 'lean_bulk', 'contest_prep']).default('hypertrophy'),
    division: z.string().default('mens_physique'),
    showDate: z.string().nullable().optional(),
    laggingMuscles: z.array(z.string()).default([]),
    splitPreference: z.string().default('PPL'),
    dietPattern: z.enum(['non_veg', 'vegetarian', 'vegan', 'jain', 'eggetarian']).default('non_veg')
  }).optional()
});

export type OnboardingInput = z.infer<typeof OnboardingInputSchema>;

export * from './programDsl.schema';
