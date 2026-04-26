import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 1. بدلاً من إنشاء العميل فوراً، ننشئ دالة تستدعيه عند الحاجة فقط
const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

export async function GET() {
  try {
    const supabase = getSupabase() // استدعاء العميل هنا داخل الدالة
    const { data, error } = await supabase
      .from('Feedback')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = getSupabase() // استدعاء العميل هنا داخل الدالة
    
    const { data, error } = await supabase
      .from('Feedback')
      .insert([
        {
          departmentId: body.departmentId,
          departmentName: body.departmentName,
          overallRating: body.overallRating,
          comment: body.comment,
          answers: body.answers,
        }
      ])
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("POST API Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}