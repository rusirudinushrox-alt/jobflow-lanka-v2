import { useEffect, useState, createContext, useContext } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase, Profile } from './lib/supabase'
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

  async function loadProfile(uid: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    setProfile(data as Profile | null)
  }

  async function refreshProfile() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) await loadProfile(u.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u ? { id: u.id, email: u.email } : null)
      if (u) loadProfile(u.id).finally(() => setLoading(false))
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null
      setUser(u ? { id: u.id, email: u.email } : null)
      if (u) loadProfile(u.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      <nav className="nav">
        <Link to="/" className="nav-brand">JobFlow Lanka</Link>
        <div className="nav-links">
          <Link to="/" className="btn btn-secondary btn-sm">Jobs</Link>
          <Link to="/post" className="btn btn-primary btn-sm">+ Post Job</Link>
          {user && <Link to="/my-jobs" className="btn btn-secondary btn-sm">My Jobs</Link>}
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
          <Route path="/post" element={<PostJob />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/my-jobs" element={user ? <MyJobs /> : <Navigate to="/auth" />} />
          <Route path="/admin" element={profile?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  )
}
