import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'ユーザー一覧の取得に失敗しました。' },
      { status: 500 }
    )
  }
}
