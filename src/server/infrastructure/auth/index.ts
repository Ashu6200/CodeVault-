import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@infra/db';
import { redis } from '@infra/redis';
import { config } from '@infra/config';
import { logger } from '@infra/logger';
import bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────
// Better Auth — Production Configuration
// Features:
//   - Prisma + PostgreSQL adapter
//   - Redis secondary storage (sessions, rate limits)
//   - bcrypt password hashing
//   - Session transform (attach workspace context)
//   - Database hooks (pre-create validation)
//   - Cookie security configuration
// ─────────────────────────────────────────────

const log = logger.child('Auth');

function getTrustedOrigins(): string[] {
  if (config.CORS_ORIGIN) {
    return config.CORS_ORIGIN.split(',')
      .map((o: string) => o.replace(/\/$/, '').trim())
      .filter((o: string) => o.length > 0);
  }
  return ['http://localhost:3000', 'http://localhost:5173'];
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,
  basePath: '/api/auth',
  trustedOrigins: getTrustedOrigins(),

  // ── Schema mapping ──
  // This database predates Better Auth and names the account identifier
  // `providerAccountId`. Mapping it here avoids adding a redundant
  // `accountId` column and preserves @@unique([providerId, providerAccountId]).
  account: {
    fields: {
      accountId: 'providerAccountId',
    },
  },

  // ── Redis Secondary Storage ──
  secondaryStorage: {
    get: async (key: string) => redis.get(`ba:${key}`),
    set: async (key: string, value: string, ttl?: number) => {
      if (ttl) {
        await redis.set(`ba:${key}`, value, 'EX', ttl);
      } else {
        await redis.set(`ba:${key}`, value);
      }
    },
    delete: async (key: string) => {
      await redis.del(`ba:${key}`);
    },
  },

  // ── Email + Password ──
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: config.NODE_ENV === 'production',
    autoSignIn: false,
    password: {
      hash: async (password: string) => {
        const salt = await bcrypt.genSalt(12);
        return bcrypt.hash(password, salt);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        return bcrypt.compare(password, hash);
      },
    },
  },

  // ── Session ──
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 86400, // Refresh once per day
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 min cookie cache
    },
  },

  // ── Database Hooks ──
  databaseHooks: {
    session: {
      create: {
        before: async (session: { userId: string }) => {
          // Check if user is soft-deleted
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { deletedAt: true },
          });

          if (user?.deletedAt) {
            throw new Error('Account has been deactivated');
          }
        },
      },
      delete: {
        before: async (session: { token: string }) => {
          try {
            // Invalidate cached session data
            await redis.del(`session:me:${session.token}`);
          } catch (err) {
            log.warn(
              'Failed to invalidate session cache:',
              err instanceof Error ? err.message : String(err),
            );
          }
        },
      },
    },
  },

  // ── Rate Limiting ──
  rateLimit:
    config.NODE_ENV === 'production'
      ? {
          enabled: true,
          window: 60,
          max: 100,
          storage: 'secondary-storage' as const,
          customRules: {
            '/sign-in/email': { window: 60, max: 10 },
            '/sign-up/email': { window: 300, max: 5 },
            '/forget-password': { window: 300, max: 3 },
          },
        }
      : { enabled: false },

  // ── Cookie Security ──
  advanced: {
    useSecureCookies: config.NODE_ENV === 'production',
    defaultCookieAttributes: {
      sameSite: config.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      path: '/',
    },
  },

  // ── Logging ──
  logger: {
    level: config.NODE_ENV === 'production' ? 'error' : 'debug',
    log: (level: string, message: string, ...args: unknown[]) => {
      const prefix = `[BetterAuth] ${message}`;
      if (level === 'error') log.error(prefix, ...args);
      else if (level === 'warn') log.warn(prefix, ...args);
      else if (level === 'debug') log.debug(prefix, ...args);
      else log.info(prefix, ...args);
    },
  },
});
