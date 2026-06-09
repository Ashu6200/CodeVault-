// ─────────────────────────────────────────────
// Express Type Augmentation
// ─────────────────────────────────────────────

import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    /** Authenticated user from Better Auth session or API key */
    user?: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      emailVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    /** Active session info */
    session?: {
      id: string;
      userId: string;
      expiresAt: Date;
      ipAddress?: string | null;
      userAgent?: string | null;
    };
    /** Workspace context for scoped requests */
    workspaceId?: string;
    /** Resolved permissions for the current user in the workspace context */
    permissions?: string[];
    /** The member record for the current user in the workspace context */
    member?: {
      id: string;
      userId: string;
      workspaceId: string;
      roleId: string;
      isActive: boolean;
    };
    /** Unique request ID for tracing */
    id?: string;
  }


  // Override Express 5 ParamsDictionary to use string values only
  interface ParamsDictionary {
    [key: string]: string;
  }
}

export {};
