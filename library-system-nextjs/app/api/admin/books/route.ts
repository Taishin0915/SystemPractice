import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ books })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '書籍一覧の取得に失敗しました。' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { action, bookId, ...bookData } = body

    if (action === 'add') {
      const book = await prisma.book.create({
        data: {
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn || null,
          publisher: bookData.publisher || null,
          publicationDate: bookData.publicationDate
            ? new Date(bookData.publicationDate)
            : null,
          totalCopies: parseInt(bookData.totalCopies) || 1,
          availableCopies: parseInt(bookData.totalCopies) || 1,
        },
      })
      return NextResponse.json({ message: '書籍を追加しました。', book })
    } else if (action === 'edit') {
      const existingBook = await prisma.book.findUnique({
        where: { id: parseInt(bookId) },
      })

      if (!existingBook) {
        return NextResponse.json(
          { error: '書籍が見つかりません。' },
          { status: 404 }
        )
      }

      const newTotal = parseInt(bookData.totalCopies) || 1
      const diff = newTotal - existingBook.totalCopies

      const book = await prisma.book.update({
        where: { id: parseInt(bookId) },
        data: {
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn || null,
          publisher: bookData.publisher || null,
          publicationDate: bookData.publicationDate
            ? new Date(bookData.publicationDate)
            : null,
          totalCopies: newTotal,
          availableCopies: Math.max(0, existingBook.availableCopies + diff),
        },
      })
      return NextResponse.json({ message: '書籍を更新しました。', book })
    } else if (action === 'delete') {
      await prisma.book.delete({
        where: { id: parseInt(bookId) },
      })
      return NextResponse.json({ message: '書籍を削除しました。' })
    }

    return NextResponse.json(
      { error: '無効なアクションです。' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'エラーが発生しました。' },
      { status: 500 }
    )
  }
}
