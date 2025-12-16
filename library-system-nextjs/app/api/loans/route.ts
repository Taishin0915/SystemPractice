import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { LoanStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const isAdmin = session.user.role === 'admin'

    const loans = await prisma.loan.findMany({
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
      orderBy: { loanDate: 'desc' },
    })

    // 延滞チェック
    const now = new Date()
    for (const loan of loans) {
      if (
        loan.status === LoanStatus.active &&
        loan.dueDate < now
      ) {
        await prisma.loan.update({
          where: { id: loan.id },
          data: { status: LoanStatus.overdue },
        })
        loan.status = LoanStatus.overdue
      }
    }

    return NextResponse.json({ loans })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '貸出一覧の取得に失敗しました。' },
      { status: 500 }
    )
  }
}
