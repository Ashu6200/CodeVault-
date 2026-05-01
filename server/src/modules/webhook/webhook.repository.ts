import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { WebhookEndpoint, WebhookEvent } from '@prisma/client';

export class WebhookRepository extends BaseRepository<WebhookEndpoint> {
  constructor() {
    super(prisma.webhookEndpoint);
  }

  async findByWorkspace(workspaceId: string) {
    return prisma.webhookEndpoint.findMany({
      where: { workspaceId },
      include: { _count: { select: { deliveries: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveByEvent(workspaceId: string, event: WebhookEvent) {
    return prisma.webhookEndpoint.findMany({
      where: {
        workspaceId,
        isActive: true,
        events: { has: event },
      },
    });
  }

  async createDelivery(data: { event: WebhookEvent; payload: any; webhookEndpointId: string }) {
    return prisma.webhookDelivery.create({ data });
  }

  async getDeliveries(endpointId: string) {
    return prisma.webhookDelivery.findMany({
      where: { webhookEndpointId: endpointId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
