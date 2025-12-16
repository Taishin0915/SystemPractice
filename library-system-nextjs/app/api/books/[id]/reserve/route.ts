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

    if (book.availableCopies <= 0) {
      return NextResponse.json(
        { error: 'この書籍は現在利用できません。' },
        { status: 400 }
      )
    }

    // ペナルティチェック
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user?.penaltyUntil && new Date(user.penaltyUntil) > new Date()) {
      return NextResponse.json({ error: '延滞によるペナルティ期間中のため予約できません。' }, { status: 403 })
    }

    // 既に予約していないかチェック
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        userId,
        bookId,
        status: ReservationStatus.pending,
      },
    })

    if (existingReservation) {
      return NextResponse.json(
        { error: '既にこの書籍を予約しています。' },
        { status: 400 }
      )
    }

    // 予約作成
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7) // 7日後

    await prisma.reservation.create({
      data: {
        userId,
        bookId,
        status: ReservationStatus.pending,
        expiryDate,
      },
    })

    return NextResponse.json({ message: '予約が完了しました。' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '予約中にエラーが発生しました。' },
      { status: 500 }
    )
  }
}
