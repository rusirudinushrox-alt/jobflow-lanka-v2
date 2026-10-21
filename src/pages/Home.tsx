import { useEffect, useState, useRef } from 'react'
import { supabase, Job, trackEvent, isJobActiveByDate } from '../lib/supabase'
import { useAuth } from '../App'

function guessGender(job: Job): string {
  if (job.gender) return job.gender
  const t = `${job.title || ''} ${job.description || ''} ${job.raw_text || ''}`
  if (/girl\s*or\s*boy|boy\s*or\s*girl/i.test(t)) return 'Boys / Girls'
  const boy = /boy|කොල්ල|පිරිමි|male/i.test(t)
  const girl = /girl|කෙල්ල|ගැහැණු|female/i.test(t)
  if (boy && girl) return 'Boys / Girls'
  if (boy) return 'Boys'
  if (girl) return 'Girls'
  return ''
}

function genderIcon(g: string) {
  if (!g) return null
  if (/boys\s*\/\s*girls|girl.*boy|boy.*girl/i.test(g)) return '👫'
  if (/girl/i.test(g)) return '👩'
  if (/boy/i.test(g)) return '👨'
  return '👥'
}

type DetailStats = {
  views: number
  whatsapp: number
  stars: number
  starCount: number
  heart: number
  broken_heart: number
  thumbs_up: number
  thumbs_down: number
}

export default function Home() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [pay, setPay] = useState('')
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [detail, setDetail] = useState<Job | null>(null)
  const [stats, setStats] = useState<DetailStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [myStar, setMyStar] = useState(0)
  const [fbMsg, setFbMsg] = useState('')
  const viewed = useRef<Set<number>>(new Set())

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .in('status', ['new', 'reviewed', 'contacted', 'expired'])
      .order('created_at', { ascending: false })
      .limit(100)
    if (!error && data) setJobs(data as Job[])
    setLoading(false)
  }

  useEffect(() => {
    if (!q.trim()) return
    const t = setTimeout(() => {
      trackEvent('search', { search_term: q.trim(), user_id: user?.id })
    }, 800)
    return () => clearTimeout(t)
  }, [q, user?.id])

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
      (j.city || '').toLowerCase().includes(qq)
    )
  }

  useEffect(() => {
    for (const job of filtered) {
      if (viewed.current.has(job.id)) continue
      if (!isJobActiveByDate(job.work_date) || job.status === 'expired') continue
      viewed.current.add(job.id)
      trackEvent('job_view', { job_id: job.id, district: job.district || undefined, user_id: user?.id })
    }
  }, [filtered, user?.id])

  function waLink(phone: string | null, text: string) {
    if (!phone) return '#'
    const p = phone.replace(/\D/g, '')
    const num = p.startsWith('0') ? '94' + p.slice(1) : p
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`
  }

  function onWhatsApp(job: Job) {
    trackEvent('whatsapp_click', { job_id: job.id, user_id: user?.id })
  }

  async function shareJob(job: Job) {
    const text = [
      job.title || 'Job',
      job.city ? `📍 ${job.city}` : '',
      job.work_date || job.work_time ? `📅 ${[job.work_date, job.work_time].filter(Boolean).join(' ')}` : '',
      job.payment_text ? `💰 ${job.payment_text}` : '',
      '',
      'JobFlow Lanka'
    ].filter(Boolean).join('\n')
    trackEvent('share', { job_id: job.id, user_id: user?.id })
    try {
      if (navigator.share) await navigator.share({ title: job.title || 'Job', text })
      else {
        await navigator.clipboard.writeText(text)
        alert('Details copied — paste to share')
      }
    } catch { /* cancelled */ }
  }

  async function openDetails(job: Job) {
    setDetail(job)
    setStats(null)
    setMyStar(0)
    setFbMsg('')
    setStatsLoading(true)
    const [{ data: events }, { data: feedback }] = await Promise.all([
      supabase.from('analytics_events').select('event_type').eq('job_id', job.id).limit(2000),
      supabase.from('job_feedback').select('feedback_type, rating').eq('job_id', job.id).limit(2000),
    ])
    let views = 0, whatsapp = 0
    for (const e of events || []) {
      if (e.event_type === 'job_view') views++
      if (e.event_type === 'whatsapp_click') whatsapp++
    }
    let starSum = 0, starCount = 0, heart = 0, broken_heart = 0, thumbs_up = 0, thumbs_down = 0
    for (const f of feedback || []) {
      if (f.feedback_type === 'star' && f.rating) {
        starSum += f.rating
        starCount++
      }
      if (f.feedback_type === 'heart') heart++
      if (f.feedback_type === 'broken_heart') broken_heart++
      if (f.feedback_type === 'thumbs_up') thumbs_up++
      if (f.feedback_type === 'thumbs_down') thumbs_down++
    }
    setStats({
      views, whatsapp,
      stars: starCount ? Math.round((starSum / starCount) * 10) / 10 : 0,
      starCount, heart, broken_heart, thumbs_up, thumbs_down,
    })
    setStatsLoading(false)
  }

  async function sendFeedback(type: 'heart' | 'broken_heart' | 'thumbs_up' | 'thumbs_down', rating?: number) {
    if (!detail) return
    const row: { job_id: number; feedback_type: string; rating?: number } = {
      job_id: detail.id,
      feedback_type: type,
    }
    if (rating) {
      row.feedback_type = 'star'
      row.rating = rating
    }
    const { error } = await supabase.from('job_feedback').insert(row)
    if (error) {
      setFbMsg('Save failed — run SQL update?')
      return
    }
    setFbMsg('Thanks!')
    if (rating) setMyStar(rating)
    openDetails(detail)
  }

  function isExpired(job: Job) {
    return job.status === 'expired' || !isJobActiveByDate(job.work_date)
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Jobs in Sri Lanka</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          {filtered.length} jobs • Local extract • No AI
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
        <div className="empty">📭 Jobs නැහැ.</div>
      ) : (
        <div className="grid">
          {filtered.map(job => {
            const g = guessGender(job)
            const expired = isExpired(job)
            return (
              <div key={job.id} className="job-card" style={expired ? { opacity: 0.75 } : undefined}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <strong style={{ color: 'var(--accent)' }}>{job.title || job.job_type || 'Job'}</strong>
                  <small style={{ color: 'var(--muted)' }}>
                    {new Date(job.created_at).toLocaleDateString('si-LK')}
                  </small>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {expired && <span className="pill orange">⛔ Expired</span>}
                  {g && (
                    <span className="pill purple" style={{ fontWeight: 600 }}>
                      {genderIcon(g)} {g}
                    </span>
                  )}
                  {job.city && <span className="pill blue">📍 {job.city}</span>}
                  {job.district && <span className="pill">🗺️ {job.district}</span>}
                  {(job.work_date || job.work_time) && (
                    <span className="pill">🕘 {[job.work_date, job.work_time].filter(Boolean).join(' ')}</span>
                  )}
                  {job.payment_text && (
                    <span className="pill gold">💰 {job.payment_text}{job.food_included ? ' +කෑම' : ''}</span>
                  )}
                  {job.employment_type && (
                    <span className="pill">{job.employment_type === 'full-time' ? 'Full-time' : 'Part-time'}</span>
                  )}
                  {job.immediate_hiring && !expired && <span className="pill orange">⚡ Immediate</span>}
                </div>
                {job.description && (
                  <div style={{
                    fontSize: '0.88rem', color: 'var(--muted)', whiteSpace: 'pre-wrap', marginBottom: 10,
                    maxHeight: 72, overflow: 'hidden'
                  }}>
                    {job.description}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => openDetails(job)}>
                    ℹ️ More
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => shareJob(job)}>
                    Share
                  </button>
                  {job.contact_phone && !expired && (
                    <a
                      className="btn btn-primary btn-sm"
                      href={waLink(job.contact_phone, `Hi, I'm interested in the job: ${job.title || ''}`)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onWhatsApp(job)}
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Details modal — no AI */}
      {detail && (
        <div
          role="dialog"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 50,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 12
          }}
          onClick={() => setDetail(null)}
        >
          <div
            className="card"
            style={{
              width: '100%', maxWidth: 480, maxHeight: '88vh', overflow: 'auto',
              marginBottom: 8
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
              <strong style={{ color: 'var(--accent)', fontSize: '1.05rem' }}>
                {detail.title || 'Job details'}
              </strong>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetail(null)}>✕</button>
            </div>

            {isExpired(detail) && (
              <div className="msg err" style={{ marginBottom: 10 }}>⛔ This job is Expired</div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {guessGender(detail) && (
                <span className="pill purple">{genderIcon(guessGender(detail)!)} {guessGender(detail)}</span>
              )}
              {detail.city && <span className="pill blue">📍 {detail.city}</span>}
              {detail.district && <span className="pill">🗺️ {detail.district}</span>}
              {(detail.work_date || detail.work_time) && (
                <span className="pill">🕘 {[detail.work_date, detail.work_time].filter(Boolean).join(' ')}</span>
              )}
              {detail.payment_text && <span className="pill gold">💰 {detail.payment_text}</span>}
            </div>

            {detail.description && (
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.92rem', marginBottom: 14, lineHeight: 1.45 }}>
                {detail.description}
              </div>
            )}

            {detail.contact_phone && (
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 12 }}>
                📞 {detail.contact_phone}
                <span style={{ marginLeft: 8 }}>(WhatsApp only — no call button)</span>
              </p>
            )}

            <div className="label">Stats</div>
            {statsLoading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : stats && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <span className="pill">👁 Views {stats.views}</span>
                <span className="pill">💬 WhatsApp {stats.whatsapp}</span>
                <span className="pill gold">⭐ {stats.stars || '—'} ({stats.starCount})</span>
              </div>
            )}

            <div className="label">Rating</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: (myStar || (stats && Math.round(stats.stars))) >= n ? '#f5a623' : 'var(--card)',
                    border: '1px solid var(--border)', minWidth: 36
                  }}
                  onClick={() => sendFeedback('heart', n)}
                  aria-label={`${n} stars`}
                >
                  ⭐
                </button>
              ))}
            </div>

            <div className="label">Feedback</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => sendFeedback('heart')} title="Love">
                ❤️ {stats?.heart || 0}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => sendFeedback('broken_heart')} title="Not good">
                💔 {stats?.broken_heart || 0}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => sendFeedback('thumbs_up')} title="Up">
                👍 {stats?.thumbs_up || 0}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => sendFeedback('thumbs_down')} title="Down">
                👎 {stats?.thumbs_down || 0}
              </button>
            </div>
            {fbMsg && <div className="msg ok">{fbMsg}</div>}

            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {detail.contact_phone && !isExpired(detail) && (
                <a
                  className="btn btn-primary btn-sm"
                  href={waLink(detail.contact_phone, `Hi, I'm interested in: ${detail.title || ''}`)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onWhatsApp(detail)}
                >
                  WhatsApp
                </a>
              )}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => shareJob(detail)}>Share</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
