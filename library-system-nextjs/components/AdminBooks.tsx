'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

export default function AdminBooks() {
  const { data: session } = useSession()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationDate: '',
    totalCopies: '1',
  })

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    if (session.user.role !== 'admin') {
      router.push('/books')
      return
    }
    fetchBooks()
  }, [session])

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/admin/books')
      const data = await res.json()
      setBooks(data.books)
    } catch (error) {
      console.error('書籍一覧の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const action = editingBook ? 'edit' : 'add'

    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          bookId: editingBook?.id,
          ...formData,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        setShowForm(false)
        setEditingBook(null)
        setFormData({
          title: '',
          author: '',
          isbn: '',
          publisher: '',
          publicationDate: '',
          totalCopies: '1',
        })
        fetchBooks()
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'エラーが発生しました。', type: 'error' })
    }
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publicationDate: book.publicationDate
        ? new Date(book.publicationDate).toISOString().split('T')[0]
        : '',
      totalCopies: book.totalCopies.toString(),
    })
    setShowForm(true)
  }

  const handleDelete = async (bookId: number) => {
    if (!confirm('この書籍を削除しますか？')) {
      return
    }

    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          bookId,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        fetchBooks()
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: '削除中にエラーが発生しました。', type: 'error' })
    }
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <div>
      {message && (
        <div className={`flash-message flash-${message.type}`}>
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingBook(null)
            setFormData({
              title: '',
              author: '',
              isbn: '',
              publisher: '',
              publicationDate: '',
              totalCopies: '1',
            })
          }}
          className="btn btn-primary"
        >
          {showForm ? 'キャンセル' : '書籍を追加'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2>{editingBook ? '書籍を編集' : '書籍を追加'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>タイトル *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>著者 *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>ISBN</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>出版社</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>出版日</label>
              <input
                type="date"
                value={formData.publicationDate}
                onChange={(e) =>
                  setFormData({ ...formData, publicationDate: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>総冊数 *</label>
              <input
                type="number"
                min="1"
                value={formData.totalCopies}
                onChange={(e) =>
                  setFormData({ ...formData, totalCopies: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" className="btn btn-success">
              {editingBook ? '更新' : '追加'}
            </button>
          </form>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>タイトル</th>
            <th>著者</th>
            <th>ISBN</th>
            <th>在庫</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.isbn || '-'}</td>
              <td>
                {book.availableCopies} / {book.totalCopies}
              </td>
              <td>
                <button
                  onClick={() => handleEdit(book)}
                  className="btn btn-primary"
                  style={{ marginRight: '0.5rem' }}
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="btn btn-danger"
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
