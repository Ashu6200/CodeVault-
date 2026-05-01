import { BaseRepository } from '@core/base.repository';
import { prisma } from '@infra/db';
import { BillingTransaction } from '@prisma/client';
import { PaginationParams, PaginatedResult } from '@core/types/common';

export class BillingRepository extends BaseRepository<BillingTransaction> {
  constructor() {
    super(prisma.billingTransaction);
  }

  async findByWorkspace(
    workspaceId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<BillingTransaction>> {
    return this.findPaginated(pagination, { workspaceId });
  }

  async getSubscriptionStatus(workspaceId: string) {
    return prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionPeriodEnd: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        seatLimit: true,
      },
    });
  }
}
