import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { extractAll, Extracted } from '../lib/extract'
import { useAuth } from '../App'

export default function PostJob() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [raw, setRaw] = useState('')
  const [extracted, setExtracted] = useState<Extracted | null>(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!raw.trim()) { setExtracted(null); return }
    const t = setTimeout(() => setExtracted(extractAll(raw)), 250)
    return () => clearTimeout(t)
  }, [raw])

  async function save() {
    if (!user) {
      setErr('Post කරන්න Login වෙන්න')
      return
    }
    if (!extracted) {
      setErr('Extract කරන්න / message එකක් දාන්න')
      return
    }
    setSaving(true)
    setErr('')
    setMsg('')

    // Ensure profile exists
    if (!profile) {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email || null,
        role: 'employer',
        full_name: extracted.contactName || null,
        phone: extracted.contact || null,
      })
    }

    const { error } = await supabase.from('jobs').insert({
      title: extracted.title,
      description: extracted.clean,
      description_si: extracted.clean,
      district: extracted.district || null,
      city: extracted.location || null,
      job_type: extracted.workType || null,
      employment_type: extracted.employmentType,
      immediate_hiring: extracted.immediate,
      payment_amount: extracted.paymentNum || null,
      payment_text: extracted.payment || null,
      food_included: extracted.food,
      work_date: extracted.date || null,
      work_time: extracted.time || null,
      contact_name: extracted.contactName || null,
      contact_phone: extracted.contact || null,
      status: 'new',
      posted_by: user.id,
      raw_text: raw,
    })

    setSaving(false)
    if (error) {
      setErr(error.message)
      return
    }
    setMsg('Job saved ✅')
    setRaw('')
    setExtracted(null)
    setTimeout(() => nav('/'), 800)
  }

  function loadExample() {
    setRaw(`හවස සල්ලි ගන්න කැමති කොල්ලන් ට 
Heta boy 4k
9:30 ta එන්න 
රාජගිරිය boy 4 
Ewalema payment eka denawa 
Helper wedak
Yaluwo 4 k ok
2400+food 
0750900940 maheshika`)
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.35rem', marginBottom: 12 }}>Post a Job</h1>

      {!user && (
        <div className="msg err">
          Job post කරන්න <a href="/auth" style={{ color: '#fbbf24', textDecoration: 'underline' }}>Login / Sign up</a> වෙන්න.
        </div>
      )}

      <div className="card">
        <label className="label">01 / DRAFT – Rough WhatsApp message</label>
        <textarea
          className="textarea"
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder="Messy job message paste කරන්න..."
        />
        <div className="live-bar">
          {extracted?.location && <span className="pill blue">📍 {extracted.location}</span>}
          {extracted?.time && <span className="pill">🕘 {extracted.time}</span>}
          {extracted?.payment && <span className="pill gold">💰 {extracted.payment}{extracted.food ? ' +කෑම' : ''}</span>}
          {extracted?.date && <span className="pill orange">📅 {extracted.date}</span>}
          {extracted?.contact && <span className="pill purple">📞 {extracted.contact}</span>}
          {extracted?.immediate && <span className="pill orange">⚡ Immediate</span>}
          {!extracted && <span className="pill" style={{ background: 'rgba(148,163,184,0.15)', color: 'var(--muted)' }}>Live extract...</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" type="button" onClick={loadExample}>Example</button>
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => { setRaw(''); setExtracted(null) }}>Clear</button>
        </div>
      </div>

      {extracted && extracted.clean && (
        <div className="card">
          <label className="label">02 / PREVIEW</label>
          <div className="preview">{extracted.clean}</div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving || !user}>
              {saving ? 'Saving...' : '💾 Save to Job Board'}
            </button>
          </div>
        </div>
      )}

      {msg && <div className="msg ok">{msg}</div>}
      {err && <div className="msg err">{err}</div>}
    </div>
  )
}
