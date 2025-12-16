import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/next-auth-options'
import { UserRole } from '@prisma/client'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('認証が必要です')
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== UserRole.admin) {
    throw new Error('管理者権限が必要です')
  }
  return session
}
