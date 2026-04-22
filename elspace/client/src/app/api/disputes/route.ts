import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { prisma } from '@/lib/database/prisma'
import { z } from 'zod'

const createDisputeSchema = z.object({
  projectId: z.string(),
  type: z.enum(['PAYMENT', 'QUALITY', 'DEADLINE', 'COMMUNICATION', 'SCOPE_CREEP', 'OTHER']),
  reason: z.string().min(5),
  description: z.string().min(20),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const disputes = await prisma.dispute.findMany({
      where: {
        OR: [
          { initiatorId: session.user.id },
          { respondentId: session.user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    const activeDisputes = disputes.filter(d => d.status !== 'RESOLVED' && d.status !== 'CLOSED')
    const resolvedDisputes = disputes.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED')

    return NextResponse.json({ activeDisputes, resolvedDisputes })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const validated = createDisputeSchema.parse(body)

    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const dispute = await prisma.dispute.create({
      data: {
        initiatorId: session.user.id,
        projectId: validated.projectId,
        type: validated.type,
        reason: validated.reason,
        description: validated.description,
        status: 'OPEN',
      },
    })

    return NextResponse.json(dispute, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create dispute' }, { status: 500 })
  }
}
