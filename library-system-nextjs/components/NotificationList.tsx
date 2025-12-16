
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Notification {
    id: number
    message: string
    isRead: boolean
    type: 'info' | 'alert' | 'success'
    createdAt: string
}

export default function NotificationList() {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session) fetchNotifications()
        else setLoading(false)
    }, [session])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            setNotifications(data.notifications || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!session) return null
    if (loading) return <div>読み込み中...</div>
    if (notifications.length === 0) return <p>お知らせはありません。</p>

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h2>🔔 お知らせ</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {notifications.map((n) => (
                    <li key={n.id} style={{
                        borderBottom: '1px solid #eee',
                        padding: '1rem',
                        backgroundColor: n.type === 'success' ? '#e8f8f5' : n.type === 'alert' ? '#fdedec' : 'white'
                    }}>
                        <p style={{ margin: 0, fontWeight: n.isRead ? 'normal' : 'bold' }}>{n.message}</p>
                        <small style={{ color: '#999' }}>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}</small>
                    </li>
                ))}
            </ul>
        </div>
    )
}
