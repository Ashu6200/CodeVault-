import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  expiresInDays: z.number().int().positive().optional(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
