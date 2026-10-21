import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xrpcdkcrwmtpqwukkoor.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycGNka2Nyd210cHF3dWtrb29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMzU3NTMsImV4cCI6MjEwNzkxMTc1M30.RjjTwpAOIjRqvEY_7GpCbH5VQD1xVmuwe-6YSqjj2Ms'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/** Only this email is treated as admin */
export const ADMIN_EMAIL = 'rusirudinushrox@gmail.com'

export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: 'worker' | 'employer' | 'admin'
  can_post: boolean
  created_at: string
}

export type Job = {
  id: number
  title: string | null
  description: string | null
  description_si: string | null
  district: string | null
  city: string | null
  job_type: string | null
  employment_type: 'part-time' | 'full-time'
  immediate_hiring: boolean
  payment_amount: number | null
  payment_text: string | null
  food_included: boolean
  work_date: string | null
  work_time: string | null
  contact_name: string | null
  contact_phone: string | null
  gender: string | null
  status: 'new' | 'reviewed' | 'contacted' | 'closed' | 'rejected' | 'expired'
  posted_by: string | null
  raw_text: string | null
  created_at: string
  updated_at: string
  view_count?: number
}

export type AnalyticsEvent = {
  id?: number
  event_type: string
  job_id?: number | null
  user_id?: string | null
  search_term?: string | null
  district?: string | null
  created_at?: string
}

/** Can this profile post jobs? */
export function canPostJobs(p: Profile | null): boolean {
  if (!p) return false
  if (p.role === 'admin') return true
  if (p.role === 'employer' && p.can_post) return true
  return false
}

/** Parse work_date string; true if job still has a future/today date */
export function isJobActiveByDate(workDate: string | null | undefined): boolean {
  if (!workDate || !workDate.trim()) return true // no date = keep visible
  const parts = workDate.split(/[·|,;]/).map(s => s.trim()).filter(Boolean)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let anyFuture = false
  let parsedAny = false
  for (const p of parts) {
    // 2026/10/27 or 2026-10-27
    const m = p.match(/(20\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/)
    if (m) {
      parsedAny = true
      const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10))
      if (d >= today) anyFuture = true
    }
  }
  if (!parsedAny) return true // relative dates like හෙට — keep
  return anyFuture
}

export async function trackEvent(
  event_type: string,
  opts: { job_id?: number; search_term?: string; district?: string; user_id?: string | null } = {}
) {
  try {
    await supabase.from('analytics_events').insert({
      event_type,
      job_id: opts.job_id ?? null,
      user_id: opts.user_id ?? null,
      search_term: opts.search_term ?? null,
      district: opts.district ?? null,
    })
  } catch {
    /* ignore tracking errors */
  }
}

export function jobsToCsv(jobs: Job[]): string {
  const headers = [
    'id', 'title', 'description', 'district', 'city', 'job_type', 'employment_type',
    'payment_text', 'payment_amount', 'work_date', 'work_time', 'contact_name',
    'contact_phone', 'status', 'created_at', 'raw_text'
  ]
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v)
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  const rows = jobs.map(j => headers.map(h => esc((j as Record<string, unknown>)[h])).join(','))
  return [headers.join(','), ...rows].join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
