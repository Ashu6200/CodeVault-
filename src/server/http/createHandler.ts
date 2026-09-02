import 'server-only';
import { randomUUID } from 'crypto';
import { headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@infra/auth';
import { prisma } from '@infra/db';
import { redis } from '@infra/redis';
import { config } from '@infra/config';
import { logger } from '@infra/logger';
import { ForbiddenError, UnauthorizedError, AppError } from '@core/errors';
import { toErrorResponse } from './errors';

// ─────────────────────────────────────────────
// Route Handler composition
//
// Express composed behaviour as a middleware chain:
//   requireAuth → resolveWorkspace → requirePermission('doc:read') → controller
//
// Route Handlers have no chain, so the whole pipeline collapses into this one
// wrapper. Written once, used by every route, so the security semantics live in
// exactly one place instead of being re-implemented per file.
// ─────────────────────────────────────────────

const log = logger.child('Http');

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export interface MemberContext {
  id: string;
  userId: string;
  workspaceId: string;
  roleId: string;
  isActive: boolean;
}

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
  /** Key on the authenticated user instead of the client IP. */
  byUser?: boolean;
  /** Explicit key prefix; defaults to the request pathname. */
  keyPrefix?: string;
}

export interface HandlerOptions {
  /** Require a valid Better Auth session. */
  auth?: boolean;
  /**
   * Resolve workspace membership from the `workspaceId` route param.
   * Implies `auth`.
   */
  workspace?: boolean;
  /** RBAC permissions, ALL of which are required ('*' short-circuits). */
  permissions?: string[];
  /**
   * Document-scoped permissions: RBAC first, then a per-document
   * DocumentGrant fallback. Reads the document id from the `id` or
   * `documentId` route param. Implies `workspace`.
   */
  documentPermission?: string[];
  rateLimit?: RateLimitOptions;
}

export interface HandlerContext<P extends Record<string, string> = Record<string, string>> {
  req: NextRequest;
  params: P;
  searchParams: URLSearchParams;
  /** Parsed query params as a plain object, for zod query schemas. */
  query: Record<string, string>;
  requestId: string;
  user: SessionUser;
  workspaceId: string;
  member: MemberContext;
  permissions: string[];
}

type Handler<P extends Record<string, string>> = (
  ctx: HandlerContext<P>,
) => Promise<NextResponse> | NextResponse;

/** Next.js passes route params as a promise from v15 onward. */
interface RouteArgs<P> {
  params: Promise<P>;
}

// ─────────────────────────────────────────────
// Rate limiting — Redis fixed window, fails open
// ─────────────────────────────────────────────

async function enforceRateLimit(
  req: NextRequest,
  opts: RateLimitOptions,
  userId: string | undefined,
  pathname: string,
): Promise<NextResponse | null> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const bypass = (config.RATE_LIMIT_BYPASS_IPS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (bypass.includes(ip)) return null;

  const identifier = opts.byUser && userId ? userId : ip;
  const key = `rl:${opts.keyPrefix || pathname}:${identifier}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, opts.windowSeconds);
    }

    if (count > opts.limit) {
      const ttl = await redis.ttl(key);
      return NextResponse.json(
        {
          success: false,
          statusCode: 429,
          message: 'Too many requests. Please try again later.',
          data: null,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(opts.limit),
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(ttl > 0 ? ttl : opts.windowSeconds),
          },
        },
      );
    }
    return null;
  } catch (error) {
    // Fail open — a Redis outage must not take the API down.
    log.warn('Rate limit check failed, allowing request:', error);
    return null;
  }
}

// ─────────────────────────────────────────────
// Auth — Better Auth session + soft-delete check
// ─────────────────────────────────────────────

async function requireAuth(): Promise<SessionUser> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new UnauthorizedError('Please log in to continue');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { deletedAt: true },
  });

  if (user?.deletedAt) {
    throw new UnauthorizedError('Account has been deactivated');
  }

  return session.user as SessionUser;
}

// ─────────────────────────────────────────────
// Workspace membership + permissions
// ─────────────────────────────────────────────

async function resolveWorkspace(
  userId: string,
  workspaceId: string | undefined,
): Promise<{ workspaceId: string; member: MemberContext; permissions: string[] }> {
  if (!workspaceId) {
    throw new ForbiddenError('Workspace context is required');
  }

  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    include: { role: { select: { permissions: true } } },
  });

  if (!member) {
    throw new ForbiddenError('You are not a member of this workspace');
  }

  if (!member.isActive) {
    throw new ForbiddenError('Your membership in this workspace has been deactivated');
  }

  return {
    workspaceId,
    member: {
      id: member.id,
      userId: member.userId,
      workspaceId: member.workspaceId,
      roleId: member.roleId,
      isActive: member.isActive,
    },
    permissions: member.role.permissions,
  };
}

/** All listed permissions are required; '*' grants everything. */
function requirePermission(granted: string[], required: string[]): void {
  if (granted.includes('*')) return;

  const missing = required.filter((p) => !granted.includes(p));
  if (missing.length > 0) {
    throw new ForbiddenError(`Missing required permission: ${required.join(', ')}`);
  }
}

/** RBAC first, then per-document DocumentGrant fallback (honouring expiry). */
async function requireDocumentPermission(
  granted: string[],
  required: string[],
  userId: string,
  documentId: string | undefined,
): Promise<void> {
  if (granted.includes('*')) return;
  if (required.every((p) => granted.includes(p))) return;

  if (!documentId) {
    throw new ForbiddenError('Document context is required');
  }

  const grant = await prisma.documentGrant.findUnique({
    where: { documentId_userId: { documentId, userId } },
  });

  if (!grant) {
    throw new ForbiddenError(`Missing required permission: ${required.join(', ')}`);
  }

  if (grant.expiresAt && grant.expiresAt < new Date()) {
    throw new ForbiddenError('Your access to this document has expired');
  }

  if (!required.every((p) => grant.permissions.includes(p))) {
    throw new ForbiddenError(`Missing required permission: ${required.join(', ')}`);
  }
}

// ─────────────────────────────────────────────
// The wrapper
// ─────────────────────────────────────────────

export function createHandler<P extends Record<string, string> = Record<string, string>>(
  options: HandlerOptions,
  handler: Handler<P>,
) {
  return async (req: NextRequest, args: RouteArgs<P>): Promise<NextResponse> => {
    const requestId = req.headers.get('x-request-id') ?? randomUUID();
    const startedAt = Date.now();
    const pathname = req.nextUrl.pathname;

    try {
      const params = ((await args?.params) ?? {}) as P;

      // documentPermission implies workspace, which implies auth.
      const needsWorkspace = options.workspace || !!options.documentPermission;
      const needsAuth = options.auth || needsWorkspace;

      let user: SessionUser | undefined;
      if (needsAuth) {
        user = await requireAuth();
      }

      if (options.rateLimit) {
        const limited = await enforceRateLimit(req, options.rateLimit, user?.id, pathname);
        if (limited) return limited;
      }

      let workspaceId = '';
      let member: MemberContext | undefined;
      let permissions: string[] = [];

      if (needsWorkspace) {
        const resolved = await resolveWorkspace(user!.id, params.workspaceId);
        workspaceId = resolved.workspaceId;
        member = resolved.member;
        permissions = resolved.permissions;
      }

      if (options.permissions?.length) {
        requirePermission(permissions, options.permissions);
      }

      if (options.documentPermission?.length) {
        await requireDocumentPermission(
          permissions,
          options.documentPermission,
          user!.id,
          params.id ?? params.documentId,
        );
      }

      const searchParams = req.nextUrl.searchParams;

      const response = await handler({
        req,
        params,
        searchParams,
        query: Object.fromEntries(searchParams.entries()),
        requestId,
        user: user as SessionUser,
        workspaceId,
        member: member as MemberContext,
        permissions,
      });

      response.headers.set('X-Request-Id', requestId);

      log.info(
        `${req.method} ${pathname} ${response.status} - ${Date.now() - startedAt}ms`,
      );

      return response;
    } catch (error) {
      const response = toErrorResponse(error, {
        method: req.method,
        url: pathname,
        requestId,
      });
      response.headers.set('X-Request-Id', requestId);
      return response;
    }
  };
}

/**
 * Parse a JSON body, converting malformed JSON into a 400 rather than an
 * unhandled crash. Express's body parser did this implicitly.
 */
export async function jsonBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new AppError('Invalid JSON body', 400, 'INVALID_JSON');
  }
}
