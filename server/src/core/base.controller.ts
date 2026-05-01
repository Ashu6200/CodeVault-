import { Request, Response } from 'express';
import { PaginatedResult } from './types/common';
import { apiResponse } from './utils/apiResponse';

/**
 * Base Controller providing shared utilities for all module controllers.
 */
export abstract class BaseController {
  /**
   * Catch async errors and pass to next()
   */
  protected catchAsync(fn: Function) {
    return (req: Request, res: Response, next: any) => {
      fn(req, res, next).catch(next);
    };
  }

  /**
   * Send a standard success response (200/201)
   * Maintains compatibility with existing (res, data, statusCode) calls
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    statusCodeOrMessage: number | string = 200,
    statusCode: number = 200,
  ): void {
    const req = (res as any).req;

    let finalStatusCode = statusCode;
    let finalMessage = 'Success';

    if (typeof statusCodeOrMessage === 'string') {
      finalMessage = statusCodeOrMessage;
    } else {
      finalStatusCode = statusCodeOrMessage;
    }

    apiResponse(req, res, finalStatusCode, finalMessage, data);
  }

  /**
   * Send a paginated success response
   */
  protected sendPaginated<T>(
    res: Response,
    result: PaginatedResult<T>,
    message: string = 'Success',
    statusCode: number = 200,
  ): void {
    const { data, ...meta } = result;
    const req = (res as any).req;

    apiResponse(req, res, statusCode, message, { data, meta });
  }
}
