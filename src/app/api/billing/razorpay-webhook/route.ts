import crypto from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { config } from '@infra/config';
import { logger } from '@infra/logger';
import { BillingService, type RazorpayWebhookEvent } from '@modules/billing';

const log = logger.child('RazorpayWebhook');
const billingService = new BillingService();

// Razorpay signs the exact bytes it sent, so the body must be read raw and the
// HMAC computed over it BEFORE any JSON parsing. Under Express this required
// registering the route ahead of express.json(); Route Handlers never parse a
// body implicitly, so reading it raw is the natural thing here.
//
// Deliberately unauthenticated and not rate limited — Razorpay calls it, and
// the signature check is the authentication. This matches the Express mount,
// which was registered before the global rate limiter.
const MAX_BODY_BYTES = 1_000_000;

function signaturesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(received, 'utf8');
  // timingSafeEqual throws on length mismatch, so guard first.
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json(
        { success: false, statusCode: 400, message: 'Missing x-razorpay-signature header', data: null },
        { status: 400 },
      );
    }

    // Next imposes no body size limit on Route Handlers (unlike the old
    // express.json({ limit: '10mb' })), so cap it explicitly.
    const declaredLength = Number(req.headers.get('content-length') ?? 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, statusCode: 413, message: 'Payload too large', data: null },
        { status: 413 },
      );
    }

    const rawBody = Buffer.from(await req.arrayBuffer());
    if (rawBody.byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, statusCode: 413, message: 'Payload too large', data: null },
        { status: 413 },
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET || '')
      .update(rawBody)
      .digest('hex');

    if (!signaturesMatch(expectedSignature, signature)) {
      log.warn('Rejected webhook with invalid signature');
      return NextResponse.json(
        { success: false, statusCode: 401, message: 'Invalid webhook signature', data: null },
        { status: 401 },
      );
    }

    const event = JSON.parse(rawBody.toString('utf8')) as RazorpayWebhookEvent;
    await billingService.handleRazorpayWebhook(event);

    return NextResponse.json({ success: true, statusCode: 200, message: 'Success', data: null });
  } catch (error) {
    // Razorpay retries on non-2xx, so log and report failure rather than
    // silently swallowing.
    log.error('Webhook processing failed:', error);
    return NextResponse.json(
      { success: false, statusCode: 500, message: 'Webhook processing failed', data: null },
      { status: 500 },
    );
  }
}
