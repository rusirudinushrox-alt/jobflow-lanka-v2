import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xrpcdkcrwmtpqwukkoor.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycGNka2Nyd210cHF3dWtrb29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMzU3NTMsImV4cCI6MjEwNzkxMTc1M30.RjjTwpAOIjRqvEY_7GpCbH5VQD1xVmuwe-6YSqjj2Ms'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: 'worker' | 'employer' | 'admin'
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
  status: 'new' | 'reviewed' | 'contacted' | 'closed' | 'rejected'
  posted_by: string | null
  raw_text: string | null
  created_at: string
  updated_at: string
}
