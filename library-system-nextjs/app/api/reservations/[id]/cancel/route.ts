import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { ReservationStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const userId = parseInt(session.user.id)
    const reservationId = parseInt(params.id)

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: '予約が見つかりません。' },
        { status: 404 }
      )
    }

    // 権限チェック（本人または管理者のみ）
    if (session.user.role !== 'admin' && reservation.userId !== userId) {
      return NextResponse.json(
        { error: '権限がありません。' },
        { status: 403 }
      )
    }

    if (reservation.status === ReservationStatus.cancelled) {
      return NextResponse.json(
        { error: 'この予約は既にキャンセルされています。' },
        { status: 400 }
      )
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.cancelled },
    })

    return NextResponse.json({ message: '予約をキャンセルしました。' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'キャンセル中にエラーが発生しました。' },
      { status: 500 }
    )
  }
}
