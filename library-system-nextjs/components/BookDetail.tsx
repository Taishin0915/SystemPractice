'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReviewSection from './ReviewSection'
import FavoriteButton from './FavoriteButton'

interface Book {
  id: number
  title: string
  author: string
  isbn: string | null
  publisher: string | null
  publicationDate: string | null
  totalCopies: number
  availableCopies: number
}

interface BookDetailProps {
  bookId: number
}

export default function BookDetail({ bookId }: BookDetailProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [hasReservation, setHasReservation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchBook()
  }, [bookId])

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${bookId}`)
      const data = await res.json()
      setBook(data.book)
      setHasReservation(data.hasReservation)
    } catch (error) {
      console.error('書籍詳細の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async () => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    try {
      const res = await fetch(`/api/books/${bookId}/reserve`, {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        setHasReservation(true)
        fetchBook()
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: '予約中にエラーが発生しました。', type: 'error' })
    }
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  if (!book) {
    return <div>書籍が見つかりませんでした。</div>
  }

  return (
    <div>
      <Link href="/books" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
        ← 書籍一覧に戻る
      </Link>

      {message && (
        <div className={`flash-message flash-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{book.title}</h1>
          <FavoriteButton bookId={book.id} />
        </div>

        <p><strong>著者:</strong> {book.author}</p>
        {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
        {book.publisher && <p><strong>出版社:</strong> {book.publisher}</p>}
        {book.publicationDate && (
          <p><strong>出版日:</strong> {new Date(book.publicationDate).toLocaleDateString('ja-JP')}</p>
        )}
        <p><strong>在庫:</strong> {book.availableCopies} / {book.totalCopies}</p>

        {session && (
          <div style={{ marginTop: '1.5rem' }}>
            {hasReservation ? (
              <p style={{ color: '#27ae60' }}>この書籍は既に予約済みです。</p>
            ) : book.availableCopies > 0 ? (
              <button onClick={handleReserve} className="btn btn-success">
                予約する
              </button>
            ) : (
              <p style={{ color: '#e74c3c' }}>この書籍は現在利用できません。</p>
            )}
          </div>
        )}
      </div>

      <ReviewSection bookId={book.id} />
    </div>
  )
}
