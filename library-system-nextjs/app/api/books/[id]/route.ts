import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { ReservationStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = parseInt(params.id)
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      return NextResponse.json(
        { error: '書籍が見つかりません。' },
        { status: 404 }
      )
    }

    // ユーザーが既に予約しているかチェック
    let hasReservation = false
    const session = await getSession()
    if (session) {
      const reservation = await prisma.reservation.findFirst({
        where: {
          userId: parseInt(session.user.id),
          bookId,
          status: ReservationStatus.pending,
        },
      })
      hasReservation = reservation !== null
    }

    return NextResponse.json({ book, hasReservation })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '書籍詳細の取得に失敗しました。' },
      { status: 500 }
    )
  }
}
