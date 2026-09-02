import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// ─────────────────────────────────────────────
// Logger — Winston with Daily Rotation
// Production: JSON logs with file rotation
// Development: Colorized console with metadata
// ─────────────────────────────────────────────

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const isProd = process.env.NODE_ENV === 'production';
const logsDir = path.join(process.cwd(), 'logs');

// File transports are enabled only in a real Node server process.
//
// During `next build` this module is evaluated by build workers, where opening
// rotating file handles and installing winston's exceptionHandlers /
// rejectionHandlers keeps the event loop alive (hanging the build) and hijacks
// Next's own crash handling. NEXT_RUNTIME is set to 'nodejs' at request time
// but is undefined during compilation.
const isNodeRuntime = process.env.NEXT_RUNTIME === 'nodejs';

// Create logs directory (fail gracefully for read-only filesystems)
let canWriteLogs = false;
if (isNodeRuntime) {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    canWriteLogs = true;
  } catch {
    console.warn('[logger] Cannot create logs directory — file transports disabled');
  }
}

// ── Format: Dev (colorized, human-readable) ──
const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const base = `[${ts}] ${level}: ${stack || message}`;
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return base + metaStr;
});

// ── Format: Prod (compact JSON) ──
const prodFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const base = `[${ts}] ${level}: ${stack || message}`;
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return base + metaStr;
});

// ── File Transports (with daily rotation) ──
const fileTransports: winston.transport[] = canWriteLogs
  ? [
      new DailyRotateFile({
        dirname: logsDir,
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
        format: json(),
      }),
      new DailyRotateFile({
        dirname: logsDir,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '30d',
        zippedArchive: true,
        format: json(),
      }),
    ]
  : [];

// ── Create Logger ──
const winstonLogger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
  transports: [
    new winston.transports.Console({
      format: isProd ? prodFormat : combine(colorize(), devFormat),
    }),
    ...fileTransports,
  ],
  exitOnError: false,
  exceptionHandlers: canWriteLogs
    ? [
        new DailyRotateFile({
          dirname: logsDir,
          filename: 'exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          zippedArchive: true,
        }),
      ]
    : [],
  rejectionHandlers: canWriteLogs
    ? [
        new DailyRotateFile({
          dirname: logsDir,
          filename: 'rejections-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          zippedArchive: true,
        }),
      ]
    : [],
});

winstonLogger.on('error', (error) => {
  console.error('Logger transport error:', error);
});

// ─────────────────────────────────────────────
// Wrapper — maintains the same API as the old logger
// so all existing imports (logger.child, logger.info)
// continue working without changes.
// ─────────────────────────────────────────────

class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  debug(message: string, ...args: unknown[]): void {
    winstonLogger.debug(this.prefix(message), ...args);
  }

  info(message: string, ...args: unknown[]): void {
    winstonLogger.info(this.prefix(message), ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    winstonLogger.warn(this.prefix(message), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    winstonLogger.error(this.prefix(message), ...args);
  }

  child(context: string): Logger {
    return new Logger(this.context ? `${this.context}:${context}` : context);
  }

  private prefix(message: string): string {
    return this.context ? `[${this.context}] ${message}` : message;
  }
}

export const logger = new Logger();

/** Direct access to the underlying winston instance (for advanced usage) */
export const wLogger = winstonLogger;
