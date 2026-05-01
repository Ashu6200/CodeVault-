import { prisma } from '@infra/db';

// ─────────────────────────────────────────────
// Socket Guards
// Shared authorization checks used by namespace
// handlers before allowing room joins.
// ─────────────────────────────────────────────

/**
 * Verifies a user is an active member of the workspace.
 * Used by /workspace and /document namespaces.
 */
export const verifyWorkspaceMembership = async (
  userId: string,
  workspaceId: string,
): Promise<boolean> => {
  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId },
    },
    select: { isActive: true },
  });
  return !!member?.isActive;
};
