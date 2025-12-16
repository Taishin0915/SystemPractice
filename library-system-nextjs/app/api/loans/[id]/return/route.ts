import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { LoanStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const loanId = parseInt(params.id)

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { book: true },
    })

    if (!loan) {
      return NextResponse.json(
        { error: '貸出が見つかりません。' },
        { status: 404 }
      )
    }

    if (loan.status === LoanStatus.returned) {
      return NextResponse.json(
        { error: 'この貸出は既に返却されています。' },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      prisma.loan.update({
        where: { id: loanId },
        data: {
          returnDate: new Date(),
          status: LoanStatus.returned,
        },
      }),
      prisma.book.update({
        where: { id: loan.bookId },
        data: { availableCopies: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ message: '返却処理が完了しました。' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '返却処理中にエラーが発生しました。' },
      { status: 500 }
    )
  }
}
