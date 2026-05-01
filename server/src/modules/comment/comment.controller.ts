import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { CommentService } from './comment.service';
import { param } from '@core/utils/param';
import { createCommentSchema, updateCommentSchema } from './comment.schema';

export class CommentController extends BaseController {
  private commentService: CommentService;

  constructor() {
    super();
    this.commentService = new CommentService();
  }

  public list = this.catchAsync(async (req: Request, res: Response) => {
    const comments = await this.commentService.getDocumentComments(param(req, 'documentId'));
    this.sendSuccess(res, comments);
  });

  public create = this.catchAsync(async (req: Request, res: Response) => {
    const data = createCommentSchema.parse(req.body);
    const comment = await this.commentService.createComment(
      param(req, 'documentId'),
      data,
      req.user!.id,
    );
    this.sendSuccess(res, comment, 201);
  });

  public update = this.catchAsync(async (req: Request, res: Response) => {
    const data = updateCommentSchema.parse(req.body);
    const comment = await this.commentService.updateComment(param(req, 'id'), data, req.user!.id);
    this.sendSuccess(res, comment);
  });

  public resolve = this.catchAsync(async (req: Request, res: Response) => {
    const comment = await this.commentService.resolveComment(param(req, 'id'), req.user!.id);
    this.sendSuccess(res, comment);
  });

  public remove = this.catchAsync(async (req: Request, res: Response) => {
    const result = await this.commentService.deleteComment(param(req, 'id'), req.user!.id);
    this.sendSuccess(res, result);
  });
}
