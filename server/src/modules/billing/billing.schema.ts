import { z } from 'zod';

export const listBillingHistorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type ListBillingHistoryQuery = z.infer<typeof listBillingHistorySchema>;
