
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Review {
    id: number
    userId: number
    bookId: number
    rating: number
    comment: string
    createdAt: string
    user: {
        username: string
    }
}

export default function ReviewSection({ bookId }: { bookId: number }) {
    const { data: session } = useSession()
    const [reviews, setReviews] = useState<Review[]>([])
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReviews()
    }, [bookId])

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/books/${bookId}/reviews`)
            const data = await res.json()
            // API returns { reviews: [...] } or just [...]?
            // Based on usual Next.js API patterns I used, let's verify.
            // If the API returns NextResponse.json({ reviews }); then data.reviews is correct.
            // If API returns NextResponse.json(reviews); then data is the array.

            // I will assume it follows the same pattern as others I might have fixed or consistent style.
            // Let's safe guard it.
            if (Array.isArray(data)) {
                setReviews(data)
            } else if (data.reviews && Array.isArray(data.reviews)) {
                setReviews(data.reviews)
            } else {
                setReviews([])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!session) return alert('レビューするにはログインが必要です')

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId, rating, comment }),
            })

            if (!res.ok) {
                const error = await res.json()
                alert(error.message)
                return
            }

            setComment('')
            fetchReviews() // リロード
        } catch (error) {
            alert('エラーが発生しました')
        }
    }

    if (loading) return <div>読み込み中...</div>

    return (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
            <h3>レビュー ({reviews.length}件)</h3>

            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                {reviews.length === 0 ? (
                    <p>まだレビューはありません。</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} style={{ borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                {review.user.username} - {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                            <p style={{ margin: '0.2rem 0' }}>{review.comment}</p>
                        </div>
                    ))
                )}
            </div>

            {session && (
                <form onSubmit={handleSubmit} style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>
                    <h4>レビューを書く</h4>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ marginRight: '1rem' }}>評価:</label>
                        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                            <option value="5">★★★★★</option>
                            <option value="4">★★★★☆</option>
                            <option value="3">★★★☆☆</option>
                            <option value="2">★★☆☆☆</option>
                            <option value="1">★☆☆☆☆</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <textarea
                            placeholder="感想を入力してください"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={{ width: '100%', minHeight: '80px', padding: '0.5rem' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">投稿する</button>
                </form>
            )}
        </div>
    )
}
