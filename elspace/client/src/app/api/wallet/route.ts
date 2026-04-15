// client/src/app/api/wallet/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { prisma } from '@/lib/database/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        paymentMethods: true,
        bankAccounts: true,
      },
    })

    if (!wallet) {
      const newWallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          availableBalance: 0,
          pendingBalance: 0,
          escrowBalance: 0,
          currency: 'USD',
        },
        include: {
          transactions: true,
          paymentMethods: true,
          bankAccounts: true,
        },
      })
      return NextResponse.json(newWallet)
    }

    return NextResponse.json(wallet)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    )
  }
}
