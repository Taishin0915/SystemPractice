'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-brand">
          <Link href="/books">図書館予約管理システム</Link>
        </div>
        <ul className="nav-menu">
          <li>
            <Link href="/books">書籍一覧</Link>
          </li>
          {session ? (
            <>
              <li>
                <Link href="/reservations">予約一覧</Link>
              </li>
              <li>
                <Link href="/loans">貸出一覧</Link>
              </li>
              {session.user.role === 'admin' && (
                <li>
                  <Link href="/admin">管理画面</Link>
                </li>
              )}
              <li>
                <button
                  onClick={() => signOut()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  ログアウト
                </button>
              </li>
              <li className="user-info">{session.user.username}さん</li>
            </>
          ) : (
            <>
              <li>
                <Link href="/auth/login">ログイン</Link>
              </li>
              <li>
                <Link href="/auth/register">会員登録</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}
