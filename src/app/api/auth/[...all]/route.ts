import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@infra/auth';

// Better Auth's own routes: sign-up/email, sign-in/email, sign-out,
// get-session, forget-password, reset-password, verify-email, etc.
//
// Under Express this was `router.all('/*', toNodeHandler(auth))`, which is
// broken on Express 5 (path-to-regexp 8 rejects the unnamed wildcard) and was
// mounted *after* express.json(), even though the node handler needs the raw
// stream. Both problems disappear here.
//
// The sibling static routes /api/auth/me and /api/auth/deactivate take
// precedence over this catch-all, matching the Express route order.
export const { GET, POST } = toNextJsHandler(auth);
