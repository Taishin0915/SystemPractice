
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const favoriteSchema = z.object({
    bookId: z.number(),
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    try {
        const json = await req.json()
        const body = favoriteSchema.parse(json)

        // 重複チェック
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_bookId: {
                    userId: parseInt(session.user.id),
                    bookId: body.bookId
                }
            }
        })

        if (existing) {
            return NextResponse.json({ message: '既にお気に入り済みです' }, { status: 400 })
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId: parseInt(session.user.id),
                bookId: body.bookId,
            },
        })

        return NextResponse.json(favorite)
    } catch (error) {
        return NextResponse.json({ message: 'エラーが発生しました', error }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    try {
        const json = await req.json()
        // DELETEもbodyでbookIdを受け取る簡単な実装にします
        const body = favoriteSchema.parse(json)

        await prisma.favorite.delete({
            where: {
                userId_bookId: {
                    userId: parseInt(session.user.id),
                    bookId: body.bookId
                }
            }
        })

        return NextResponse.json({ message: 'お気に入りを解除しました' })
    } catch (error) {
        return NextResponse.json({ message: 'エラーが発生しました', error }, { status: 500 })
    }
}
