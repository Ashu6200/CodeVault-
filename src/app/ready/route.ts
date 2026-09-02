import { NextResponse } from 'next/server';
import { prisma } from '@infra/db';
import { redis } from '@infra/redis';

/** GET /ready — readiness probe: verifies Postgres and Redis connectivity. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();

    return NextResponse.json({
      success: true,
      data: { status: 'ready', database: 'connected', redis: 'connected' },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: {
          status: 'not_ready',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        error: 'Connectivity check failed',
      },
      { status: 503 },
    );
  }
}
