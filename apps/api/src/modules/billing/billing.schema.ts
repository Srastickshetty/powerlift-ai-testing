/**
 * apps/api/src/modules/billing/billing.schema.ts
 * Validation schemas for billing, subscriptions, and plans.
 */

import { z } from 'zod';

export const SubscribeInputSchema = z.object({
  planKind: z.enum(['ATHLETE_PRO', 'COACHING']).default('ATHLETE_PRO'),
  coachAthleteId: z.string().uuid().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

export const ConfirmPaymentSchema = z.object({
  providerRef: z.string().min(1)
});

export const CancelSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid().optional(),
  providerRef: z.string().optional()
});

export type SubscribeInput = z.infer<typeof SubscribeInputSchema>;
export type ConfirmPaymentInput = z.infer<typeof ConfirmPaymentSchema>;
export type CancelSubscriptionInput = z.infer<typeof CancelSubscriptionSchema>;
