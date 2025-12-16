import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByUsername, getUserByEmail } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, confirmPassword } = body

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'すべての項目を入力してください。' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'パスワードが一致しません。' },
        { status: 400 }
      )
    }

    // 重複チェック
    if (await getUserByUsername(username)) {
      return NextResponse.json(
        { error: 'このユーザー名は既に使用されています。' },
        { status: 400 }
      )
    }

    if (await getUserByEmail(email)) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています。' },
        { status: 400 }
      )
    }

    // ユーザー作成
    await createUser(username, email, password, UserRole.user)

    return NextResponse.json(
      { message: '登録が完了しました。ログインしてください。' },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '登録中にエラーが発生しました。' },
      { status: 500 }
    )
  }
}
