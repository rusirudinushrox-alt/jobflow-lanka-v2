import { useEffect, useState } from 'react'
import {
  supabase, Job, Profile, jobsToCsv, downloadCsv, isJobActiveByDate
} from '../lib/supabase'

const STATUSES = ['new', 'reviewed', 'contacted', 'closed', 'rejected', 'expired'] as const

type Counts = Record<string, number>
type TopJob = { job_id: number; title: string; count: number }
type TopSearch = { term: string; count: number }

export default function Admin() {
  const [tab, setTab] = useState<'jobs' | 'activity' | 'employers'>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<Counts>({})
  const [topViews, setTopViews] = useState<TopJob[]>([])
  const [topSearch, setTopSearch] = useState<TopSearch[]>([])
  const [waClicks, setWaClicks] = useState(0)
  const [shares, setShares] = useState(0)
  const [msg, setMsg] = useState('')

  async function loadJobs() {
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(300)
    setJobs((data as Job[]) || [])
  }

  async function loadProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200)
    setProfiles((data as Profile[]) || [])
  }

  async function loadActivity() {
    // Last 30 days events — local aggregate, no AI
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const { data } = await supabase
      .from('analytics_events')
      .select('event_type, job_id, search_term')
      .gte('created_at', since.toISOString())
      .limit(5000)

    const events = data || []
    const c: Counts = {}
    const viewMap: Record<number, number> = {}
    const searchMap: Record<string, number> = {}
    let wa = 0
    let sh = 0
    for (const e of events) {
      c[e.event_type] = (c[e.event_type] || 0) + 1
      if (e.event_type === 'job_view' && e.job_id) {
        viewMap[e.job_id] = (viewMap[e.job_id] || 0) + 1
      }
      if (e.event_type === 'search' && e.search_term) {
        const t = String(e.search_term).toLowerCase().trim()
        if (t) searchMap[t] = (searchMap[t] || 0) + 1
      }
      if (e.event_type === 'whatsapp_click') wa++
      if (e.event_type === 'share') sh++
    }
    setCounts(c)
    setWaClicks(wa)
    setShares(sh)

    const jobIds = Object.keys(viewMap).map(Number)
    let titles: Record<number, string> = {}
    if (jobIds.length) {
      const { data: js } = await supabase.from('jobs').select('id, title').in('id', jobIds.slice(0, 50))
      for (const j of js || []) titles[j.id] = j.title || `#${j.id}`
    }
    setTopViews(
      Object.entries(viewMap)
        .map(([id, count]) => ({ job_id: +id, title: titles[+id] || `#${id}`, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    )
    setTopSearch(
      Object.entries(searchMap)
        .map(([term, count]) => ({ term, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    )
  }

  async function refresh() {
    setLoading(true)
    await Promise.all([loadJobs(), loadProfiles(), loadActivity()])
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function setStatus(id: number, status: string) {
    await supabase.from('jobs').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setJobs(j => j.map(x => x.id === id ? { ...x, status: status as Job['status'] } : x))
  }

  async function remove(id: number) {
    if (!confirm('Delete permanently?')) return
    await supabase.from('jobs').delete().eq('id', id)
    setJobs(j => j.filter(x => x.id !== id))
  }

  async function setEmployerAccess(id: string, approve: boolean) {
    await supabase.from('profiles').update({
      role: approve ? 'employer' : 'worker',
      can_post: approve,
    }).eq('id', id)
    setProfiles(ps => ps.map(p => p.id === id
      ? { ...p, role: approve ? 'employer' : 'worker', can_post: approve }
      : p
    ))
    setMsg(approve ? 'Employer approved ✅' : 'Employer access removed')
    setTimeout(() => setMsg(''), 2000)
  }

  function exportJobs(list: Job[], name: string) {
    downloadCsv(name, jobsToCsv(list))
  }

  const expired = jobs.filter(j => j.status === 'expired' || !isJobActiveByDate(j.work_date))
  const active = jobs.filter(j => !expired.includes(j))

  async function purgeExpired() {
    if (!confirm(`Delete ${expired.length} expired jobs from DB permanently? Export first if needed.`)) return
    for (const j of expired) {
      await supabase.from('jobs').delete().eq('id', j.id)
    }
    setJobs(j => j.filter(x => !expired.find(e => e.id === x.id)))
    setMsg('Expired jobs purged')
  }

  if (loading) return <div className="empty">Loading admin...</div>

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', marginBottom: 12 }}>Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button className={`btn btn-sm ${tab === 'jobs' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('jobs')}>Jobs</button>
        <button className={`btn btn-sm ${tab === 'activity' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('activity')}>Activity</button>
        <button className={`btn btn-sm ${tab === 'employers' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('employers')}>Employer access</button>
        <button className="btn btn-secondary btn-sm" onClick={refresh}>Refresh</button>
      </div>
      {msg && <div className="msg ok">{msg}</div>}

      {tab === 'activity' && (
        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Activity (last 30 days · live counts)</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', marginBottom: 16 }}>
            <div className="card"><div className="label">Job views</div><strong style={{ fontSize: '1.4rem' }}>{counts.job_view || 0}</strong></div>
            <div className="card"><div className="label">Searches</div><strong style={{ fontSize: '1.4rem' }}>{counts.search || 0}</strong></div>
            <div className="card"><div className="label">WhatsApp clicks</div><strong style={{ fontSize: '1.4rem' }}>{waClicks}</strong></div>
            <div className="card"><div className="label">Shares</div><strong style={{ fontSize: '1.4rem' }}>{shares}</strong></div>
            <div className="card"><div className="label">Employer conv.</div><strong style={{ fontSize: '1.4rem' }}>{counts.employer_conversation || 0}</strong></div>
            <div className="card"><div className="label">Featured views</div><strong style={{ fontSize: '1.4rem' }}>{counts.featured_view || 0}</strong></div>
          </div>

          <div className="card">
            <div className="label">Most viewed jobs</div>
            {topViews.length === 0 ? <p style={{ color: 'var(--muted)' }}>No views yet</p> : (
              <ul style={{ listStyle: 'none' }}>
                {topViews.map(v => (
                  <li key={v.job_id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    {v.title} <span className="pill">{v.count} views</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <div className="label">Search items (demand signals)</div>
            {topSearch.length === 0 ? <p style={{ color: 'var(--muted)' }}>No searches yet</p> : (
              <ul style={{ listStyle: 'none' }}>
                {topSearch.map(s => (
                  <li key={s.term} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    “{s.term}” <span className="pill gold">{s.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'employers' && (
        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Employer access</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 12 }}>
            Sign-in users. Approve → can post jobs. Remove → worker only (view/engage).
          </p>
          <div className="grid">
            {profiles.map(p => (
              <div key={p.id} className="job-card">
                <strong>{p.full_name || p.email || p.id.slice(0, 8)}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '6px 0' }}>
                  {p.email} · role: <span className="pill">{p.role}</span>
                  {p.can_post && <span className="pill gold"> can post</span>}
                </div>
                {p.role !== 'admin' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!p.can_post ? (
                      <button className="btn btn-primary btn-sm" onClick={() => setEmployerAccess(p.id, true)}>Approve employer</button>
                    ) : (
                      <button className="btn btn-danger btn-sm" onClick={() => setEmployerAccess(p.id, false)}>Remove employer</button>
                    )}
                  </div>
                )}
                {p.role === 'admin' && <span className="pill orange">Admin (you)</span>}
              </div>
            ))}
            {profiles.length === 0 && <div className="empty">No users yet</div>}
          </div>
        </div>
      )}

      {tab === 'jobs' && (
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => exportJobs(active, 'jobs-active.csv')}>Export active Excel/CSV</button>
            <button className="btn btn-secondary btn-sm" onClick={() => exportJobs(expired, 'jobs-expired.csv')}>Export expired Excel/CSV</button>
            <button className="btn btn-secondary btn-sm" onClick={() => exportJobs(jobs, 'jobs-all.csv')}>Export all</button>
            {expired.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={purgeExpired}>Purge expired ({expired.length})</button>
            )}
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 12 }}>
            {active.length} active · {expired.length} expired · Admin can delete any job
          </p>
          <div className="grid">
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ color: 'var(--accent)' }}>{job.title || `#${job.id}`}</strong>
                  <span className="pill">{job.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '8px 0', whiteSpace: 'pre-wrap' }}>
                  {job.description}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8 }}>
                  📞 {job.contact_phone} {job.city ? ` • ${job.city}` : ''}
                  {job.work_date ? ` • ${job.work_date}` : ''}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      className={`btn btn-sm ${job.status === s ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setStatus(job.id, s)}
                    >
                      {s}
                    </button>
                  ))}
                  <button className="btn btn-danger btn-sm" onClick={() => remove(job.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
