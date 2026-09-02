import 'server-only';
import Razorpay from 'razorpay';
import { config } from '@infra/config';
import { AppError } from '@core/errors';

// ─────────────────────────────────────────────
// Razorpay client
//
// Constructed LAZILY. The razorpay-node constructor throws
// "`key_id` is mandatory" when the key is undefined, and the Razorpay env vars
// are optional — so building at module scope would abort `next build` on any
// machine without billing credentials configured.
//
// Accessing the client without credentials now raises a normal AppError, so a
// billing route returns a clean 500 instead of crashing the process.
// ─────────────────────────────────────────────

const RAZORPAY_KEY = Symbol.for('app.razorpay.client');

function buildRazorpay(): Razorpay {
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    throw new AppError(
      'Billing is not configured on this server',
      500,
      'RAZORPAY_NOT_CONFIGURED',
    );
  }

  return new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
  });
}

export function getRazorpay(): Razorpay {
  const g = globalThis as unknown as Record<symbol, Razorpay | undefined>;
  if (!g[RAZORPAY_KEY]) {
    g[RAZORPAY_KEY] = buildRazorpay();
  }
  return g[RAZORPAY_KEY]!;
}

/** Proxy so existing `razorpay.subscriptions.create(...)` call sites are unchanged. */
export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    const client = getRazorpay();
    const value = client[prop as keyof Razorpay];
    return typeof value === 'function'
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
