'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, QrCode, LogOut, Menu, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, labelAr: 'لوحة التحكم', labelEn: 'Dashboard' },
  { href: '/admin/qrs', icon: QrCode, labelAr: 'رموز QR', labelEn: 'QR Codes' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState('جاري التحميل...')
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setAdminEmail(user.email || '')
        setAuthorized(true)
      } else {
        router.replace('/admin/login')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (!authorized) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-bold text-slate-400">جاري التحقق...</div>
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]" dir="rtl">
      <aside className={cn(
          'fixed inset-y-0 right-0 z-40 w-64 bg-white text-slate-600 flex flex-col transition-transform duration-300 border-l border-slate-100 shadow-sm',
          'md:translate-x-0 md:static md:flex',
          mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        )}>
        <div className="flex items-center justify-center px-6 py-8 border-b border-slate-50">
          <Link href="/admin/dashboard" className="relative group transition-all">
            <Image 
              src="/E33.png"
              alt="Hala Markets Logo"
              width={100}
              height={35}
              priority
              style={{ height: 'auto' }} // هذا السطر يحل مشكلة التيرمينال
              className="object-contain"
            />
          </Link>
          <button className="mr-auto md:hidden text-slate-400 absolute left-4" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={cn('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all',
                  active ? 'bg-[#FFFBEB] text-[#92400E]' : 'text-slate-500 hover:bg-slate-50')}>
                <item.icon className={cn("w-5 h-5", active ? "text-orange-600" : "text-slate-400")} />
                <span>{item.labelAr}</span>
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-4 border-t border-slate-50 mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-[#FFFBEB] flex items-center justify-center border border-[#FEF3C7]">
              <User className="w-5 h-5 text-[#92400E]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-slate-800 truncate" dir="ltr">{adminEmail}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-xs font-bold text-slate-900 hover:text-red-600 hover:bg-red-50 transition-all group">
            <LogOut className="w-4 h-4 text-slate-900 group-hover:text-red-600" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-slate-600"><Menu className="w-6 h-6" /></button>
          <p className="font-bold text-sm text-slate-800">أسواق هلا</p>
          <div className="w-6" />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}