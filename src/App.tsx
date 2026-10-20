import { useEffect, useState, createContext, useContext } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { supabase, Profile, ADMIN_EMAIL, canPostJobs } from './lib/supabase'
import Home from './pages/Home'
import PostJob from './pages/PostJob'
import Auth from './pages/Auth'
import Admin from './pages/Admin'
import MyJobs from './pages/MyJobs'

type AuthCtx = {
  user: { id: string; email?: string } | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null, profile: null, loading: true,
  refreshProfile: async () => {}, signOut: async () => {}
})

export function useAuth() { return useContext(AuthContext) }

export default function App() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(uid: string, email?: string | null) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    let p = data as Profile | null
    // Auto-admin for your Gmail
    if (p && email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && p.role !== 'admin') {
      await supabase.from('profiles').update({ role: 'admin', can_post: true }).eq('id', uid)
      p = { ...p, role: 'admin', can_post: true }
    }
    setProfile(p)
  }

  async function refreshProfile() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) await loadProfile(u.id, u.email)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u ? { id: u.id, email: u.email } : null)
      if (u) loadProfile(u.id, u.email).finally(() => setLoading(false))
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null
      setUser(u ? { id: u.id, email: u.email } : null)
      if (u) loadProfile(u.id, u.email)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Hidden clock: expire jobs past work_date (status -> expired), no UI
  useEffect(() => {
    let cancelled = false
    async function expireJobs() {
      const { data } = await supabase
        .from('jobs')
        .select('id, work_date, status')
        .in('status', ['new', 'reviewed', 'contacted'])
        .limit(200)
      if (cancelled || !data) return
      const { isJobActiveByDate } = await import('./lib/supabase')
      for (const j of data) {
        if (!isJobActiveByDate(j.work_date)) {
          await supabase.from('jobs').update({
            status: 'expired',
            updated_at: new Date().toISOString()
          }).eq('id', j.id)
        }
      }
    }
    expireJobs()
    const t = setInterval(expireJobs, 5 * 60 * 1000) // every 5 min, not shown
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const showPost = canPostJobs(profile)

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      <nav className="nav">
        <Link to="/" className="nav-brand">JobFlow Lanka</Link>
        <div className="nav-links">
          <Link to="/" className="btn btn-secondary btn-sm">Jobs</Link>
          {showPost && <Link to="/post" className="btn btn-primary btn-sm">+ Post Job</Link>}
          {user && showPost && <Link to="/my-jobs" className="btn btn-secondary btn-sm">My Jobs</Link>}
          {profile?.role === 'admin' && <Link to="/admin" className="btn btn-secondary btn-sm">Admin</Link>}
          {user ? (
            <button className="btn btn-secondary btn-sm" onClick={signOut}>
              {profile?.full_name || user.email || 'Logout'}
            </button>
          ) : (
            <Link to="/auth" className="btn btn-secondary btn-sm">Login</Link>
          )}
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post" element={showPost ? <PostJob /> : <Navigate to="/" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/my-jobs" element={user && showPost ? <MyJobs /> : <Navigate to="/auth" />} />
          <Route path="/admin" element={profile?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  )
}
