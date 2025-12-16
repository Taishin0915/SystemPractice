import RegisterForm from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <div>
      <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <h1>会員登録</h1>
        <RegisterForm />
      </div>
    </div>
  )
}
