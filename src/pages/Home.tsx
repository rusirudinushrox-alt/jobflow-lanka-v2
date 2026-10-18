import { useEffect, useState } from 'react'
import { supabase, Job } from '../lib/supabase'

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [pay, setPay] = useState('')
  const [q, setQ] = useState('')
  const [type, setType] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    let query = supabase
      .from('jobs')
      .select('*')
      .in('status', ['new', 'reviewed', 'contacted'])
      .order('created_at', { ascending: false })
      .limit(100)

    const { data, error } = await query
    if (!error && data) setJobs(data as Job[])
    setLoading(false)
  }

  const districts = [...new Set(jobs.map(j => j.district).filter(Boolean))].sort() as string[]
  const cities = [...new Set(
    jobs.filter(j => !district || j.district === district).map(j => j.city).filter(Boolean)
  )].sort() as string[]

  let filtered = jobs
  if (district) filtered = filtered.filter(j => j.district === district)
  if (city) filtered = filtered.filter(j => j.city === city)
  if (type) filtered = filtered.filter(j => j.employment_type === type)
  if (pay) {
    filtered = filtered.filter(j => {
      const n = j.payment_amount || 0
      if (pay === '0-2000') return n > 0 && n <= 2000
      if (pay === '2000-3000') return n > 2000 && n <= 3000
      if (pay === '3000-5000') return n > 3000 && n <= 5000
      if (pay === '5000+') return n > 5000
      return true
    })
  }
  if (q) {
    const qq = q.toLowerCase()
    filtered = filtered.filter(j =>
      (j.title || '').toLowerCase().includes(qq) ||
      (j.description || '').toLowerCase().includes(qq) ||
      (j.city || '').toLowerCase().includes(qq) ||
      (j.contact_phone || '').includes(qq)
    )
  }

  function waLink(phone: string | null, text: string) {
    if (!phone) return '#'
    const p = phone.replace(/\D/g, '')
    const num = p.startsWith('0') ? '94' + p.slice(1) : p
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Jobs in Sri Lanka</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          {filtered.length} jobs • Local extract • No AI cost
        </p>
      </div>

      <div className="filter-row">
        <select className="select" value={district} onChange={e => { setDistrict(e.target.value); setCity('') }}>
          <option value="">🌍 All Districts</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="select" value={city} onChange={e => setCity(e.target.value)}>
          <option value="">📍 All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="select" value={pay} onChange={e => setPay(e.target.value)}>
          <option value="">💰 All Pay</option>
          <option value="0-2000">Rs. 0–2,000</option>
          <option value="2000-3000">Rs. 2,000–3,000</option>
          <option value="3000-5000">Rs. 3,000–5,000</option>
          <option value="5000+">Rs. 5,000+</option>
        </select>
        <select className="select" value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="part-time">Part-time</option>
          <option value="full-time">Full-time</option>
        </select>
        <input className="input" placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {loading ? (
        <div className="empty">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">📭 Jobs නැහැ. Post Job එකෙන් add කරන්න.</div>
      ) : (
        <div className="grid">
          {filtered.map(job => (
            <div key={job.id} className="job-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <strong style={{ color: 'var(--accent)' }}>{job.title || job.job_type || 'Job'}</strong>
                <small style={{ color: 'var(--muted)' }}>
                  {new Date(job.created_at).toLocaleDateString('si-LK')}
                </small>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {job.city && <span className="pill blue">📍 {job.city}</span>}
                {job.district && <span className="pill">🗺️ {job.district}</span>}
                {(job.work_date || job.work_time) && (
                  <span className="pill">🕘 {[job.work_date, job.work_time].filter(Boolean).join(' ')}</span>
                )}
                {job.payment_text && (
                  <span className="pill gold">💰 {job.payment_text}{job.food_included ? ' +කෑම' : ''}</span>
                )}
                {job.employment_type && (
                  <span className="pill purple">{job.employment_type === 'full-time' ? 'Full-time' : 'Part-time'}</span>
                )}
                {job.immediate_hiring && <span className="pill orange">⚡ Immediate</span>}
              </div>
              {job.description && (
                <div style={{ fontSize: '0.88rem', color: 'var(--muted)', whiteSpace: 'pre-wrap', marginBottom: 10 }}>
                  {job.description}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {job.contact_phone && (
                  <a
                    className="btn btn-primary btn-sm"
                    href={waLink(job.contact_phone, `Hi, I'm interested in the job: ${job.title || ''}`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                )}
                {job.contact_phone && (
                  <a className="btn btn-secondary btn-sm" href={`tel:${job.contact_phone}`}>
                    📞 {job.contact_phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
