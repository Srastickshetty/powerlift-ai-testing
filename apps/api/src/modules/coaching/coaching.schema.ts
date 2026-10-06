/**
 * apps/api/src/modules/coaching/coaching.schema.ts
 * Zod validation schemas for coach profile, athlete requests, roster, program edits, and notes.
 */

import { z } from 'zod';

export const CoachProfileSchema = z.object({
  tracks: z.array(z.enum(['POWERLIFTING', 'BODYBUILDING'])).min(1),
  bio: z.string().max(1000).optional(),
  specialties: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(['English']),
  priceMonthlyMinor: z.number().int().nonnegative().default(7999),
  currency: z.string().default('USD'),
  capacity: z.number().int().min(1).max(100).default(20)
});

export const CoachRequestSchema = z.object({
  coachId: z.string().uuid(),
  hasGuardianConsent: z.boolean().default(false),
  goalsSummary: z.string().optional()
});

export const AcceptRequestSchema = z.object({
  mode: z.enum(['COACH_LED', 'COPILOT']).default('COPILOT')
});

export const CoachProgramEditSchema = z.object({
  versionId: z.string().uuid(),
  diff: z.record(z.string(), z.any()),
  coachNotes: z.string().optional()
});

export const CoachNoteSchema = z.object({
  note: z.string().min(1).max(2000),
  category: z.enum(['GENERAL', 'INJURY', 'TECHNIQUE', 'MEET_PREP']).default('GENERAL')
});

export const CheckinReplySchema = z.object({
  reply: z.string().min(1).max(2000),
  actionFlags: z.array(z.string()).default([])
});

export const CoachApplySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  country: z.string().max(100).default('United States'),
  bio: z.string().min(20).max(2000),
  socialUrl: z.string().max(300).optional(),
  languages: z.array(z.string()).default(['English']),
  tracks: z.array(z.enum(['POWERLIFTING', 'BODYBUILDING'])).min(1),
  plDetails: z.object({
    federation: z.string().optional(),
    coachedTotalKg: z.number().optional(),
    nationalAthletesCount: z.number().optional(),
    periodization: z.string().optional(),
    meetHandlingYears: z.number().optional()
  }).optional(),
  bbDetails: z.object({
    divisions: z.array(z.string()).optional(),
    stageAthletesCount: z.number().optional(),
    peakWeekPhilosophy: z.string().optional(),
    posingExperience: z.string().optional(),
    nutritionCerts: z.string().optional()
  }).optional(),
  certifications: z.array(z.string()).default([]),
  athleticAchievements: z.string().max(1000).optional(),
  experienceYears: z.number().min(0).max(50).default(1),
  capacity: z.number().int().min(1).max(100).default(20),
  priceMonthly: z.number().min(10).max(2000).default(89),
  portfolioUrl: z.string().max(300).optional()
});

export type CoachProfileInput = z.infer<typeof CoachProfileSchema>;
export type CoachRequestInput = z.infer<typeof CoachRequestSchema>;
export type AcceptRequestInput = z.infer<typeof AcceptRequestSchema>;
export type CoachProgramEditInput = z.infer<typeof CoachProgramEditSchema>;
export type CoachNoteInput = z.infer<typeof CoachNoteSchema>;
export type CheckinReplyInput = z.infer<typeof CheckinReplySchema>;
export type CoachApplyInput = z.infer<typeof CoachApplySchema>;
