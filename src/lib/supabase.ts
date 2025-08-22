import { createClient } from '@supabase/supabase-js'

// Client-side (browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types for your database
export interface Order {
  id?: string
  service_type: 'writing' | 'editing' | 'presentation'
  full_name: string
  email: string
  subject: string
  document_type: string
  instructions?: string
  pages: number
  deadline: string
  reference_style: string
  has_files: boolean
  total_price?: number
  base_price?: number
  discount_amount?: number
  rush_fee?: number
  status?: 'pending' | 'processing' | 'completed'
  session_id?: string
  created_at?: string
}