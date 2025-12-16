
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { bookId: string } }
) {
    const session = await getServerSession(authOptions)
    const bookId = parseInt(params.bookId)

    if (!session || !session.user) {
        return NextResponse.json({ isFavorite: false })
    }

    try {
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_bookId: {
                    userId: parseInt(session.user.id),
                    bookId: bookId,
                },
            },
        })

        return NextResponse.json({ isFavorite: !!favorite })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ isFavorite: false })
    }
}
