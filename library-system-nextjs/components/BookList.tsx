'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Book {
  id: number
  title: string
  author: string
  isbn: string | null
  publisher: string | null
  totalCopies: number
  availableCopies: number
}

export default function BookList() {
  const searchParams = useSearchParams()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [appliedQuery, setAppliedQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    fetchBooks()
  }, [page, appliedQuery])

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(appliedQuery && { q: appliedQuery }),
      })
      const res = await fetch(`/api/books?${params}`)
      const data = await res.json()
      setBooks(data.books || [])
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('書籍一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setAppliedQuery(searchQuery)
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <div>
      <div className="search-box">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="書籍名、著者名、ISBNで検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {books?.length === 0 ? (
        <div className="card">
          <p>書籍が見つかりませんでした。</p>
        </div>
      ) : (
        <>
          <div className="grid">
            {books.map((book) => (
              <div key={book.id} className="book-card">
                <h3>
                  <Link href={`/books/${book.id}`}>{book.title}</Link>
                </h3>
                <p>著者: {book.author}</p>
                {book.isbn && <p>ISBN: {book.isbn}</p>}
                <p>
                  在庫: {book.availableCopies} / {book.totalCopies}
                </p>
                <Link
                  href={`/books/${book.id}`}
                  className="btn btn-primary"
                  style={{ marginTop: '1rem', display: 'inline-block' }}
                >
                  詳細を見る
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {page > 1 && (
                <a href="#" onClick={(e) => { e.preventDefault(); setPage(page - 1) }}>
                  前へ
                </a>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage(p) }}
                  className={p === page ? 'active' : ''}
                >
                  {p}
                </a>
              ))}
              {page < totalPages && (
                <a href="#" onClick={(e) => { e.preventDefault(); setPage(page + 1) }}>
                  次へ
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
