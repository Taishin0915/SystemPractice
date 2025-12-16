import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { ReservationStatus, LoanStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const reservationId = parseInt(params.id)

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { book: true },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: '予約が見つかりません。' },
        { status: 404 }
      )
    }

    if (reservation.status !== ReservationStatus.pending) {
      return NextResponse.json(
        { error: 'この予約は貸出できません。' },
        { status: 400 }
      )
    }

    if (reservation.book.availableCopies <= 0) {
      return NextResponse.json(
        { error: 'この書籍は現在利用できません。' },
        { status: 400 }
      )
    }

    // 貸出作成
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14) // 14日後

    await prisma.$transaction([
      prisma.loan.create({
        data: {
          userId: reservation.userId,
          bookId: reservation.bookId,
          dueDate,
          status: LoanStatus.active,
        },
      }),
      prisma.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.confirmed },
      }),
      prisma.book.update({
        where: { id: reservation.bookId },
        data: { availableCopies: { decrement: 1 } },
      }),
    ])

    return NextResponse.json({ message: '貸出手続きが完了しました。' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '貸出手続き中にエラーが発生しました。' },
      { status: 500 }
    )
  }
}
