import { Request, Response } from 'express';

// ─────────────────────────────────────────────
// API Response Helper
// Standardized success response format used
// across all controllers. Includes request
// context in development for debugging.
// ─────────────────────────────────────────────

const isProd = process.env.NODE_ENV === 'production';

export const apiResponse = (
  req: Request,
  res: Response,
  statusCode: number,
  message: string,
  data: any = null,
): void => {
  const response: Record<string, any> = {
    success: true,
    statusCode,
    message,
    data,
  };

  if (!isProd) {
    response.request = {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      params: req.params,
      body: req.body
    };
  }

  res.status(statusCode).json(response);
};
