import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { WorkspaceService } from './workspace.service';
import { param } from '@core/utils/param';
import { createWorkspaceSchema, updateWorkspaceSchema } from './workspace.schema';

// ─────────────────────────────────────────────
// Workspace Controller
// ─────────────────────────────────────────────

export class WorkspaceController extends BaseController {
  private workspaceService: WorkspaceService;

  constructor() {
    super();
    this.workspaceService = new WorkspaceService();
  }

  public create = this.catchAsync(async (req: Request, res: Response) => {
    const data = createWorkspaceSchema.parse(req.body);
    const workspace = await this.workspaceService.createWorkspace(data, req.user!.id);
    this.sendSuccess(res, workspace, 201);
  });

  public listMine = this.catchAsync(async (req: Request, res: Response) => {
    const workspaces = await this.workspaceService.getUserWorkspaces(req.user!.id);
    this.sendSuccess(res, workspaces);
  });

  public getById = this.catchAsync(async (req: Request, res: Response) => {
    const workspace = await this.workspaceService.getWorkspaceById(param(req, 'workspaceId'));
    this.sendSuccess(res, workspace);
  });

  public getBySlug = this.catchAsync(async (req: Request, res: Response) => {
    const workspace = await this.workspaceService.getWorkspaceBySlug(param(req, 'slug'));
    this.sendSuccess(res, workspace);
  });

  public update = this.catchAsync(async (req: Request, res: Response) => {
    const data = updateWorkspaceSchema.parse(req.body);
    const workspace = await this.workspaceService.updateWorkspace(
      param(req, 'workspaceId'),
      data,
      req.user!.id,
    );
    this.sendSuccess(res, workspace);
  });

  public remove = this.catchAsync(async (req: Request, res: Response) => {
    const result = await this.workspaceService.deleteWorkspace(
      param(req, 'workspaceId'),
      req.user!.id,
    );
    this.sendSuccess(res, result);
  });
}
