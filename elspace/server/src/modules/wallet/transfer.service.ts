import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { generateTransactionId } from '@/utils/generateId';

interface TransferData {
  fromUserId: string;
  toUserId: string;
  amount: number;
  description?: string;
  reference?: string;
}

interface EscrowFundData {
  initiatorId: string;
  recipientId: string;
  amount: number;
  reference: string;
  description?: string;
}

interface EscrowReleaseData {
  escrowId: string;
  releaseAmount: number;
}

@Injectable()
export class TransferService {
  constructor(private prisma: PrismaService) {}

  /**
   * Internal wallet transfer between two users
   * Atomically transfers funds from one wallet to another
   */
  async internalTransfer(data: TransferData) {
    const { fromUserId, toUserId, amount, description, reference } = data;

    // Validate users exist
    const [fromUser, toUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: fromUserId } }),
      this.prisma.user.findUnique({ where: { id: toUserId } }),
    ]);

    if (!fromUser || !toUser) {
      throw new Error('One or both users not found');
    }

    if (fromUserId === toUserId) {
      throw new Error('Cannot transfer to the same user');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Perform atomic transaction
    return await this.prisma.$transaction(async (tx) => {
      // Get current wallet and check balance
      const fromWallet = await tx.wallet.findUnique({
        where: { userId: fromUserId },
      });

      if (!fromWallet) {
        throw new Error('Sender wallet not found');
      }

      if (fromWallet.availableBalance < amount) {
        throw new Error('Insufficient balance for transfer');
      }

      // Get receiver wallet
      const toWallet = await tx.wallet.findUnique({
        where: { userId: toUserId },
      });

      if (!toWallet) {
        throw new Error('Recipient wallet not found');
      }

      // Debit sender
      await tx.wallet.update({
        where: { userId: fromUserId },
        data: {
          availableBalance: {
            decrement: amount,
          },
        },
      });

      // Credit receiver
      await tx.wallet.update({
        where: { userId: toUserId },
        data: {
          availableBalance: {
            increment: amount,
          },
        },
      });

      // Create transaction records
      const transactionId = generateTransactionId();

      // Sender debit transaction
      await tx.transaction.create({
        data: {
          transactionId: generateTransactionId(),
          walletId: fromWallet.id,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
          amount,
          fee: 0,
          currency: fromWallet.currency,
          fromUserId,
          toUserId,
          fromWalletId: fromWallet.id,
          toWalletId: toWallet.id,
          reference: reference || `Transfer to ${toUser.email}`,
          description: description || `Internal transfer to ${toUser.email}`,
          completedAt: new Date(),
        },
      });

      // Receiver credit transaction
      const creditTransaction = await tx.transaction.create({
        data: {
          transactionId: generateTransactionId(),
          walletId: toWallet.id,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
          amount,
          fee: 0,
          currency: toWallet.currency,
          fromUserId,
          toUserId,
          fromWalletId: fromWallet.id,
          toWalletId: toWallet.id,
          reference: reference || `Transfer from ${fromUser.email}`,
          description: description || `Internal transfer from ${fromUser.email}`,
          completedAt: new Date(),
        },
      });

      return creditTransaction;
    });
  }

  /**
   * Fund escrow for a project or contract
   * Holds funds in escrow until milestone completion
   */
  async fundEscrow(data: EscrowFundData) {
    const { initiatorId, recipientId, amount, reference, description } = data;

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Get initiator wallet
      const initiatorWallet = await tx.wallet.findUnique({
        where: { userId: initiatorId },
      });

      if (!initiatorWallet) {
        throw new Error('Initiator wallet not found');
      }

      if (initiatorWallet.availableBalance < amount) {
        throw new Error('Insufficient available balance for escrow');
      }

      // Move funds from available to escrow
      await tx.wallet.update({
        where: { userId: initiatorId },
        data: {
          availableBalance: { decrement: amount },
          escrowBalance: { increment: amount },
        },
      });

      // Create escrow transaction
      const transaction = await tx.transaction.create({
        data: {
          transactionId: generateTransactionId(),
          walletId: initiatorWallet.id,
          type: TransactionType.ESCROW_FUND,
          status: TransactionStatus.COMPLETED,
          amount,
          fee: 0,
          currency: initiatorWallet.currency,
          fromUserId: initiatorId,
          toUserId: recipientId,
          reference,
          description: description || `Escrow hold for ${reference}`,
          completedAt: new Date(),
        },
      });

      // Create notification
      await this.createNotification({
        userId: recipientId,
        type: 'ESCROW_HELD',
        title: 'Escrow Payment Held',
        body: `$${amount} has been held in escrow for ${reference}`,
        data: {
          transactionId: transaction.id,
          reference,
          amount,
        },
      });

      return transaction;
    });
  }

  /**
   * Release escrow funds to recipient
   * Called when milestone is completed/approved
   */
  async releaseEscrow(data: EscrowReleaseData) {
    const { escrowId, releaseAmount } = data;

    if (releaseAmount <= 0) {
      throw new Error('Release amount must be greater than 0');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Get the original escrow transaction
      const escrowTransaction = await tx.transaction.findUnique({
        where: { id: escrowId },
      });

      if (!escrowTransaction || escrowTransaction.type !== TransactionType.ESCROW_FUND) {
        throw new Error('Escrow transaction not found');
      }

      if (escrowTransaction.status !== TransactionStatus.COMPLETED) {
        throw new Error('Escrow has already been processed');
      }

      // Get wallets
      const [initiatorWallet, recipientWallet] = await Promise.all([
        tx.wallet.findUnique({ where: { userId: escrowTransaction.fromUserId! } }),
        tx.wallet.findUnique({ where: { userId: escrowTransaction.toUserId! } }),
      ]);

      if (!initiatorWallet || !recipientWallet) {
        throw new Error('Wallet not found');
      }

      if (initiatorWallet.escrowBalance < releaseAmount) {
        throw new Error('Insufficient escrow balance');
      }

      // Move escrow to recipient's available balance
      await tx.wallet.update({
        where: { userId: escrowTransaction.fromUserId! },
        data: {
          escrowBalance: { decrement: releaseAmount },
        },
      });

      await tx.wallet.update({
        where: { userId: escrowTransaction.toUserId! },
        data: {
          availableBalance: { increment: releaseAmount },
        },
      });

      // Create release transaction
      const releaseTransaction = await tx.transaction.create({
        data: {
          transactionId: generateTransactionId(),
          walletId: recipientWallet.id,
          type: TransactionType.ESCROW_RELEASE,
          status: TransactionStatus.COMPLETED,
          amount: releaseAmount,
          fee: 0,
          currency: recipientWallet.currency,
          fromUserId: escrowTransaction.fromUserId!,
          toUserId: escrowTransaction.toUserId!,
          reference: escrowTransaction.reference,
          description: `Escrow released: ${escrowTransaction.description}`,
          completedAt: new Date(),
        },
      });

      return releaseTransaction;
    });
  }

  /**
   * Refund escrow funds back to initiator
   * Called when dispute is resolved in favor of initiator or project is cancelled
   */
  async refundEscrow(data: EscrowReleaseData) {
    const { escrowId, releaseAmount } = data;

    return await this.prisma.$transaction(async (tx) => {
      const escrowTransaction = await tx.transaction.findUnique({
        where: { id: escrowId },
      });

      if (!escrowTransaction || escrowTransaction.type !== TransactionType.ESCROW_FUND) {
        throw new Error('Escrow transaction not found');
      }

      const initiatorWallet = await tx.wallet.findUnique({
        where: { userId: escrowTransaction.fromUserId! },
      });

      if (!initiatorWallet) {
        throw new Error('Wallet not found');
      }

      // Return escrow to available balance
      await tx.wallet.update({
        where: { userId: escrowTransaction.fromUserId! },
        data: {
          escrowBalance: { decrement: releaseAmount },
          availableBalance: { increment: releaseAmount },
        },
      });

      // Create refund transaction
      const refundTransaction = await tx.transaction.create({
        data: {
          transactionId: generateTransactionId(),
          walletId: initiatorWallet.id,
          type: TransactionType.ESCROW_REFUND,
          status: TransactionStatus.COMPLETED,
          amount: releaseAmount,
          fee: 0,
          currency: initiatorWallet.currency,
          fromUserId: escrowTransaction.toUserId!,
          toUserId: escrowTransaction.fromUserId!,
          reference: escrowTransaction.reference,
          description: `Escrow refunded: ${escrowTransaction.description}`,
          completedAt: new Date(),
        },
      });

      return refundTransaction;
    });
  }

  /**
   * Helper: Create notification for wallet events
   */
  private async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }) {
    // Implement notification creation
    // This would typically call the notification service
    console.log('Notification created:', data);
  }

  /**
   * Get wallet with current balances
   */
  async getWalletWithBalances(userId: string) {
    return await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}
