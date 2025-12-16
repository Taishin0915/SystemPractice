
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { stringify } from 'csv-stringify/sync'

export async function GET() {
    const session = await getServerSession(authOptions)

    // Admin check needed in real app

    try {
        const loans = await prisma.loan.findMany({
            include: {
                user: true,
                book: true
            },
            orderBy: {
                loanDate: 'desc'
            }
        })

        const data = loans.map((loan: any) => ({
            localId: loan.id,
            userName: loan.user.username,
            bookTitle: loan.book.title,
            loanDate: loan.loanDate.toISOString(),
            dueDate: loan.dueDate.toISOString(),
            returnDate: loan.returnDate ? loan.returnDate.toISOString() : '',
            status: loan.status
        }))

        const csv = stringify(data, { header: true })

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="loans_export.csv"'
            }
        })

    } catch (error) {
        return NextResponse.json({ message: 'エラーが発生しました', error }, { status: 500 })
    }
}
