
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: parseInt(session.user.id),
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(notifications)
    } catch (error) {
        return NextResponse.json({ message: 'エラーが発生しました', error }, { status: 500 })
    }
}
