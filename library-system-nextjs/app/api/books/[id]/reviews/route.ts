import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const bookId = parseInt(params.id)

    try {
        const reviews = await prisma.review.findMany({
            where: {
                bookId: bookId,
            },
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(reviews)
    } catch (error) {
        return NextResponse.json({ message: 'レビューの取得に失敗しました', error }, { status: 500 })
    }
}
