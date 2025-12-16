
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const reviewSchema = z.object({
    bookId: z.number(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    try {
        const json = await req.json()
        const body = reviewSchema.parse(json)

        // 重複チェック: 既にレビュー済みならエラー
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: parseInt(session.user.id),
                bookId: body.bookId
            }
        })

        if (existingReview) {
            return NextResponse.json({ message: '既にレビュー済みです' }, { status: 400 })
        }

        const review = await prisma.review.create({
            data: {
                userId: parseInt(session.user.id),
                bookId: body.bookId,
                rating: body.rating,
                comment: body.comment,
            },
        })

        return NextResponse.json(review)
    } catch (error) {
        return NextResponse.json({ message: 'エラーが発生しました', error }, { status: 500 })
    }
}
