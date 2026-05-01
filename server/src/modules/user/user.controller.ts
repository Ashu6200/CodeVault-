import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { UserService } from './user.service';
import { updateUserSchema } from './user.schema';

export class UserController extends BaseController {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  public getProfile = this.catchAsync(async (req: Request, res: Response) => {
    const profile = await this.userService.getProfile(req.user!.id);
    this.sendSuccess(res, profile);
  });

  public updateProfile = this.catchAsync(async (req: Request, res: Response) => {
    const data = updateUserSchema.parse(req.body);
    const user = await this.userService.updateProfile(req.user!.id, data);
    this.sendSuccess(res, user);
  });
}
