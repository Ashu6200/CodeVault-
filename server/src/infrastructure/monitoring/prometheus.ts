import { Express } from 'express';
import { logger } from '@infra/logger';

/**
 * Basic Prometheus Monitoring Setup.
 * Note: Requires 'prom-client' dependency.
 */
export const setupPrometheus = (app: Express) => {
  log.info('Monitoring setup started (Prometheus stub)');

  // Implementation would go here if prom-client were installed:
  // const register = new Registry();
  // collectDefaultMetrics({ register });

  app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('# Prometheus metrics placeholder\n# Install prom-client to enable real metrics.');
  });
};

const log = logger.child('Monitoring');
