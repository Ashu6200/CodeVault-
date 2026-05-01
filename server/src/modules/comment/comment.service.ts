import { BaseService } from '@core/base.service';
import { CommentRepository } from './comment.repository';
import { eventBus, EVENTS } from '@infra/events';
import { getIO } from '@infra/socket';
import { NotFoundError, ForbiddenError } from '@core/errors';
import { CreateCommentInput, UpdateCommentInput } from './comment.schema';
import { logger } from '@infra/logger';

const log = logger.child('CommentService');

export class CommentService extends BaseService {
  private commentRepo: CommentRepository;

  constructor() {
    super();
    this.commentRepo = new CommentRepository();
  }

  async getDocumentComments(documentId: string) {
    try {
      return await this.commentRepo.findByDocument(documentId);
    } catch (error) {
      this.handleError(error, 'Failed to fetch comments');
    }
  }

  async createComment(documentId: string, data: CreateCommentInput, authorId: string) {
    try {
      const comment = await this.commentRepo.create({
        ...data,
        documentId,
        authorId,
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
      const comment = await this.commentRepo.findById(id);
      if (!comment) throw new NotFoundError('Comment', id);
      if (comment.authorId !== userId)
        throw new ForbiddenError('You can only edit your own comments');

      return await this.commentRepo.update(id, data);
    } catch (error) {
      this.handleError(error, 'Failed to update comment');
    }
  }

  async resolveComment(id: string, userId: string) {
    try {
      const comment = await this.commentRepo.findById(id);
      if (!comment) throw new NotFoundError('Comment', id);

      const updated = await this.commentRepo.update(id, {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedById: userId,
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
      const comment = await this.commentRepo.findById(id);
      if (!comment) throw new NotFoundError('Comment', id);

      return await this.commentRepo.softDelete(id);
    } catch (error) {
      this.handleError(error, 'Failed to delete comment');
    }
  }
}
