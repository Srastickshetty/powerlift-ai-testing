import { z } from 'zod';

export const ExerciseQuerySchema = z.object({
  search: z.string().optional(),
  track: z.enum(['POWERLIFTING', 'BODYBUILDING']).optional(),
  pattern: z.string().optional(),
  muscle: z.string().optional(),
  equipment: z.string().optional(),
  isCompetitionLift: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  cursor: z.string().optional()
});

export const CreateExerciseSchema = z.object({
  name: z.string().min(2).max(100),
  trackTags: z.array(z.enum(['POWERLIFTING', 'BODYBUILDING'])).default(['POWERLIFTING']),
  primaryMuscles: z.array(z.string()).min(1),
  secondaryMuscles: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default(['barbell']),
  pattern: z.string().min(2),
  isCompetitionLift: z.boolean().default(false),
  cues: z.array(z.string()).default([]),
  mediaUrl: z.string().url().optional(),
  substitutes: z.array(z.string()).default([])
});

export const UpdateExerciseSchema = CreateExerciseSchema.partial();

export type ExerciseQuery = z.infer<typeof ExerciseQuerySchema>;
export type CreateExerciseInput = z.infer<typeof CreateExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof UpdateExerciseSchema>;
