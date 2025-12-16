'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardStats {
  totalBooks: number
  totalUsers: number
  totalReservations: number
  activeLoans: number
  overdueLoans: number
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
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
    fetchStats()
  }, [session])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('ダッシュボード情報の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  if (!stats) {
    return <div>データの取得に失敗しました。</div>
  }

  const handleExport = () => {
    window.location.href = '/api/admin/loans/export'
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const formData = new FormData()
    formData.append('file', e.target.files[0])

    try {
      const res = await fetch('/api/admin/books/import', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      alert(data.message)
    } catch (error) {
      alert('インポートに失敗しました')
    }
  }

  return (
    <div>
      <div className="grid">
        <div className="stat-card">
          <h3>貸出ログ出力</h3>
          <button onClick={handleExport} className="btn btn-primary">CSVエクスポート</button>
        </div>
        <div className="stat-card">
          <h3>書籍一括登録</h3>
          <input type="file" accept=".csv" onChange={handleImport} />
        </div>
      </div>

      {/* 既存のダッシュボードコンテンツ (省略) */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalBooks}</h3>
          <p>総書籍数</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalUsers}</h3>
          <p>総ユーザー数</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalReservations}</h3>
          <p>保留中の予約</p>
        </div>
        <div className="stat-card">
          <h3>{stats.activeLoans}</h3>
          <p>貸出中</p>
        </div>
        <div className="stat-card">
          <h3>{stats.overdueLoans}</h3>
          <p>延滞中</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link href="/admin/books" className="btn btn-primary" style={{ marginRight: '1rem' }}>
          書籍管理
        </Link>
        <Link href="/admin/users" className="btn btn-primary">
          ユーザー管理
        </Link>
      </div>
    </div>
  )
}
