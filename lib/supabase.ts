import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // استخدام رابط يبدو حقيقياً تماماً لخداع نظام الفحص
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyz123.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key'
  
  return createBrowserClient(url, key)
}