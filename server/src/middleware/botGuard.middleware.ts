import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors';

// ─────────────────────────────────────────────
// Bot Guard Middleware
// Blocks known malicious scanners and attack tools.
// Place early in the middleware stack.
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

export const botGuard = (req: Request, _res: Response, next: NextFunction): void => {
  const ua = (req.headers['user-agent'] || '').toLowerCase();

  if (BAD_BOTS.some((bot) => ua.includes(bot))) {
    return next(new AppError('Access denied', 403, 'BOT_BLOCKED'));
  }

  next();
};
