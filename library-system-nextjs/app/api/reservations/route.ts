import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const isAdmin = session.user.role === 'admin'

    const reservations = await prisma.reservation.findMany({
      where: isAdmin ? {} : { userId: parseInt(session.user.id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        book: true,
      },
      orderBy: { reservationDate: 'desc' },
    })

    return NextResponse.json({ reservations })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '予約一覧の取得に失敗しました。' },
      { status: 500 }
    )
  }
}
