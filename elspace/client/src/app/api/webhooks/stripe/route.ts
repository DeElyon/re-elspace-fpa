// client/src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/database/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge)
        break

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { userId, type, referenceId } = paymentIntent.metadata as any

  if (type === 'DEPOSIT') {
    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId },
        data: {
          availableBalance: { increment: paymentIntent.amount / 100 },
          totalSpent: { increment: paymentIntent.amount / 100 },
        },
      })

      await tx.transaction.create({
        data: {
          wallet: { connect: { userId } },
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount: paymentIntent.amount / 100,
          reference: paymentIntent.id,
          completedAt: new Date(),
        },
      })
    })
  }

  if (type === 'ESCROW_FUND') {
    const milestone = await prisma.milestone.findUnique({
      where: { id: referenceId },
      include: { project: true },
    })

    if (milestone) {
      await prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { userId: milestone.project.clientId },
          data: { escrowBalance: { increment: milestone.amount } },
        })

        await tx.milestone.update({
          where: { id: milestone.id },
          data: { status: 'FUNDED' },
        })

        await tx.transaction.create({
          data: {
            wallet: { connect: { userId: milestone.project.clientId } },
            type: 'ESCROW_FUND',
            status: 'COMPLETED',
            amount: milestone.amount,
            reference: paymentIntent.id,
            completedAt: new Date(),
          },
        })
      })
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)
}

async function handleRefund(charge: Stripe.Charge) {
  const transaction = await prisma.transaction.findFirst({
    where: { reference: charge.payment_intent as string },
  })

  if (transaction) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'REFUNDED' },
    })
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  console.log('Account updated:', account.id)
}
