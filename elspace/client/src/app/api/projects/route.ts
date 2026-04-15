// client/src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { prisma } from '@/lib/database/prisma'
import { z } from 'zod'

const createProjectSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(50),
  categoryId: z.string().optional(),
  skills: z.array(z.string()),
  budgetType: z.enum(['HOURLY', 'FIXED', 'RANGE']),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  fixedPrice: z.number().optional(),
  duration: z.enum([
    'LESS_THAN_WEEK',
    'ONE_TO_TWO_WEEKS',
    'TWO_TO_FOUR_WEEKS',
    'ONE_TO_THREE_MONTHS',
    'THREE_TO_SIX_MONTHS',
    'SIX_PLUS_MONTHS',
  ]),
  attachments: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const budgetType = searchParams.get('budgetType')
    const status = searchParams.get('status') || 'OPEN'

    const where: any = { status }

    if (category) where.categoryId = category
    if (budgetType) where.budgetType = budgetType
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              clientProfile: {
                select: {
                  companyName: true,
                  verifiedClient: true,
                },
              },
            },
          },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validated = createProjectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        clientId: session.user.id,
        title: validated.title,
        description: validated.description,
        categoryId: validated.categoryId,
        skills: validated.skills,
        budgetType: validated.budgetType,
        budgetMin: validated.budgetMin,
        budgetMax: validated.budgetMax,
        fixedPrice: validated.fixedPrice,
        duration: validated.duration,
        attachments: validated.attachments || [],
        status: 'OPEN',
        publishedAt: new Date(),
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
