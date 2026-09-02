import { z } from 'zod';
import { config } from '@infra/config';

export const listBillingHistorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type ListBillingHistoryQuery = z.infer<typeof listBillingHistorySchema>;

export const createSubscriptionSchema = z.object({
  plan: z.enum(['TEAM', 'ENTERPRISE']),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
});

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;

/**
 * Razorpay plan IDs.
 *
 * Read through the lazy config rather than process.env at module scope:
 * Next evaluates this module during the build, where the runtime
 * environment is not necessarily present, which would otherwise bake empty
 * strings into the bundle.
 */
export function getRazorpayPlanIds(): Record<'TEAM' | 'ENTERPRISE', string> {
  return {
    TEAM: config.RAZORPAY_PLAN_ID_TEAM ?? '',
    ENTERPRISE: config.RAZORPAY_PLAN_ID_ENTERPRISE ?? '',
  };
}
