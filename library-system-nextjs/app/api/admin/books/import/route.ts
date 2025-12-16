
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    // if (!session || session.user.role !== 'admin') { // Admin check needed
    //   return NextResponse.json({ message: '権限がありません' }, { status: 403 })
    // }

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ message: 'ファイルがありません' }, { status: 400 })
        }

        const text = await file.text()
        const records = parse(text, {
            columns: true,
            skip_empty_lines: true,
        })

        // 書籍データを登録
        let count = 0
        for (const record of records as any[]) {
            // Validation needed here in real app
            await prisma.book.create({
                data: {
                    title: record.title,
                    author: record.author,
                    isbn: record.isbn,
                    publisher: record.publisher,
                    totalCopies: parseInt(record.totalCopies) || 1,
                    availableCopies: parseInt(record.totalCopies) || 1,
                }
            })
            count++
        }

        return NextResponse.json({ message: `${count}冊の書籍をインポートしました` })
    } catch (error) {
        return NextResponse.json({ message: 'エラーが発生しました', error }, { status: 500 })
    }
}
