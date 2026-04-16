// server/src/modules/auth/two-factor.service.ts
import { prisma } from '../../database/prisma'
// @ts-ignore
import { authenticator } from 'otplib'
// @ts-ignore
import qrcode from 'qrcode'

export class TwoFactorService {
  async generateSecret(userId: string) {
    const secret = authenticator.generateSecret()
    
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret } as any,
    })

    const otpauth = authenticator.keyuri(
      userId,
      'EL SPACE',
      secret
    )

    const qrCode = await qrcode.toDataURL(otpauth)

    return { secret, qrCode }
  }

  async verifyToken(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true } as any,
    }) as any

    if (!user?.twoFactorSecret) return false

    return authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    })
  }

  async enable2FA(userId: string, token: string): Promise<boolean> {
    const isValid = await this.verifyToken(userId, token)
    
    if (isValid) {
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true } as any,
      })

      // Generate backup codes
      await this.generateBackupCodes(userId)
    }

    return isValid
  }

  private async generateBackupCodes(userId: string): Promise<string[]> {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    )

    await prisma.user.update({
      where: { id: userId },
      data: { backupCodes: codes } as any,
    })

    return codes
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { backupCodes: true } as any,
    }) as any

    if (!user?.backupCodes) return false

    const isValid = user.backupCodes.includes(code)

    if (isValid) {
      // Remove used code
      await prisma.user.update({
        where: { id: userId },
        data: {
          backupCodes: user.backupCodes.filter((c: string) => c !== code),
        } as any,
      })
    }

    return isValid
  }
}
