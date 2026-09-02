-- Bring the database in line with schema.prisma.
--
-- This migration is deliberately ADDITIVE: it adds columns, backfills them and
-- adds constraints, but drops nothing, so it is safe to run against a database
-- that already holds data.
--
-- Two independent gaps are closed here:
--
--   1. Better Auth requires columns this schema never had (Account.password,
--      Session.token, and created/updated timestamps on both). Without them
--      email/password sign-up fails with
--      "Argument `providerType` is missing" / missing password column.
--
--   2. schema.prisma had already been migrated from Stripe to Razorpay, but the
--      committed SQL migrations still only create the Stripe columns. The
--      Razorpay columns the billing code reads did not exist in the database.
--
-- The legacy "stripe*" columns are intentionally LEFT IN PLACE rather than
-- dropped, so no data is lost. They are unused, nullable, and can be removed in
-- a separate, deliberate migration.

-- ─────────────────────────────────────────────
-- 1. Better Auth: Account
-- ─────────────────────────────────────────────
ALTER TABLE "Account"
  ADD COLUMN IF NOT EXISTS "password"              TEXT,
  ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Better Auth never writes this legacy column, so it cannot stay NOT NULL.
ALTER TABLE "Account" ALTER COLUMN "providerType" DROP NOT NULL;

-- ─────────────────────────────────────────────
-- 2. Better Auth: Session
-- ─────────────────────────────────────────────
ALTER TABLE "Session"
  ADD COLUMN IF NOT EXISTS "token"     TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing rows before enforcing NOT NULL. Session ids are already
-- unique, so reusing them satisfies the unique index.
UPDATE "Session" SET "token" = "id" WHERE "token" IS NULL;

ALTER TABLE "Session" ALTER COLUMN "token" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token");

-- ─────────────────────────────────────────────
-- 3. Razorpay billing columns
-- ─────────────────────────────────────────────
ALTER TABLE "Workspace"
  ADD COLUMN IF NOT EXISTS "razorpayCustomerId"     TEXT,
  ADD COLUMN IF NOT EXISTS "razorpaySubscriptionId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Workspace_razorpayCustomerId_key"
  ON "Workspace"("razorpayCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Workspace_razorpaySubscriptionId_key"
  ON "Workspace"("razorpaySubscriptionId");

ALTER TABLE "BillingTransaction"
  ADD COLUMN IF NOT EXISTS "razorpayPaymentId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "BillingTransaction_razorpayPaymentId_key"
  ON "BillingTransaction"("razorpayPaymentId");

ALTER TABLE "BillingTransaction" ALTER COLUMN "currency" SET DEFAULT 'inr';

-- ─────────────────────────────────────────────
-- 4. AuditLog.actorId foreign key (declared in schema.prisma, never created)
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AuditLog_actorId_fkey'
  ) THEN
    ALTER TABLE "AuditLog"
      ADD CONSTRAINT "AuditLog_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "User"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
