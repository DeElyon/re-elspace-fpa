// client/src/lib/email/sendEmail.ts
import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { WelcomeEmail } from '@/emails/WelcomeEmail'
import { ProjectMatchEmail } from '@/emails/ProjectMatchEmail'
import { PaymentReceivedEmail } from '@/emails/PaymentReceivedEmail'
import { SessionReminderEmail } from '@/emails/SessionReminderEmail'
import { prisma } from '@/lib/database/prisma'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  try {
    await transporter.sendMail({
      from: '"EL SPACE" <hello@elspace.tech>',
      to,
      subject,
      html,
      text,
    })
    return { success: true }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false, error }
  }
}

export async function sendVerificationEmail(email: string, userId: string) {
  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: generateToken(),
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken.token}`

  const html = `
    <h1>Verify Your Email</h1>
    <p>Click the link below to verify your email address:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
    <p>This link expires in 24 hours.</p>
  `

  return sendEmail({
    to: email,
    subject: 'Verify your EL SPACE account',
    html,
  })
}

export async function sendWelcomeEmail(email: string, name: string, role: string) {
  const html = render(WelcomeEmail({ name, role }))
  return sendEmail({
    to: email,
    subject: 'Welcome to EL SPACE!',
    html,
  })
}

export async function sendProjectMatchEmail(
  email: string,
  clientName: string,
  projectTitle: string,
  matches: any[]
) {
  const html = render(ProjectMatchEmail({ clientName, projectTitle, matches }))
  return sendEmail({
    to: email,
    subject: \`🎯 Matches Ready for "\${projectTitle}"\`,
    html,
  })
}

export async function sendPaymentReceivedEmail(
  email: string,
  freelancerName: string,
  amount: number,
  projectTitle: string
) {
  const html = render(PaymentReceivedEmail({ freelancerName, amount, projectTitle }))
  return sendEmail({
    to: email,
    subject: \`💰 Payment Received - $\${amount}\`,
    html,
  })
}

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}
