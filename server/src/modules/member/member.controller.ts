import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { MemberService } from './member.service';
import { param } from '@core/utils/param';
import { addMemberSchema, updateMemberSchema } from './member.schema';

export class MemberController extends BaseController {
  private memberService: MemberService;

  constructor() {
    super();
    this.memberService = new MemberService();
  }

  public list = this.catchAsync(async (req: Request, res: Response) => {
    const members = await this.memberService.listMembers(param(req, 'workspaceId'));
    this.sendSuccess(res, members);
  });

  public add = this.catchAsync(async (req: Request, res: Response) => {
    const data = addMemberSchema.parse(req.body);
    const member = await this.memberService.addMember(
      param(req, 'workspaceId'),
      data,
      req.user!.id,
    );
    this.sendSuccess(res, member, 201);
  });

  public update = this.catchAsync(async (req: Request, res: Response) => {
    const data = updateMemberSchema.parse(req.body);
    const member = await this.memberService.updateMember(param(req, 'id'), data, req.user!.id);
    this.sendSuccess(res, member);
  });

  public remove = this.catchAsync(async (req: Request, res: Response) => {
    const result = await this.memberService.removeMember(param(req, 'id'), req.user!.id);
    this.sendSuccess(res, result);
  });
}
