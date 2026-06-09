import { logger } from '@infra/logger';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// ─────────────────────────────────────────────
// Environment Configuration — Validated with Zod
// ─────────────────────────────────────────────

const configSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),
  BETTER_AUTH_URL: z.string().default('http://localhost:3000'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_PLAN_ID_TEAM: z.string().optional(),
  RAZORPAY_PLAN_ID_ENTERPRISE: z.string().optional(),

  // Security
  RATE_LIMIT_BYPASS_IPS: z.string().optional(),

  // Frontend
  FRONTEND_URL: z.string().optional(),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error('❌ Invalid environment variables:');
  logger.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const config = parsed.data;
