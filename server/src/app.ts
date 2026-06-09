import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from '@infra/config';
import { prisma } from '@infra/db';
import { redis } from '@infra/redis';
import { errorHandler } from '@middleware/errorHandler.middleware';
import { rateLimiter } from '@middleware/rateLimiter.middleware';
import { botGuard } from '@middleware/botGuard.middleware';
import { pathTraversalGuard } from '@middleware/pathTraversalGuard.middleware';
import { sqlInjectionGuard } from '@middleware/sqlInjectionGuard.middleware';
import { httpLogger } from '@middleware/httpLogger.middleware';
import { requestId } from '@middleware/requestId.middleware';
import { requestTimeout } from '@middleware/timeout.middleware';
import { setupPrometheus } from '@infra/monitoring/prometheus';
import { AppError } from '@core/errors';

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
import { billingRoutes, razorpayWebhookHandler } from '@modules/billing';


const app = express();

app.use(compression());

const allowedOrigins = config.CORS_ORIGIN
  ? config.CORS_ORIGIN.split(',').map((o) => o.replace(/\/$/, '').trim())
  : ['http://localhost:5173'];

const allowAllOrigins =
  config.NODE_ENV === 'development' && (!config.CORS_ORIGIN || allowedOrigins.length === 0);

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

app.use(requestTimeout(30));
app.use(requestId);
app.use(botGuard);
app.use(httpLogger);
app.use(pathTraversalGuard);
app.use(sqlInjectionGuard);
app.use(cookieParser());

setupPrometheus(app);

// Razorpay webhook — must be registered BEFORE express.json() to receive the raw body
// needed for HMAC signature verification (x-razorpay-signature header)
app.post(
  '/api/billing/razorpay-webhook',
  express.raw({ type: 'application/json' }),
  razorpayWebhookHandler,
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.raw({ limit: '10mb' }));

app.use(rateLimiter({ limit: 100, windowSeconds: 60 }));

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

app.get('/ready', async (_req, res) => {
  try {
    // Check DB
    await prisma.$queryRaw`SELECT 1`;
    // Check Redis
    await redis.ping();

    res.status(200).json({
      success: true,
      data: {
        status: 'ready',
        database: 'connected',
        redis: 'connected',
      },
      error: null,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: {
        status: 'not_ready',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      error: 'Connectivity check failed',
    });
  }
});



app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/workspaces', workspaceRoutes);

app.use('/api/workspaces/:workspaceId/roles', roleRoutes);
app.use('/api/workspaces/:workspaceId/members', memberRoutes);
app.use('/api/workspaces/:workspaceId/invites', inviteRoutes);
app.use('/api/workspaces/:workspaceId/documents', documentRoutes);
app.use('/api/workspaces/:workspaceId/comments', commentRoutes);
app.use('/api/workspaces/:workspaceId/audit', auditRoutes);
app.use('/api/workspaces/:workspaceId/webhooks', webhookRoutes);
app.use('/api/workspaces/:workspaceId/billing', billingRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/api/api-keys', apiKeyRoutes);

app.use(errorHandler);

export default app;
