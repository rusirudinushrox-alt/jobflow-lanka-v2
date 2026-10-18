import { useEffect, useState } from 'react'
import { supabase, Job } from '../lib/supabase'

const STATUSES = ['new', 'reviewed', 'contacted', 'closed', 'rejected'] as const

export default function Admin() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(200)
    setJobs((data as Job[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function setStatus(id: number, status: string) {
    await supabase.from('jobs').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setJobs(j => j.map(x => x.id === id ? { ...x, status: status as Job['status'] } : x))
  }

  async function remove(id: number) {
    if (!confirm('Delete permanently?')) return
    await supabase.from('jobs').delete().eq('id', id)
    setJobs(j => j.filter(x => x.id !== id))
  }

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', marginBottom: 14 }}>Admin – All Jobs ({jobs.length})</h1>
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
              📞 {job.contact_phone} {job.contact_name ? `– ${job.contact_name}` : ''}
              {job.city ? ` • ${job.city}` : ''}
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
  )
}
