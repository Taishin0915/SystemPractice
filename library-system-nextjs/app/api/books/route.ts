import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = 20
    const searchQuery = searchParams.get('q') || ''

    const where = searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery } },
            { author: { contains: searchQuery } },
            { isbn: { contains: searchQuery } },
          ],
        }
      : {}

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.book.count({ where }),
    ])

    return NextResponse.json({
      books,
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '書籍一覧の取得に失敗しました。' },
      { status: 500 }
    )
  }
}
