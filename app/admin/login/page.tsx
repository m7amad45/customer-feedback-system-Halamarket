"use client"


export const dynamic = 'force-dynamic'

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
      setIsLoading(false)
    } else {
      router.push("/admin/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="fixed inset-0 min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] z-[99999]" dir="rtl">
      
      {/* القسم العلوي - اللوجو المصغر كالصورة */}
      <div className="flex flex-col items-center mb-5 text-center">
        <div className="mb-2">
          <Image 
            src="/E33.png" 
            alt="Hala Markets Logo" 
            width={120} 
            height={40} 
            priority
            className="w-28 md:w-32 h-auto object-contain"
          />
        </div>
        <h1 className="text-xl font-bold text-slate-800">تسجيل الدخول</h1>
      </div>

      {/* الكارد */}
      <div className="bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 rounded-[35px] w-full max-w-[460px] p-8 pt-6 pb-5 md:pt-7 md:pb-6 transition-all">
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          {/* حقل البريد */}
          <div className="space-y-1.5 mb-3">
            <label htmlFor="email" className="text-[12px] font-bold text-slate-500 mr-1 block">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              dir="ltr"
              placeholder="admin@example.com"
              required
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* حقل كلمة المرور */}
          <div className="space-y-1.5 mb-4">
            <label htmlFor="password" className="text-[12px] font-bold text-slate-500 mr-1 block">
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              dir="ltr"
              placeholder="••••••••"
              required
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 mb-4 pr-1">
            <input 
              type="checkbox" 
              id="remember" 
              className="h-3.5 w-3.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer" 
            />
            <label htmlFor="remember" className="text-[11px] text-slate-400 cursor-pointer select-none">
              تذكرني
            </label>
          </div>

          {error && (
            <div className="text-[11px] text-red-500 bg-red-50 p-2 mb-4 rounded-lg border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          {/* الزر الذي يتغير لونه للأصفر عند التحقق */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex h-10 items-center justify-center rounded-lg px-8 py-2 text-[14px] font-bold shadow-md transition-all active:scale-[0.98] ${
              isLoading 
                ? "bg-[#FFD130] text-white shadow-[#FFD130]/20" 
                : "bg-orange-600 text-white shadow-orange-500/20 hover:bg-orange-700"
            }`}
          >
            {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  )
}