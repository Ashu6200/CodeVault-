import { NextResponse } from 'next/server';

/**
 * GET /health — liveness probe.
 * Kept at the root path (not under /api) to match the previous Express server,
 * so existing container healthchecks keep working.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    error: null,
  });
}
