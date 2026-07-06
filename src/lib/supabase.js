import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL } from '../config'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_DfAuK1SeqoO3ezIgdotLzg_mff0e7lB'

export const supabase = createClient(SUPABASE_URL, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
