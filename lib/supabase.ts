import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// فحص للتأكد أن المتغيرات موجودة قبل محاولة إنشاء العميل
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase keys are missing. Check your .env file or Vercel settings.")
}

export const createClient = () =>
  createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  )