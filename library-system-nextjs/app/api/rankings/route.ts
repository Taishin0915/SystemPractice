
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 貸出回数が多い順に5件取得 (LoanテーブルのbookIdを集計)
        const loanRankings = await prisma.loan.groupBy({
            by: ['bookId'],
            _count: {
                bookId: true,
            },
            orderBy: {
                _count: {
                    bookId: 'desc',
                },
            },
            take: 5,
        })

        // bookIdから書籍情報を取得
        const bookIds = loanRankings.map((r) => r.bookId)
        const books = await prisma.book.findMany({
            where: {
                id: {
                    in: bookIds,
                },
            },
        })

        // ランキング順に並べ替え
        const sortedBooks = loanRankings.map((r: any) => {
            const book = books.find((b: { id: any }) => b.id === r.bookId)
            return {
                ...book,
                loanCount: r._count.bookId,
            }
        }).filter((b: any) => b.id) // 削除された本などは除外

        return NextResponse.json(sortedBooks)

    } catch (error) {
        return NextResponse.json({ message: 'ランキングの取得に失敗しました', error }, { status: 500 })
    }
}
