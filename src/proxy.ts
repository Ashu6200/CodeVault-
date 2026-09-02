import { NextResponse, type NextRequest } from 'next/server';

// ─────────────────────────────────────────────
// Edge proxy (formerly middleware.ts) — cheap, URL-only request guards
//
// Ported from the Express global middleware stack. Only the checks that are
// genuinely useful at the edge live here; everything that needs the database,
// Redis or a session (auth, RBAC, rate limiting, error shaping) belongs to
// createHandler instead.
//
// This file runs in the Edge runtime, so it must NOT import from @infra/* —
// pulling in winston, ioredis or the config loader would drag Node built-ins
// into the Edge bundle and fail the build. The logic is inlined for that reason.
// ─────────────────────────────────────────────

const BAD_BOTS = [
  'sqlmap',
  'nmap',
  'nikto',
  'acunetix',
  'wpscan',
  'dirbuster',
  'masscan',
  'gobuster',
  'nuclei',
  'hydra',
  'openvas',
  'burpsuite',
  'zaproxy',
  'havij',
  'w3af',
];

const PATH_TRAVERSAL = /(\.\.\/|\.\.\|%2e%2e%2f|%2e%2e%5c)/i;

// URL-only. The Express version also scanned req.body, but it ran before the
// body parser, so that check was always inert — and re-adding it here would
// mean consuming the request stream before the handler can read it.
const SQL_INJECTION =
  /UNION\s+SELECT|INSERT\s+INTO|UPDATE\s+.*SET|DELETE\s+FROM|DROP\s+TABLE|OR\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i;

function blocked(message: string, code: string, status: number) {
  return NextResponse.json(
    { success: false, statusCode: status, message, data: null, details: { code } },
    { status },
  );
}

export function proxy(req: NextRequest) {
  const ua = (req.headers.get('user-agent') || '').toLowerCase();
  if (ua && BAD_BOTS.some((bot) => ua.includes(bot))) {
    return blocked('Access denied', 'BOT_BLOCKED', 403);
  }

  const rawUrl = req.nextUrl.pathname + req.nextUrl.search;

  // Decode iteratively until stable, to defeat double-encoding bypasses.
  let decoded = rawUrl;
  let previous: string;
  do {
    previous = decoded;
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
  } while (decoded !== previous);

  if (PATH_TRAVERSAL.test(rawUrl) || PATH_TRAVERSAL.test(decoded)) {
    return blocked('Malicious path detected', 'SECURITY_BLOCK', 400);
  }

  if (SQL_INJECTION.test(rawUrl) || SQL_INJECTION.test(decoded)) {
    return blocked('Potential SQL injection detected', 'SECURITY_BLOCK', 400);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets and image optimisation — running these checks on every
  // chunk request would be pure overhead.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
