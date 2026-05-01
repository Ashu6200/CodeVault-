import { Request, Response } from 'express';
import { BaseController } from '@core/base.controller';
import { DocumentService } from './document.service';
import { param } from '@core/utils/param';
import {
  createDocumentSchema,
  updateDocumentSchema,
  listDocumentsQuerySchema,
  documentGrantSchema,
} from './document.schema';

// ─────────────────────────────────────────────
// Document Controller
// ─────────────────────────────────────────────

export class DocumentController extends BaseController {
  private documentService: DocumentService;

  constructor() {
    super();
    this.documentService = new DocumentService();
  }

  /**
   * POST /api/workspaces/:workspaceId/documents — Create document
   */
  public create = this.catchAsync(async (req: Request, res: Response) => {
    const data = createDocumentSchema.parse({
      ...req.body,
      workspaceId: param(req, 'workspaceId'),
    });
    const document = await this.documentService.createDocument(data, req.user!.id);
    this.sendSuccess(res, document, 201);
  });

  /**
   * GET /api/workspaces/:workspaceId/documents — List documents
   */
  public list = this.catchAsync(async (req: Request, res: Response) => {
    const query = listDocumentsQuerySchema.parse(req.query);
    const result = await this.documentService.listDocuments(param(req, 'workspaceId'), query);
    this.sendPaginated(res, result!);
  });

  /**
   * GET /api/workspaces/:workspaceId/documents/tree — Get document tree
   */
  public getTree = this.catchAsync(async (req: Request, res: Response) => {
    const tree = await this.documentService.getDocumentTree(param(req, 'workspaceId'));
    this.sendSuccess(res, tree);
  });

  /**
   * GET /api/workspaces/:workspaceId/documents/:id — Get document by ID
   */
  public getById = this.catchAsync(async (req: Request, res: Response) => {
    const document = await this.documentService.getDocumentById(param(req, 'id'));
    this.sendSuccess(res, document);
  });

  /**
   * PUT /api/workspaces/:workspaceId/documents/:id — Update document
   */
  public update = this.catchAsync(async (req: Request, res: Response) => {
    const data = updateDocumentSchema.parse(req.body);
    const document = await this.documentService.updateDocument(
      param(req, 'id'),
      data,
      req.user!.id,
    );
    this.sendSuccess(res, document);
  });

  /**
   * DELETE /api/workspaces/:workspaceId/documents/:id — Soft delete document
   */
  public remove = this.catchAsync(async (req: Request, res: Response) => {
    const result = await this.documentService.deleteDocument(param(req, 'id'), req.user!.id);
    this.sendSuccess(res, result);
  });

  /**
   * GET /api/workspaces/:workspaceId/documents/:id/versions — Get version history
   */
  public getVersions = this.catchAsync(async (req: Request, res: Response) => {
    const versions = await this.documentService.getVersionHistory(param(req, 'id'));
    this.sendSuccess(res, versions);
  });

  /**
   * POST /api/workspaces/:workspaceId/documents/:id/grants — Grant document access
   */
  public grantAccess = this.catchAsync(async (req: Request, res: Response) => {
    const data = documentGrantSchema.parse(req.body);
    const grant = await this.documentService.grantAccess(
      param(req, 'id'),
      data.userId,
      data.permissions,
      data.expiresAt,
    );
    this.sendSuccess(res, grant, 201);
  });

  /**
   * DELETE /api/workspaces/:workspaceId/documents/:id/grants/:userId — Revoke document access
   */
  public revokeAccess = this.catchAsync(async (req: Request, res: Response) => {
    const result = await this.documentService.revokeAccess(param(req, 'id'), param(req, 'userId'));
    this.sendSuccess(res, result);
  });

  /**
   * GET /api/workspaces/:workspaceId/documents/:id/grants — List document grants
   */
  public getGrants = this.catchAsync(async (req: Request, res: Response) => {
    const grants = await this.documentService.getDocumentGrants(param(req, 'id'));
    this.sendSuccess(res, grants);
  });
}
