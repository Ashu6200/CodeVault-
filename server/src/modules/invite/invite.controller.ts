import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { InviteService } from './invite.service';
import { param } from '@core/utils/param';
import { createInviteSchema, acceptInviteSchema } from './invite.schema';

export class InviteController extends BaseController {
  private inviteService: InviteService;

  constructor() {
    super();
    this.inviteService = new InviteService();
  }

  public listPending = this.catchAsync(async (req: Request, res: Response) => {
    const invites = await this.inviteService.listPending(param(req, 'workspaceId'));
    this.sendSuccess(res, invites);
  });

  public send = this.catchAsync(async (req: Request, res: Response) => {
    const data = createInviteSchema.parse(req.body);
    const invite = await this.inviteService.sendInvite(
      param(req, 'workspaceId'),
      data,
      req.user!.id,
    );
    this.sendSuccess(res, invite, 201);
  });

  public accept = this.catchAsync(async (req: Request, res: Response) => {
    const { token } = acceptInviteSchema.parse(req.body);
    const member = await this.inviteService.acceptInvite(token, req.user!.id);
    this.sendSuccess(res, member);
  });

  public revoke = this.catchAsync(async (req: Request, res: Response) => {
    const result = await this.inviteService.revokeInvite(param(req, 'id'), req.user!.id);
    this.sendSuccess(res, result);
  });
}
