import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { Document, DocumentVisibility, Prisma } from '@prisma/client';
import { PaginationParams, PaginatedResult } from '@core/types/common';

// ─────────────────────────────────────────────
// Document Repository
// ─────────────────────────────────────────────

export class DocumentRepository extends BaseRepository<Document> {
  constructor() {
    super(prisma.document);
  }

  /**
   * Find document with author and version count
   */
  async findByIdWithDetails(id: string): Promise<any | null> {
    return prisma.document.findFirst({
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
  }

  /**
   * Get document tree (root documents with nested children) for a workspace
   */
  async getDocumentTree(workspaceId: string, userId?: string): Promise<Document[]> {
    return prisma.document.findMany({
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
  }

  /**
   * Paginated document listing with filters
   */
  async findDocuments(
    workspaceId: string,
    pagination: PaginationParams,
    filters: {
      visibility?: DocumentVisibility;
      search?: string;
      tag?: string;
    } = {},
  ): Promise<PaginatedResult<Document>> {
    const where: Prisma.DocumentWhereInput = {
      workspaceId,
      deletedAt: null,
    };

    if (filters.visibility) {
      where.visibility = filters.visibility;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tag) {
      where.tags = { has: filters.tag };
    }

    return this.findPaginated(pagination, where, {
      author: {
        select: { id: true, name: true, image: true },
      },
    });
  }

  /**
   * Create a document version
   */
  async createVersion(data: {
    documentId: string;
    title: string;
    content: string;
    createdBy: string;
    versionNumber: number;
    changeSummary?: string;
  }) {
    return prisma.documentVersion.create({ data });
  }

  /**
   * Get the latest version number for a document
   */
  async getLatestVersionNumber(documentId: string): Promise<number> {
    const version = await prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });
    return version ? version.versionNumber : 0;
  }

  /**
   * Get version history for a document
   */
  async getVersions(documentId: string) {
    return prisma.documentVersion.findMany({
      where: { documentId },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { versionNumber: 'desc' },
    });
  }

  /**
   * Grant document access to a user (ABAC)
   */
  async createGrant(data: {
    documentId: string;
    userId: string;
    permissions: string[];
    expiresAt?: Date | null;
  }) {
    return prisma.documentGrant.upsert({
      where: {
        documentId_userId: {
          documentId: data.documentId,
          userId: data.userId,
        },
      },
      create: data,
      update: {
        permissions: data.permissions,
        expiresAt: data.expiresAt,
      },
    });
  }

  /**
   * Remove document grant
   */
  async removeGrant(documentId: string, userId: string) {
    return prisma.documentGrant.delete({
      where: {
        documentId_userId: { documentId, userId },
      },
    });
  }

  /**
   * Get all grants for a document
   */
  async getGrants(documentId: string) {
    return prisma.documentGrant.findMany({
      where: { documentId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
  }
}
