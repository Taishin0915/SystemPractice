'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません。')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/auth/login?registered=true')
      } else {
        setError(data.error || '登録中にエラーが発生しました。')
      }
    } catch (error) {
      setError('登録中にエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="flash-message flash-error">{error}</div>}
      <div className="form-group">
        <label htmlFor="username">ユーザー名</label>
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">メールアドレス</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">パスワード</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">パスワード（確認）</label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? '登録中...' : '登録'}
      </button>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        既にアカウントをお持ちの方は{' '}
        <Link href="/auth/login">こちらからログイン</Link>
      </p>
    </form>
  )
}
