'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
}

export default function AdminUsers() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    if (session.user.role !== 'admin') {
      router.push('/books')
      return
    }
    fetchUsers()
  }, [session])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users)
    } catch (error) {
      console.error('ユーザー一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ユーザー名</th>
            <th>メールアドレス</th>
            <th>権限</th>
            <th>登録日</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <span className={`status-badge ${user.role === 'admin' ? 'status-confirmed' : 'status-pending'}`}>
                  {user.role === 'admin' ? '管理者' : '一般ユーザー'}
                </span>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString('ja-JP')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
