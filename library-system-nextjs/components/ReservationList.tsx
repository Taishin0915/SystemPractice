'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Reservation {
  id: number
  reservationDate: string
  status: string
  expiryDate: string | null
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

export default function ReservationList() {
  const { data: session } = useSession()
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchReservations()
  }, [session])

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations')
      const data = await res.json()
      setReservations(data.reservations)
    } catch (error) {
      console.error('予約一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (reservationId: number) => {
    if (!confirm('予約をキャンセルしますか？')) {
      return
    }

    try {
      const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        fetchReservations()
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'キャンセル中にエラーが発生しました。', type: 'error' })
    }
  }

  const handleLoan = async (reservationId: number) => {
    if (!confirm('貸出手続きを実行しますか？')) {
      return
    }

    try {
      const res = await fetch(`/api/reservations/${reservationId}/loan`, {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        fetchReservations()
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: '貸出手続き中にエラーが発生しました。', type: 'error' })
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

      {reservations.length === 0 ? (
        <div className="card">
          <p>予約がありません。</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              {isAdmin && <th>ユーザー</th>}
              <th>書籍</th>
              <th>予約日</th>
              <th>有効期限</th>
              <th>ステータス</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                {isAdmin && <td>{reservation.user.username}</td>}
                <td>
                  {reservation.book.title} ({reservation.book.author})
                </td>
                <td>
                  {new Date(reservation.reservationDate).toLocaleDateString('ja-JP')}
                </td>
                <td>
                  {reservation.expiryDate
                    ? new Date(reservation.expiryDate).toLocaleDateString('ja-JP')
                    : '-'}
                </td>
                <td>
                  <span className={`status-badge status-${reservation.status}`}>
                    {reservation.status === 'pending' && '保留中'}
                    {reservation.status === 'confirmed' && '確認済み'}
                    {reservation.status === 'cancelled' && 'キャンセル済み'}
                  </span>
                </td>
                <td>
                  {reservation.status === 'pending' && (
                    <>
                      {isAdmin && (
                        <button
                          onClick={() => handleLoan(reservation.id)}
                          className="btn btn-success"
                          style={{ marginRight: '0.5rem' }}
                        >
                          貸出
                        </button>
                      )}
                      {(!isAdmin || reservation.user.id === parseInt(session?.user.id || '0')) && (
                        <button
                          onClick={() => handleCancel(reservation.id)}
                          className="btn btn-danger"
                        >
                          キャンセル
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
