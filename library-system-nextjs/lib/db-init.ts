import { prisma } from './prisma'
import { hashPassword } from './auth'
import { UserRole } from '@prisma/client'

export async function initializeDatabase() {
  // 初期管理者ユーザーを作成（存在しない場合）
  const admin = await prisma.user.findUnique({
    where: { username: 'admin' },
  })

  if (!admin) {
    const passwordHash = await hashPassword('admin123')
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@library.com',
        passwordHash,
        role: UserRole.admin,
      },
    })
    console.log('初期管理者ユーザーを作成しました: admin / admin123')
  }
}
