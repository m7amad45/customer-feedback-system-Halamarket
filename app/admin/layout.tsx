'use client'

import Link from 'next/link'
import Image from 'next/image' // تم إضافة استيراد Image هنا
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

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setAdminEmail(user.email || '')
      } else {
        router.push('/admin/login')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]" dir="rtl">
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-40 w-64 bg-white text-slate-600 flex flex-col transition-transform duration-300 border-l border-slate-100 shadow-sm',
          'md:translate-x-0 md:static md:flex',
          mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo Section */}
<div className="flex items-center justify-center px-6 py-8 border-b border-slate-50">
  <Link 
    href="/admin/dashboard" 
    className="relative group transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95"
  >
    <Image 
      src="/E33.png"
      alt="Hala Markets Logo"
      width={100} // تم تصغير الحجم قليلاً كما طلبت
      height={35}
      priority
      className="object-contain transition-opacity duration-300 group-hover:opacity-90"
    />
  </Link>
  
  {/* زر إغلاق الجوال - يبقى في مكانه إذا كان الجوال مفتوحاً */}
  <button
    className="mr-auto md:hidden text-slate-400 absolute left-4"
    onClick={() => setMobileOpen(false)}
  >
    <X className="w-5 h-5" />
  </button>
</div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200',
                  active
                    ? 'bg-[#FFFBEB] text-[#92400E]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", active ? "text-orange-600" : "text-slate-400")} />
                <span>{item.labelAr}</span>
              </Link>
            )
          })}
        </nav>

{/* Footer Section */}
<div className="px-4 py-4 border-t border-slate-50 mt-auto">
  {/* قسم اليوزر - خلفية شفافة */}
  <div className="flex items-center gap-3 px-3 py-3 mb-1">
    <div className="w-10 h-10 rounded-full bg-[#FFFBEB] flex items-center justify-center shrink-0 border border-[#FEF3C7]">
      <User className="w-5 h-5 text-[#92400E]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-bold text-slate-800 truncate" dir="ltr">
        {adminEmail}
      </p>
    </div>
  </div>
  
  {/* زر تسجيل الخروج - الخط أسود */}
  <button 
    onClick={handleLogout}
    className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-xs font-bold text-slate-900 hover:text-red-600 hover:bg-red-50 transition-all group"
  >
    <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-red-100/50">
      <LogOut className="w-4 h-4 shrink-0 text-slate-900 group-hover:text-red-600" />
    </div>
    <span>تسجيل الخروج</span>
  </button>
</div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
          <p className="font-bold text-sm text-slate-800">أسواق هلا</p>
          <div className="w-6" />
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}