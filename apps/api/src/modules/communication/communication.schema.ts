/**
 * apps/api/src/modules/communication/communication.schema.ts
 * Validation schemas for messaging, media uploads, timestamped video comments, and check-in submissions.
 */

import { z } from 'zod';

export const SendMessageSchema = z.object({
  body: z.string().min(1).max(5000),
  mediaId: z.string().uuid().optional()
});

export const RequestUploadUrlSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.enum(['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']),
  kind: z.enum(['VIDEO', 'PHOTO']).default('VIDEO'),
  sizeBytes: z.number().int().positive().max(104857600) // 100MB max
});

export const RegisterMediaSchema = z.object({
  kind: z.enum(['VIDEO', 'PHOTO']).default('VIDEO'),
  storageKey: z.string().min(1),
  visibility: z.enum(['PRIVATE', 'COACH']).default('COACH')
});

export const VideoCommentSchema = z.object({
  tMs: z.number().int().nonnegative(),
  body: z.string().min(1).max(1000)
});

export const SubmitCheckinSchema = z.object({
  weekStart: z.string().datetime().optional(),
  data: z.record(z.string(), z.any()),
  photos: z.array(z.string()).default([]),
  consentPhotosToCoach: z.boolean().default(true)
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type RequestUploadUrlInput = z.infer<typeof RequestUploadUrlSchema>;
export type RegisterMediaInput = z.infer<typeof RegisterMediaSchema>;
export type VideoCommentInput = z.infer<typeof VideoCommentSchema>;
export type SubmitCheckinInput = z.infer<typeof SubmitCheckinSchema>;
