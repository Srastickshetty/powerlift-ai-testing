/**
 * @powerlift/shared/types
 * Core domain types for PowerLift AI across frontend and backend.
 */

export type Track = 'powerlifting' | 'bodybuilding';

export type UserRole = 'athlete' | 'coach' | 'admin';

export type WeightUnits = 'kg' | 'lbs';

export type CoachAthleteStatus = 'REQUESTED' | 'ACTIVE' | 'PAUSED' | 'ENDED';

export type CoachingMode = 'COACH_LED' | 'COPILOT';

export type ProgramStatus = 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'ARCHIVED';

export type ProgramSource = 'AI' | 'COACH' | 'TEMPLATE' | 'MARKET';

export type SetType = 'WARMUP' | 'WORKING' | 'TOP_SINGLE' | 'BACKOFF' | 'AMRAP' | 'DROPSET';

export type ExercisePattern = 'SQUAT' | 'BENCH' | 'DEADLIFT' | 'OVERHEAD_PRESS' | 'PULL' | 'HINGE' | 'ISOLATION';

export interface AuthContext {
  userId: string;
  firebaseUid: string;
  email: string;
  role: UserRole;
  track: Track;
}

export interface E1rmRecord {
  date: string;
  valueKg: number;
  reps: number;
  weightKg: number;
  rpe: number;
}
