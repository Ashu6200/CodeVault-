import { createAuthClient } from "better-auth/react";

// Better Auth is served from this same app at /api/auth, so the client defaults
// to the current origin. NEXT_PUBLIC_AUTH_URL is gone — it pointed at the old
// standalone Express server.
export const authClient = createAuthClient();

export const {
    signIn,
    signUp,
    signOut,
    useSession
} = authClient;
