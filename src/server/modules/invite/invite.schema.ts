import { z } from 'zod';

export const createInviteSchema = z.object({
  email: z.string().email(),
  roleId: z.string().min(1),
  expiresInHours: z.number().int().positive().default(72),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
