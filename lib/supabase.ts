import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // نستخدم قيم وهمية فقط أثناء الـ Build لمنع الانهيار
  // في المتصفح الحقيقي سيأخذ القيم من Vercel تلقائياً
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://temp-url.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'temp-key'

  return createBrowserClient(url, key)
}