'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Loan {
  id: number
  loanDate: string
  dueDate: string
  returnDate: string | null
  status: string
  user: {
    id: number
    username: string
    email: string
  }
  book: {
    id: number
    title: string
    author: string
  }
}

export default function LoanList() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchLoans()
  }, [session])

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/loans')
      const data = await res.json()
      setLoans(data.loans)
    } catch (error) {
      console.error('貸出一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (loanId: number) => {
    if (!confirm('返却処理を実行しますか？')) {
      return
    }

    try {
      const res = await fetch(`/api/loans/${loanId}/return`, {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        fetchLoans()
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: '返却処理中にエラーが発生しました。', type: 'error' })
    }
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  const isAdmin = session?.user.role === 'admin'

  return (
    <div>
      {message && (
        <div className={`flash-message flash-${message.type}`}>
          {message.text}
        </div>
      )}

      {loans.length === 0 ? (
        <div className="card">
          <p>貸出がありません。</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              {isAdmin && <th>ユーザー</th>}
              <th>書籍</th>
              <th>貸出日</th>
              <th>返却期限</th>
              <th>返却日</th>
              <th>ステータス</th>
              {isAdmin && <th>操作</th>}
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                {isAdmin && <td>{loan.user.username}</td>}
                <td>
                  {loan.book.title} ({loan.book.author})
                </td>
                <td>{new Date(loan.loanDate).toLocaleDateString('ja-JP')}</td>
                <td>{new Date(loan.dueDate).toLocaleDateString('ja-JP')}</td>
                <td>
                  {loan.returnDate
                    ? new Date(loan.returnDate).toLocaleDateString('ja-JP')
                    : '-'}
                </td>
                <td>
                  <span className={`status-badge status-${loan.status}`}>
                    {loan.status === 'active' && '貸出中'}
                    {loan.status === 'returned' && '返却済み'}
                    {loan.status === 'overdue' && '延滞中'}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    {loan.status !== 'returned' && (
                      <button
                        onClick={() => handleReturn(loan.id)}
                        className="btn btn-success"
                      >
                        返却
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
