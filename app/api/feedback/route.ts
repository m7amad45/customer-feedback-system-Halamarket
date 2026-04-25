import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// دالة الإرسال (موجودة عندك سابقاً)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const feedback = await prisma.feedback.create({
      data: {
        departmentId: body.departmentId,
        departmentName: body.departmentName,
        overallRating: body.overallRating,
        comment: body.comment,
        answers: body.answers,
      },
    });
    return NextResponse.json({ success: true, id: feedback.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- الدالة الجديدة لجلب البيانات ---
export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc', // يجيب أحدث التقييمات فوق
      },
    });
    return NextResponse.json(feedbacks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}