// client/src/app/api/conversations/[conversationId]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { prisma } from '@/lib/database/prisma'
import { z } from 'zod'

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
  attachments: z.array(z.string()).optional(),
  replyToId: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: params.conversationId,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.conversationId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    })

    return NextResponse.json(messages.reverse())
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validated = messageSchema.parse(body)

    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: params.conversationId,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    const message = await prisma.message.create({
      data: {
        conversationId: params.conversationId,
        senderId: session.user.id,
        content: validated.content,
        type: validated.type,
        attachments: validated.attachments || [],
        replyToId: validated.replyToId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    await prisma.conversation.update({
      where: { id: params.conversationId },
      data: { lastMessageAt: new Date() },
    })

    const socketId = req.headers.get('x-socket-id')
    if (socketId) {
      // Emit socket event for real-time message
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
