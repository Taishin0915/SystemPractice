
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Book {
    id: number
    title: string
    loanCount: number
}

export default function RankingList() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const res = await fetch('/api/rankings')
                const data = await res.json()
                setBooks(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchRankings()
    }, [])

    if (loading) return <div>読み込み中...</div>
    if (books.length === 0) return null

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h2>🏆 人気ランキング (貸出回数)</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {books.map((book, index) => (
                    <li key={book.id} style={{ borderBottom: '1px solid #eee', padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                        <span style={{
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            width: '30px',
                            textAlign: 'center',
                            marginRight: '1rem',
                            color: index < 3 ? '#e67e22' : '#7f8c8d'
                        }}>
                            {index + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                            <Link href={`/books/${book.id}`} style={{ fontWeight: 'bold' }}>
                                {book.title}
                            </Link>
                            <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                {book.loanCount}回貸出
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
