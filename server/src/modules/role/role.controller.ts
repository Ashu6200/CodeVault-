import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { RoleService } from './role.service';
import { param } from '@core/utils/param';
import { createRoleSchema, updateRoleSchema } from './role.schema';

export class RoleController extends BaseController {
  private roleService: RoleService;

  constructor() {
    super();
    this.roleService = new RoleService();
  }

  public list = this.catchAsync(async (req: Request, res: Response) => {
    const roles = await this.roleService.listRoles(param(req, 'workspaceId'));
    this.sendSuccess(res, roles);
  });

  public create = this.catchAsync(async (req: Request, res: Response) => {
    const data = createRoleSchema.parse(req.body);
    const role = await this.roleService.createRole(param(req, 'workspaceId'), data, req.user!.id);
    this.sendSuccess(res, role, 201);
  });

  public update = this.catchAsync(async (req: Request, res: Response) => {
    const data = updateRoleSchema.parse(req.body);
    const role = await this.roleService.updateRole(param(req, 'id'), data, req.user!.id);
    this.sendSuccess(res, role);
  });

  public remove = this.catchAsync(async (req: Request, res: Response) => {
    const result = await this.roleService.deleteRole(param(req, 'id'), req.user!.id);
    this.sendSuccess(res, result);
  });
}
