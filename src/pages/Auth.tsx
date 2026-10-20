import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, ADMIN_EMAIL } from '../lib/supabase'
import { useAuth } from '../App'

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { refreshProfile } = useAuth()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setMsg('')
    setLoading(true)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setErr(error.message); setLoading(false); return }
      if (data.user) {
        const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: name || null,
          role: isAdmin ? 'admin' : 'worker',
          can_post: isAdmin,
        })
        await refreshProfile()
        setMsg(isAdmin
          ? 'Admin account ready'
          : 'Account created. Job post කරන්න Admin approval ඕනේ.')
        setTimeout(() => nav('/'), 1000)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setErr(error.message); setLoading(false); return }
      await refreshProfile()
      nav('/')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 420, margin: '24px auto' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.3rem', marginBottom: 14 }}>
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </h1>
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 10 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 10 }}>
                Default: normal user (jobs බලන්න). Employer වෙන්න Admin approve කරන්න ඕනේ.
              </p>
            </>
          )}
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 10 }} />
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={{ marginBottom: 14 }} />
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? '...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
        {msg && <div className="msg ok">{msg}</div>}
        {err && <div className="msg err">{err}</div>}
        <p style={{ marginTop: 14, fontSize: '0.88rem', color: 'var(--muted)', textAlign: 'center' }}>
          {mode === 'login' ? (
            <>No account? <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMode('signup')}>Sign up</button></>
          ) : (
            <>Have account? <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMode('login')}>Login</button></>
          )}
        </p>
      </div>
    </div>
  )
}
