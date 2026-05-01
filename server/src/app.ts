import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from '@infra/config';
console.log('DEBUG: app.ts: config loaded');
import { errorHandler } from '@middleware/errorHandler.middleware';
console.log('DEBUG: app.ts: errorHandler loaded');
import { rateLimiter } from '@middleware/rateLimiter.middleware';
import { botGuard } from '@middleware/botGuard.middleware';
import { pathTraversalGuard } from '@middleware/pathTraversalGuard.middleware';
import { sqlInjectionGuard } from '@middleware/sqlInjectionGuard.middleware';
import { httpLogger } from '@middleware/httpLogger.middleware';
import { setupPrometheus } from '@infra/monitoring/prometheus';
import { AppError } from '@core/errors';

// ── Module Route Imports ──
import { authRoutes } from '@modules/auth';
import { userRoutes } from '@modules/user';
import { workspaceRoutes } from '@modules/workspace';
import { roleRoutes } from '@modules/role';
import { memberRoutes } from '@modules/member';
import { inviteRoutes } from '@modules/invite';
import { documentRoutes } from '@modules/document';
import { commentRoutes } from '@modules/comment';
import { notificationRoutes } from '@modules/notification';
import { apiKeyRoutes } from '@modules/apiKey';
import { auditRoutes } from '@modules/audit';
import { webhookRoutes } from '@modules/webhook';
import { billingRoutes } from '@modules/billing';

// ─────────────────────────────────────────────
// Express App
// ─────────────────────────────────────────────

const app = express();

// ── CORS Configuration ──
const allowedOrigins = config.CORS_ORIGIN
  ? config.CORS_ORIGIN.split(',').map((o) => o.replace(/\/$/, '').trim())
  : ['http://localhost:5173'];

const allowAllOrigins = !config.CORS_ORIGIN || allowedOrigins.length === 0;

const allowedHeadersList = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Origin',
  'Accept',
  'Access-Control-Allow-Origin',
  'Idempotency-Key',
  'idempotency-key',
];

// Verify CORS headers before hitting the middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestHeaders = req.headers['access-control-request-headers'];
  if (requestHeaders) {
    const requestedHeaders = requestHeaders.split(',').map((h) => h.trim().toLowerCase());
    const allowedLower = allowedHeadersList.map((h) => h.toLowerCase());
    const unAllowedHeaders = requestedHeaders.filter((h) => !allowedLower.includes(h));
    if (unAllowedHeaders.length > 0) {
      return next(
        new AppError(`CORS blocked: Headers not allowed: ${unAllowedHeaders.join(', ')}`, 403),
      );
    }
  }
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowAllOrigins) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    allowedHeaders: allowedHeadersList,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  }),
);

// ── Security & Global Middleware ──
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
  }),
);

app.use(botGuard);
app.use(httpLogger);
app.use(pathTraversalGuard);
app.use(sqlInjectionGuard);
app.use(cookieParser());

setupPrometheus(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.raw({ limit: '50mb' }));

// Global rate limiter (100 req/min)
app.use(rateLimiter({ limit: 100, windowSeconds: 60 }));

// ── Health Check ──
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    error: null,
  });
});

// ─────────────────────────────────────────────
// Route Registration
// ─────────────────────────────────────────────

// Auth (Better Auth handler + custom endpoints)
app.use('/api/auth', authRoutes);

// User profile
app.use('/api/users', userRoutes);

// Workspaces
app.use('/api/workspaces', workspaceRoutes);

// Workspace-scoped resources
app.use('/api/workspaces/:workspaceId/roles', roleRoutes);
app.use('/api/workspaces/:workspaceId/members', memberRoutes);
app.use('/api/workspaces/:workspaceId/invites', inviteRoutes);
app.use('/api/workspaces/:workspaceId/documents', documentRoutes);
app.use('/api/workspaces/:workspaceId/comments', commentRoutes);
app.use('/api/workspaces/:workspaceId/audit', auditRoutes);
app.use('/api/workspaces/:workspaceId/webhooks', webhookRoutes);
app.use('/api/workspaces/:workspaceId/billing', billingRoutes);

// Global resources
app.use('/api/notifications', notificationRoutes);
app.use('/api/api-keys', apiKeyRoutes);

// ── Global Error Handler (must be last) ──
app.use(errorHandler);

export default app;
