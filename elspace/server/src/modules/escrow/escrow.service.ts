// server/src/modules/escrow/escrow.service.ts
import { prisma } from '../../database/prisma'

export class EscrowService {
  async createEscrow(data: {
    projectId: string
    amount: number
    clientId: string
    freelancerId: string
    milestoneId: string
  }) {
    const escrow = await prisma.escrow.create({
      data: {
        escrowId: `ESC_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        projectId: data.projectId,
        amount: data.amount,
        clientId: data.clientId,
        freelancerId: data.freelancerId,
        milestoneId: data.milestoneId,
        status: 'FUNDED',
        fundedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    })

    // Hold funds in platform escrow account
    await this.holdFunds(data.amount, data.clientId)

    // Create smart contract record (optional blockchain integration)
    await this.createSmartContractRecord(escrow)

    return escrow
  }

  async releaseEscrow(escrowId: string, approverId: string) {
    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: { milestone: true },
    })

    if (!escrow) throw new Error('Escrow not found')

    if (escrow.clientId !== approverId) {
      throw new Error('Only client can release escrow')
    }

    await prisma.$transaction(async (tx) => {
      // Release funds to freelancer
      await tx.wallet.update({
        where: { userId: escrow.freelancerId },
        data: { availableBalance: { increment: escrow.amount } },
      })

      // Update escrow status
      await tx.escrow.update({
        where: { id: escrowId },
        data: { 
          status: 'RELEASED',
          releasedAt: new Date(),
          releasedBy: approverId,
        },
      })

      // Update milestone
      await tx.milestone.update({
        where: { id: escrow.milestoneId },
        data: { status: 'PAID' },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          type: 'ESCROW_RELEASE',
          amount: escrow.amount,
          fromUserId: escrow.clientId,
          toUserId: escrow.freelancerId,
          status: 'COMPLETED',
          reference: escrow.escrowId,
          walletId: (await tx.wallet.findUnique({ where: { userId: escrow.freelancerId } }))?.id || '',
        },
      })
    })

    // Send notifications
    await this.notifyParties(escrow)
  }

  async disputeEscrow(escrowId: string, reason: string) {
    const escrow = await prisma.escrow.update({
      where: { id: escrowId },
      data: { 
        status: 'DISPUTED',
        disputeReason: reason,
        disputedAt: new Date(),
      },
    })

    // Create dispute record
    await prisma.dispute.create({
      data: {
        type: 'PAYMENT',
        reason,
        escrowId: escrow.id,
        initiatorId: escrow.freelancerId, // Or whoever initiated
        respondentId: escrow.clientId,
        status: 'OPEN',
        priority: 'HIGH',
        description: reason,
        desiredOutcome: 'Refund or Release',
      },
    })

    return escrow
  }

  private async holdFunds(amount: number, clientId: string) {
    // Logic to hold funds from client's wallet
    await prisma.wallet.update({
      where: { userId: clientId },
      data: { availableBalance: { decrement: amount } }
    })
  }

  private async createSmartContractRecord(escrow: any) {
    // Logic to record escrow on blockchain if enabled
  }

  private async notifyParties(escrow: any) {
    // Logic to notify parties
  }
}
