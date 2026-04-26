import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// استخدام العميل المباشر للسيرفر
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('Feedback') // تأكد أن الحرف F كبير كما في السوبابيس
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json([], { status: 500 }) // نرجع مصفوفة فارغة لضمان عدم انهيار الداشبورد
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}