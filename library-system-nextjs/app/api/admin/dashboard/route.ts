import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { ReservationStatus, LoanStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const [totalBooks, totalUsers, totalReservations, activeLoans, overdueLoans] =
      await Promise.all([
        prisma.book.count(),
        prisma.user.count(),
        prisma.reservation.count({
          where: { status: ReservationStatus.pending },
        }),
        prisma.loan.count({
          where: { status: LoanStatus.active },
        }),
        prisma.loan.count({
          where: { status: LoanStatus.overdue },
        }),
      ])

    return NextResponse.json({
      totalBooks,
      totalUsers,
      totalReservations,
      activeLoans,
      overdueLoans,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'ダッシュボード情報の取得に失敗しました。' },
      { status: 500 }
    )
  }
}
