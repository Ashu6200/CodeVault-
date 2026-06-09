import { BaseService } from '@core/base.service';
import { prisma } from '@infra/db';
import { eventBus, EVENTS } from '@infra/events';
import { getIO } from '@infra/socket';
import { NotFoundError, ForbiddenError } from '@core/errors';
import { CreateCommentInput, UpdateCommentInput } from './comment.schema';
import { logger } from '@infra/logger';

const log = logger.child('CommentService');

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
          ...(data as any),
          documentId,
          authorId,
        },
      });

      // Real-time emit
      try {
        const io = getIO();
        io.to(`document:${documentId}`).emit('comment:new', comment);
      } catch {}

      eventBus.emit(EVENTS.COMMENT_CREATED, { commentId: comment.id, documentId, authorId });
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

      try {
        const io = getIO();
        io.to(`document:${comment.documentId}`).emit('comment:resolved', {
          id,
          resolvedById: userId,
        });
      } catch {}

      eventBus.emit(EVENTS.COMMENT_RESOLVED, { commentId: id, documentId: comment.documentId });
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

