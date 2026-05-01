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

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Security
  RATE_LIMIT_BYPASS_IPS: z.string().optional(),

  // Frontend
  FRONTEND_URL: z.string().optional(),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

console.log('DEBUG: Environment variables validated');
console.log('DEBUG: PORT:', parsed.data.PORT);
console.log('DEBUG: DATABASE_URL:', parsed.data.DATABASE_URL.replace(/:[^:@]+@/, ':***@'));

export const config = parsed.data;
