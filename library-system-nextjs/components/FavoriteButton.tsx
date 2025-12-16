
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function FavoriteButton({ bookId }: { bookId: number }) {
    const { data: session } = useSession()
    const [isFavorite, setIsFavorite] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session) {
            checkFavorite()
        } else {
            setLoading(false)
        }
    }, [bookId, session])

    const checkFavorite = async () => {
        try {
            const res = await fetch(`/api/favorites/${bookId}`)
            const data = await res.json()
            setIsFavorite(data.isFavorite)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const toggleFavorite = async () => {
        if (!session) return alert('お気に入り機能を使うにはログインが必要です')

        setLoading(true)
        try {
            const method = isFavorite ? 'DELETE' : 'POST'
            const res = await fetch('/api/favorites', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId }),
            })

            if (res.ok) {
                setIsFavorite(!isFavorite)
            } else {
                alert('エラーが発生しました')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!session) return null

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: isFavorite ? 'red' : '#ccc',
                transition: 'color 0.2s'
            }}
            title={isFavorite ? 'お気に入り解除' : 'お気に入り登録'}
        >
            {isFavorite ? '♥' : '♡'}
        </button>
    )
}
