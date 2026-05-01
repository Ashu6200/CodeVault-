import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { Comment } from '@prisma/client';

export class CommentRepository extends BaseRepository<Comment> {
  constructor() {
    super(prisma.comment);
  }

  async findByDocument(documentId: string) {
    return prisma.comment.findMany({
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
  }
}
