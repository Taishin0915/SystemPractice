import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div>
      <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <h1>ログイン</h1>
        <LoginForm />
      </div>
    </div>
  )
}
