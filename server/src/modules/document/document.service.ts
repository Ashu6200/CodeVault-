import { BaseService } from '@core/base.service';
import { prisma } from '@infra/db';
import { redis } from '@infra/redis';
import { eventBus, EVENTS } from '@infra/events';
import { getDocumentNs } from '@infra/socket';
import { NotFoundError, ForbiddenError } from '@core/errors';
import { logger } from '@infra/logger';
import { CreateDocumentInput, UpdateDocumentInput, ListDocumentsQuery } from './document.schema';

// ─────────────────────────────────────────────
// Document Service
// ─────────────────────────────────────────────

const log = logger.child('DocumentService');
const CACHE_TTL = 3600; // 1 hour

export class DocumentService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Get document by ID (with Redis cache)
   */
  async getDocumentById(id: string) {
    try {
      // Check cache
      const cacheKey = `doc:${id}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const document = await prisma.document.findFirst({
        where: { id, deletedAt: null },
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
          _count: {
            select: { versions: true, comments: true, children: true },
          },
        },
      });

      if (!document) {
        throw new NotFoundError('Document', id);
      }

      // Cache for 1 hour
      await redis.set(cacheKey, JSON.stringify(document), 'EX', CACHE_TTL);
      return document;
    } catch (error) {
      this.handleError(error, 'Failed to fetch document');
    }
  }

  /**
   * Create a new document with initial version
   */
  async createDocument(data: CreateDocumentInput, authorId: string) {
    try {
      // Calculate reading time
      const words = data.content ? data.content.split(/\s+/).length : 0;
      const readingTime = Math.max(1, Math.ceil(words / 200));

      const document = await prisma.document.create({
        data: {
          ...data,
          authorId,
          readingTime,
        },
      });

      // Create initial version
      await prisma.documentVersion.create({
        data: {
          documentId: document.id,
          title: document.title,
          content: document.content || '',
          createdBy: authorId,
          versionNumber: 1,
          changeSummary: 'Initial creation',
        },
      });

      // Emit domain event
      eventBus.emit(
        EVENTS.DOCUMENT_CREATED,
        {
          documentId: document.id,
          title: document.title,
          authorId,
          workspaceId: data.workspaceId,
          visibility: document.visibility,
        },
        authorId,
        data.workspaceId,
      );

      log.info(`Document created: ${document.id} in workspace ${data.workspaceId}`);
      return document;
    } catch (error) {
      this.handleError(error, 'Failed to create document');
    }
  }

  /**
   * Update document with optional versioning
   */
  async updateDocument(id: string, data: UpdateDocumentInput, userId: string) {
    try {
      const { changeSummary, ...updateData } = data;

      // Recalculate reading time if content changed
      if (updateData.content) {
        const words = updateData.content.split(/\s+/).length;
        (updateData as any).readingTime = Math.max(1, Math.ceil(words / 200));
      }

      const document = await prisma.document.update({
        where: { id },
        data: updateData,
      });

      // Create new version if content or title changed
      if (updateData.content || updateData.title) {
        const version = await prisma.documentVersion.findFirst({
          where: { documentId: id },
          orderBy: { versionNumber: 'desc' },
          select: { versionNumber: true },
        });
        const latestVersion = version ? version.versionNumber : 0;

        await prisma.documentVersion.create({
          data: {
            documentId: id,
            title: document.title,
            content: document.content || '',
            createdBy: userId,
            versionNumber: latestVersion + 1,
            changeSummary,
          },
        });
      }

      // Invalidate cache
      await redis.del(`doc:${id}`);

      // Emit real-time update via /document namespace
      try {
        const docNs = getDocumentNs();
        docNs.to(`document:${id}`).emit('document:update', {
          id: document.id,
          title: document.title,
          updatedBy: userId,
          updatedAt: document.updatedAt,
        });
      } catch (error) {
        log.warn(`Failed to emit document:update event for ${id}:`, error);
      }

      // Emit domain event
      eventBus.emit(
        EVENTS.DOCUMENT_UPDATED,
        {
          documentId: id,
          title: document.title,
          updatedBy: userId,
          workspaceId: document.workspaceId,
          changes: Object.keys(updateData),
        },
        userId,
        document.workspaceId,
      );

      log.info(`Document updated: ${id}`);
      return document;
    } catch (error) {
      this.handleError(error, 'Failed to update document');
    }
  }

  /**
   * Soft-delete a document
   */
  async deleteDocument(id: string, userId: string) {
    try {
      const document = await prisma.document.findFirst({
        where: { id, deletedAt: null },
      });
      if (!document) {
        throw new NotFoundError('Document', id);
      }

      const result = await prisma.document.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // Invalidate cache
      await redis.del(`doc:${id}`);

      // Emit real-time event via /document namespace
      try {
        const docNs = getDocumentNs();
        docNs.to(`document:${id}`).emit('document:deleted', { id });
      } catch (error) {
        log.warn(`Failed to emit document:deleted event for ${id}:`, error);
      }

      // Emit domain event
      eventBus.emit(
        EVENTS.DOCUMENT_DELETED,
        {
          documentId: id,
          title: document.title,
          deletedBy: userId,
          workspaceId: document.workspaceId,
        },
        userId,
        document.workspaceId,
      );

      log.info(`Document soft-deleted: ${id}`);
      return result;
    } catch (error) {
      this.handleError(error, 'Failed to delete document');
    }
  }

  /**
   * Get hierarchical document tree for a workspace
   */
  async getDocumentTree(workspaceId: string) {
    try {
      return await prisma.document.findMany({
        where: {
          workspaceId,
          parentId: null,
          deletedAt: null,
        },
        include: {
          children: {
            where: { deletedAt: null },
            include: {
              children: {
                where: { deletedAt: null },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      });
    } catch (error) {
      this.handleError(error, 'Failed to fetch document tree');
    }
  }

  /**
   * List documents with pagination and filters
   */
  async listDocuments(workspaceId: string, query: ListDocumentsQuery) {
    try {
      const where: any = {
        workspaceId,
        deletedAt: null,
      };

      if (query.visibility) {
        where.visibility = query.visibility as any;
      }

      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { content: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      if (query.tag) {
        where.tags = { has: query.tag };
      }

      return await this.paginate(
        prisma.document,
        {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
        },
        {
          where,
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      );
    } catch (error) {
      this.handleError(error, 'Failed to list documents');
    }
  }

  /**
   * Get version history for a document
   */
  async getVersionHistory(documentId: string) {
    try {
      const document = await prisma.document.findFirst({
        where: { id: documentId, deletedAt: null },
      });
      if (!document) {
        throw new NotFoundError('Document', documentId);
      }
      return await prisma.documentVersion.findMany({
        where: { documentId },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { versionNumber: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'Failed to fetch version history');
    }
  }

  /**
   * Grant document access to a user (ABAC)
   */
  async grantAccess(
    documentId: string,
    userId: string,
    permissions: string[],
    expiresAt?: Date | null,
  ) {
    try {
      const document = await prisma.document.findFirst({
        where: { id: documentId, deletedAt: null },
      });
      if (!document) {
        throw new NotFoundError('Document', documentId);
      }

      return await prisma.documentGrant.upsert({
        where: {
          documentId_userId: {
            documentId,
            userId,
          },
        },
        create: {
          documentId,
          userId,
          permissions,
          expiresAt,
        },
        update: {
          permissions,
          expiresAt,
        },
      });
    } catch (error) {
      this.handleError(error, 'Failed to grant document access');
    }
  }

  /**
   * Revoke document access from a user
   */
  async revokeAccess(documentId: string, userId: string) {
    try {
      return await prisma.documentGrant.delete({
        where: {
          documentId_userId: { documentId, userId },
        },
      });
    } catch (error) {
      this.handleError(error, 'Failed to revoke document access');
    }
  }

  /**
   * Get all grants for a document
   */
  async getDocumentGrants(documentId: string) {
    try {
      return await prisma.documentGrant.findMany({
        where: { documentId },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'Failed to fetch document grants');
    }
  }
}

