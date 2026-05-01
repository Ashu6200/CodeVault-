import { z } from 'zod';

export const createWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  events: z
    .array(
      z.enum([
        'DOCUMENT_CREATED',
        'DOCUMENT_UPDATED',
        'DOCUMENT_DELETED',
        'MEMBER_JOINED',
        'MEMBER_REMOVED',
        'SUBSCRIPTION_CHANGED',
      ]),
    )
    .min(1, 'Subscribe to at least one event'),
});

export const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z
    .array(
      z.enum([
        'DOCUMENT_CREATED',
        'DOCUMENT_UPDATED',
        'DOCUMENT_DELETED',
        'MEMBER_JOINED',
        'MEMBER_REMOVED',
        'SUBSCRIPTION_CHANGED',
      ]),
    )
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
