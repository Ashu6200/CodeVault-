# CodeVault 2.0

A **single Next.js full-stack application**. The UI, the REST API, the business
logic and database access all live in this one project and run in one process —
there is no separate backend service.

This repo previously held two applications (`client/` running Next.js and
`server/` running Express). The Express server has been removed; its routes,
services and infrastructure now live under `src/server/`, exposed through
Next.js Route Handlers.

---

## Architecture

```text
Next.js
├── Frontend
│   ├── app/                    App Router pages (Server + Client Components)
│   ├── components/             UI components (shadcn / Base UI + Tailwind 4)
│   ├── features/               RTK Query API slices, per feature
│   └── store/                  Redux Toolkit store
│
├── Backend  (src/server/, server-only)
│   ├── app/api/**/route.ts     Route Handlers — the HTTP surface
│   ├── http/                   createHandler (auth, RBAC, rate limit, errors)
│   ├── modules/<feature>/      *.service.ts + *.schema.ts (zod)
│   └── infrastructure/         auth, db, redis, razorpay, logger, config
│
└── Prisma
    ├── prisma/schema.prisma
    └── PostgreSQL
```

Request flow:

```text
Client Component -> /api/*  -> Route Handler -> createHandler -> Service -> Prisma -> Postgres
Server Component -> Service -> Prisma -> Postgres            (no internal HTTP hop)
```

### createHandler

Express composed behaviour as a middleware chain. Route Handlers have no chain,
so the whole pipeline lives in one wrapper, `src/server/http/createHandler.ts`:

```ts
export const GET = createHandler(
  { workspace: true, permissions: ['doc:read'] },
  async ({ workspaceId, query }) => paginated(await documentService.list(workspaceId, query)),
);
```

| Option | Effect |
| --- | --- |
| `auth` | Requires a valid Better Auth session; rejects soft-deleted users |
| `workspace` | Resolves membership from `:workspaceId`; implies `auth` |
| `permissions` | RBAC — **all** listed permissions required; `*` grants everything |
| `documentPermission` | RBAC first, then per-document `DocumentGrant` ABAC; implies `workspace` |
| `rateLimit` | Redis fixed-window limit; fails open if Redis is unavailable |

Every successful response uses one envelope:

```json
{ "success": true, "statusCode": 200, "message": "Success", "data": {} }
```

Errors use the same shape with `success: false` plus an optional `details`
(validation errors always; stack traces in development only).

---

## Local development

### Prerequisites

Node 20+ and Docker (for PostgreSQL and Redis).

### Setup

```bash
cp .env.example .env          # then edit the values
npm install
docker compose up -d postgres redis
npx prisma migrate deploy     # apply migrations (never "migrate reset")
npx prisma generate
npm run dev                   # http://localhost:3000
```

If ports 5432 or 6379 are already in use on your machine, override them and
point `DATABASE_URL` / `REDIS_URL` at the new ports:

```bash
POSTGRES_PORT=5434 REDIS_PORT=6380 docker compose up -d postgres redis
```

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run prisma:generate` | Regenerate Prisma Client |
| `npm run prisma:deploy` | Apply migrations (use this in deployment) |
| `npm run prisma:migrate` | Create a migration (development only) |
| `npm run prisma:studio` | Browse the database |

---

## Environment variables

Every variable is **server-only**. There are no `NEXT_PUBLIC_*` variables: the
frontend calls the API at the relative path `/api`, so no origin or secret needs
to be published to the browser. Never rename any of these to `NEXT_PUBLIC_*`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | yes | Session signing secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | no | This app's own origin (default `http://localhost:3000`) |
| `REDIS_URL` | no | Sessions, rate limiting, document cache |
| `CORS_ORIGIN` | no | Trusted origins for Better Auth callbacks |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | no | Billing; routes error cleanly when unset |
| `RAZORPAY_WEBHOOK_SECRET` | no | HMAC verification for the Razorpay webhook |
| `RAZORPAY_PLAN_ID_TEAM`, `RAZORPAY_PLAN_ID_ENTERPRISE` | no | Razorpay plan IDs |
| `RATE_LIMIT_BYPASS_IPS` | no | Comma-separated IPs exempt from rate limiting |

Configuration is validated with zod **lazily**, on first access, so a missing
variable surfaces as a runtime error instead of breaking `next build`.

---

## Database

PostgreSQL via Prisma 7 with the `@prisma/adapter-pg` driver adapter. The client
is a `globalThis` singleton (`src/server/infrastructure/db`) so hot reload does
not exhaust the connection pool.

```bash
npx prisma migrate deploy   # apply pending migrations
npx prisma validate
npx prisma studio
```

**Never run `prisma migrate reset` against a database you care about.**

---

## Authentication

[Better Auth](https://better-auth.com) with email and password, mounted at
`/api/auth/[...all]`.

- Sessions are opaque tokens in HTTP-only cookies, stored in Redis (`ba:` keys)
  with PostgreSQL as the backing store. 7-day expiry, refreshed daily, with a
  5-minute cookie cache.
- Passwords are hashed with bcrypt (cost 12).
- Cookies are `secure` and `sameSite=none` in production, `lax` in development.
- Email verification is required **in production only**. No mail provider is
  configured, so verification emails are not sent — see Known gaps.
- `autoSignIn` is off: signing up does not log you in; the client signs in after.

Authorisation is enforced **server-side only**, inside `createHandler`. Roles are
seeded per workspace (Owner `*`, Admin, Member, Guest) and permissions are plain
strings such as `doc:read` or `billing:write`.

---

## API

All routes live under `/api` and authenticate by session cookie.

| Area | Endpoints |
| --- | --- |
| Auth | `/api/auth/*` (Better Auth), `GET /api/auth/me`, `POST /api/auth/deactivate` |
| Users | `GET`, `PUT` `/api/users/profile` |
| Workspaces | `GET`, `POST` `/api/workspaces`; `GET /api/workspaces/slug/:slug`; `GET`, `PUT`, `DELETE` `/api/workspaces/:workspaceId` |
| Roles | `GET`, `POST` `.../roles`; `PUT`, `DELETE` `.../roles/:id` |
| Members | `GET`, `POST` `.../members`; `PUT`, `DELETE` `.../members/:id` |
| Invites | `GET`, `POST` `.../invites`; `POST .../invites/accept`; `DELETE .../invites/:id` |
| Documents | `GET`, `POST` `.../documents`; `GET .../documents/tree`; `GET`, `PUT`, `DELETE` `.../documents/:id`; `GET .../:id/versions`; `GET`, `POST` `.../:id/grants`; `DELETE .../:id/grants/:userId` |
| Comments | `GET`, `POST` `.../comments/documents/:documentId/comments`; `PUT`, `DELETE` `.../comments/comments/:id`; `POST .../comments/comments/:id/resolve` |
| Audit | `GET /api/workspaces/:workspaceId/audit` |
| Billing | `GET .../billing/subscription`; `GET .../billing/history`; `POST .../billing/create-subscription`, `.../verify-payment`, `.../cancel-subscription` |
| Razorpay webhook | `POST /api/billing/razorpay-webhook` (unauthenticated; HMAC-verified raw body) |
| Notifications | `GET /api/notifications`; `GET .../unread-count`; `POST .../mark-read`; `POST .../mark-all-read` |
| API keys | `GET`, `POST` `/api/api-keys`; `DELETE /api/api-keys/:id` |
| Health | `GET /health`, `GET /ready` |

CORS is not configured, because the frontend is same-origin. If you ever expose
this API to another origin, add an explicit allowlist — never `*` in production.

---

## Deployment

Run `npm run build && npm start`, or use the provided `Dockerfile` and
`docker-compose.yml` (which also start PostgreSQL and Redis):

```bash
docker compose up -d --build
```

This is a standard Next.js server: there is no custom server and no background
worker process to run alongside it.

---

## Known gaps

Deliberate, documented limitations rather than bugs to hunt:

- **No real-time collaboration.** Two people editing one document overwrite each
  other; the editor autosaves on a 1 second debounce.
- **No outgoing webhooks.** The `WebhookEndpoint` and `WebhookDelivery` tables
  remain in the schema, but nothing writes to or delivers from them.
- **No email is sent.** Invites create a row and return a token. Because there is
  no mail provider, production email verification will block sign-in until a
  user's `emailVerified` is set another way.
- **API keys cannot authenticate.** `/api/api-keys` mints keys, but no route
  accepts them. This was already true before the merge.
- **Cross-workspace ID checks.** Several services resolve records by `:id`
  without confirming they belong to the `:workspaceId` in the path. Pre-existing
  behaviour, migrated as-is.
