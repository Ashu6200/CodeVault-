import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { AuthService } from './auth.service';
import { auth } from '@infra/auth';


export class AuthController extends BaseController {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  /**
   * GET /api/auth/session — Get current session details
   */
  public getSession = this.catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await this.authService.getSessionInfo(userId);
    this.sendSuccess(res, result);
  });

  /**
   * POST /api/auth/deactivate — Soft-delete account
   */
  public deactivateAccount = this.catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await this.authService.deactivateAccount(userId);
    this.sendSuccess(res, result);
  });
}
