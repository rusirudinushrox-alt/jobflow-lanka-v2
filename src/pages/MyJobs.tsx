import { useEffect, useState } from 'react'
import { supabase, Job } from '../lib/supabase'
import { useAuth } from '../App'

export default function MyJobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('jobs')
      .select('*')
      .eq('posted_by', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setJobs((data as Job[]) || [])
        setLoading(false)
      })
  }, [user])

  async function remove(id: number) {
    if (!confirm('Delete?')) return
    await supabase.from('jobs').delete().eq('id', id)
    setJobs(j => j.filter(x => x.id !== id))
  }

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', marginBottom: 14 }}>My Jobs</h1>
      {jobs.length === 0 ? (
        <div className="empty">ඔයා post කරපු jobs නැහැ</div>
      ) : (
        <div className="grid">
          {jobs.map(job => (
            <div key={job.id} className="job-card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: 'var(--accent)' }}>{job.title}</strong>
                <span className="pill">{job.status}</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--muted)', margin: '8px 0', whiteSpace: 'pre-wrap' }}>
                {job.description}
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => remove(job.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
