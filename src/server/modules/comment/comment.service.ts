import { BaseService } from '@core/base.service';
import { Prisma } from '@prisma/client';
import { prisma } from '@infra/db';
import { NotFoundError, ForbiddenError } from '@core/errors';
import { CreateCommentInput, UpdateCommentInput } from './comment.schema';


export class CommentService extends BaseService {
  constructor() {
    super();
  }

  async getDocumentComments(documentId: string) {
    try {
      return await prisma.comment.findMany({
        where: { documentId, parentId: null, deletedAt: null },
        include: {
          author: { select: { id: true, name: true, image: true } },
          resolvedBy: { select: { id: true, name: true } },
          replies: {
            where: { deletedAt: null },
            include: {
              author: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'Failed to fetch comments');
    }
  }

  async createComment(documentId: string, data: CreateCommentInput, authorId: string) {
    try {
      const comment = await prisma.comment.create({
        data: {
          content: data.content,
          parentId: data.parentId ?? null,
          // A nullable Json column takes Prisma.DbNull, not a JS null.
          selectionRange: data.selectionRange ?? Prisma.DbNull,
          documentId,
          authorId,
        },
      });

      return comment;
    } catch (error) {
      this.handleError(error, 'Failed to create comment');
    }
  }

  async updateComment(id: string, data: UpdateCommentInput, userId: string) {
    try {
      const comment = await prisma.comment.findUnique({ where: { id } });
      if (!comment) throw new NotFoundError('Comment', id);
      if (comment.authorId !== userId)
        throw new ForbiddenError('You can only edit your own comments');

      return await prisma.comment.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error, 'Failed to update comment');
    }
  }

  async resolveComment(id: string, userId: string) {
    try {
      const comment = await prisma.comment.findUnique({ where: { id } });
      if (!comment) throw new NotFoundError('Comment', id);

      const updated = await prisma.comment.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          resolvedById: userId,
        },
      });

      return updated;
    } catch (error) {
      this.handleError(error, 'Failed to resolve comment');
    }
  }

  async deleteComment(id: string, userId: string) {
    try {
      const comment = await prisma.comment.findUnique({ where: { id } });
      if (!comment) throw new NotFoundError('Comment', id);

      return await prisma.comment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      this.handleError(error, 'Failed to delete comment');
    }
  }
}

