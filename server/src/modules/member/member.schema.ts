import { z } from 'zod';

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  roleId: z.string().min(1),
});

export const updateMemberSchema = z.object({
  roleId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
