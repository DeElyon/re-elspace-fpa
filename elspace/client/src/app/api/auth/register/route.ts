// client/src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/database/prisma'
import { generatePublicUserId } from '@/lib/utils/generateId'
import { sendVerificationEmail } from '@/lib/email/sendEmail'
import { z } from 'zod'

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['CLIENT', 'FREELANCER']),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(validated.password, 12)
    const uniqueUserId = generatePublicUserId(validated.role)

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        firstName: validated.firstName,
        lastName: validated.lastName,
        role: validated.role,
        uniqueUserId,
        profile: {
          create: {
            title: validated.role === 'FREELANCER' ? 'Freelancer' : 'Client',
          },
        },
        wallet: {
          create: {
            availableBalance: 0,
            pendingBalance: 0,
            escrowBalance: 0,
            currency: 'USD',
          },
        },
      },
    })

    if (validated.role === 'FREELANCER') {
      await prisma.freelancerProfile.create({
        data: { userId: user.id },
      })
    } else {
      await prisma.clientProfile.create({
        data: { userId: user.id },
      })
    }

    await sendVerificationEmail(user.email, user.id)

    return NextResponse.json(
      { message: 'Registration successful', userId: user.uniqueUserId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
