import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// ─────────────────────────────────────────────
// Zod Validation Middleware
// Validates request body, params, or query against a Zod schema.
// ─────────────────────────────────────────────

type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Creates a middleware that validates the specified request property
 * against the given Zod schema. On failure, passes ZodError to next().
 *
 * Usage:
 *   router.post('/', validate(createWorkspaceSchema), controller.create);
 *   router.get('/:id', validate(idParamSchema, 'params'), controller.getById);
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return next(result.error);
    }

    // Replace with parsed (coerced/transformed) data
    (req as any)[target] = result.data;

    next();
  };
};
