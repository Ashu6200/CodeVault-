import 'server-only';
import { z } from 'zod';

// ─────────────────────────────────────────────
// Environment Configuration — Validated with Zod
//
// Validation is LAZY. The Express version parsed at import time and called
// process.exit(1) on failure, which would abort `next build` (Next evaluates
// modules during compilation, when the runtime env is not necessarily present).
// Instead we validate on first property access and throw, so a misconfigured
// environment surfaces as a normal 500 at request time rather than killing
// the build.
// ─────────────────────────────────────────────

const configSchema = z.object({
  // Runtime
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),
  BETTER_AUTH_URL: z.string().default('http://localhost:3000'),

  // Trusted origins for Better Auth (CSV). No longer used for CORS — the API
  // is same-origin now — but Better Auth still validates callback origins.
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_PLAN_ID_TEAM: z.string().optional(),
  RAZORPAY_PLAN_ID_ENTERPRISE: z.string().optional(),

  // Security
  RATE_LIMIT_BYPASS_IPS: z.string().optional(),
});

export type AppConfig = z.infer<typeof configSchema>;

let cached: AppConfig | null = null;

function loadConfig(): AppConfig {
  if (cached) return cached;

  const parsed = configSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${details}`);
  }

  cached = parsed.data;
  return cached;
}

/**
 * Validated environment config.
 *
 * A Proxy so that merely importing this module is side-effect free; the schema
 * runs the first time a property is actually read.
 */
export const config = new Proxy({} as AppConfig, {
  get(_target, prop: string) {
    return loadConfig()[prop as keyof AppConfig];
  },
  has(_target, prop: string) {
    return prop in loadConfig();
  },
  ownKeys() {
    return Reflect.ownKeys(loadConfig());
  },
  getOwnPropertyDescriptor(_target, prop: string) {
    return Object.getOwnPropertyDescriptor(loadConfig(), prop);
  },
});
