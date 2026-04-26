import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // نقلنا قراءة المتغيرات لداخل الدالة عشان ما تشتغل إلا وقت الاستدعاء الحقيقي
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-site.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  return createBrowserClient(url, key)
}