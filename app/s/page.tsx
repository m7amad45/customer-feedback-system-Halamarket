'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { QuestionCard } from '@/components/survey/question-card'
import { DEPARTMENTS, RATING_EMOJIS, type Language, type Department } from '@/lib/feedback-data'
import { cn } from '@/lib/utils'

type Step = 'welcome' | 'questions' | 'comment' | 'success'

export default function SurveyPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <SurveyContent />
    </Suspense>
  )
}

const departmentImages: Record<string, string> = {
  'bakery': '/bakery.jpg',
  'vegetables': '/vegetables.jpg',
  'dairy': '/dairy.jpg',
  'service': '/hala-store.jpg',
};

function SurveyContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams()
  const deptParam = searchParams.get('dept')

  const [lang, setLang] = useState<Language>('ar')
  const [step, setStep] = useState<Step>('welcome')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')

  const department: Department | undefined = DEPARTMENTS.find((d) => d.id === deptParam) ?? DEPARTMENTS[0]

  const isRtl = lang === 'ar'
  const dir = isRtl ? 'rtl' : 'ltr'

  const progress =
    step === 'welcome'
      ? 0
      : step === 'questions' && department
      ? Math.round(((currentQuestion + 1) / department.questions.length) * 80)
      : step === 'comment'
      ? 90
      : step === 'success'
      ? 100
      : 0

  function handleAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleNext() {
    if (!department) return
    if (answers[department.questions[currentQuestion].id] === undefined) return
    if (currentQuestion < department.questions.length - 1) {
      setCurrentQuestion((p) => p + 1)
    } else {
      setStep('comment')
    }
  }

  function handleBack() {
    if (step === 'questions') {
      if (currentQuestion > 0) {
        setCurrentQuestion((p) => p - 1)
      } else {
        setStep('welcome')
      }
    } else if (step === 'comment') {
      setStep('questions')
    }
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // استخراج قيم التقييم فقط من الإجابات (سواء كانت رقماً أو كائناً يحتوي على أسباب)
const scores = Object.values(answers).map((ans: any) => {
  if (typeof ans === 'object' && ans !== null) {
    return ans.rating; // إذا كان تقييم منخفض (مع أسباب)، نأخذ الرقم فقط للحساب
  }
  return typeof ans === 'number' ? ans : 0; // إذا كان تقييم عالي، نأخذ الرقم مباشرة
});

const averageRating = scores.length
  ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  : 0;

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: department?.id,
          departmentName: lang === 'ar' ? department?.nameAr : department?.nameEn,
          overallRating: averageRating,
          comment: comment,
          answers: answers,
        }),
      });

      if (response.ok) {
        setStep('success');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(isRtl ? 'عذراً، حدث خطأ أثناء الإرسال. حاول مرة أخرى.' : 'Error submitting feedback. Please try again.');
      setIsSubmitting(false);
    }
  }

  const currentRating = department ? answers[department.questions[currentQuestion]?.id] : 0
  const ratingEmoji = RATING_EMOJIS.find((r) => r.score === currentRating)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center" dir={dir}>
      
      {/* Header المحدث لضمان ثبات العناصر وتوسط اللوجو */}
<header className="w-full grid grid-cols-3 items-center px-6 py-6 z-10" dir="ltr">
  
  {/* 1. زر اللغة - سيبقى دائماً في أقصى اليسار (بسبب dir="ltr" للهيدر) */}
  <div className="flex justify-start">
    <div className="flex items-center gap-1 bg-secondary rounded-full p-1 shadow-sm border border-border/50">
      {(['ar', 'en'] as Language[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            'px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300',
            lang === l
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {l === 'ar' ? 'عربي' : 'EN'}
        </button>
      ))}
    </div>
  </div>

  {/* 2. اللوجو - في العمود الأوسط (منتصف الشاشة تماماً)
  <div className="flex justify-center">
    <Image 
      src="/E33.png" 
      alt="Hala Markets"
      width={100} 
      height={35}
      priority
      className="object-contain hover:scale-105 transition-transform duration-300"
    />
  </div> */}

  {/* 3. عمود فارغ في اليمين للموازنة (لضمان بقاء اللوجو في النص) */}
  <div className="w-full"></div>
</header>

    {/* ─── Instagram Stories Style Progress Bar ─── */}
{step !== 'welcome' && step !== 'success' && department && (
  <div className="w-full max-w-lg px-2 pt-3 pb-2 flex items-center justify-center gap-1.5 z-50">
    {department.questions.map((_, index) => {
      // حساب حالة كل بار: هل اكتمل؟ هل هو الحالي؟ أم مستقبلي؟
      const isCompleted = index < currentQuestion;
      const isCurrent = index === currentQuestion;
      
      return (
        <div 
          key={index} 
          className="flex-1 h-1 bg-gray-200/60 rounded-full overflow-hidden relative"
        >
          {/* البار الخلفي الرمادي الثابت (يمثل التقدم غير المكتمل) */}
          
          {/* البار الأخضر المتحرك (يمثل التقدم المكتمل) */}
          <motion.div
            className="absolute inset-0 bg-primary rounded-full"
            initial={{ width: isCompleted ? "100%" : "0%" }}
            animate={{ 
              width: isCompleted ? "100%" : isCurrent ? "100%" : "0%" 
            }}
            transition={{ 
              // أنيميشن سريع للبارات المكتملة، وبطيء (تعبئة) للبار الحالي
              duration: isCurrent ? 0.5 : 0.2, 
              ease: "easeInOut" 
            }}
          />
        </div>
      );
    })}
  </div>
)}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 max-w-lg mx-auto w-full gap-4">
        <AnimatePresence mode="wait">
{/* ─── Welcome Step ─── */}
{step === 'welcome' && department && (
  <motion.div
    key="welcome"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full flex flex-col items-center justify-center gap-10 pt-20"
  >
    {/* 1. اللوجو */}
    <motion.div className="relative w-64 h-32">
      <Image 
        src="/E33.png" 
        alt="Hala Markets"
        fill
        priority
        className="object-contain"
      />
    </motion.div>

    {/* 2. النص الترحيبي */}
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-extrabold text-foreground">
        {isRtl ? 'أهلاً وسهلاً بك' : 'Welcome!'}
      </h1>
      <p className="text-muted-foreground text-lg max-w-[280px] mx-auto leading-relaxed">
        {isRtl
          ? 'نسعد بخدمتكم دائماً في أسواق هلا، رأيك يهمنا لنرتقي بخدمتكم'
          : 'We are happy to serve you at Hala Markets, your feedback helps us improve'}
      </p>
    </div>

    {/* 3. الزر */}
    <button
      onClick={() => {
        setStep('questions')
        setCurrentQuestion(0)
        setAnswers({})
      }}
      className="w-full max-w-[280px] bg-primary text-primary-foreground rounded-2xl h-16 font-bold text-xl flex items-center justify-center gap-3 hover:bg-primary/90 active:scale-[0.95] transition-all shadow-xl shadow-primary/20 mt-10"
    >
      {isRtl ? (
        <>
          <span>ابدأ التقييم</span>
          <ArrowLeft className="w-6 h-6" />
        </>
      ) : (
        <>
          <span>Start Survey</span>
          <ArrowRight className="w-6 h-6" />
        </>
      )}
    </button>
  </motion.div>
)}

          {/* خطوة الأسئلة */}
          {step === 'questions' && department && (
            <motion.div
              key={`q-${currentQuestion}`}
              initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 30 : -30 }}
              className="w-full flex flex-col gap-5"
            >
              <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                <span className="text-xl">{department.emoji}</span>
                <span>{isRtl ? department.nameAr : department.nameEn}</span>
              </div>

              <QuestionCard
                question={department.questions[currentQuestion]}
                questionIndex={currentQuestion}
                totalQuestions={department.questions.length}
                value={answers[department.questions[currentQuestion].id] ?? 0}
                onChange={(v) => handleAnswer(department.questions[currentQuestion].id, v)}
                language={lang}
              />

              {ratingEmoji && (
                <div className="flex flex-col items-center gap-2 py-2">
                  <span className="text-6xl">{ratingEmoji.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: ratingEmoji.color }}>
                    {isRtl ? ratingEmoji.label : ratingEmoji.labelEn}
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 bg-secondary text-secondary-foreground rounded-2xl py-3 text-sm font-semibold">
                  {isRtl ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!answers[department.questions[currentQuestion].id]}
                  className={cn(
                    'flex-[2] rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all',
                    answers[department.questions[currentQuestion].id]
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {currentQuestion < department.questions.length - 1 ? (isRtl ? 'التالي' : 'Next') : (isRtl ? 'تعليق' : 'Comment')}
                </button>
              </div>
            </motion.div>
          )}

          {/* خطوة التعليق والنجاح تتبع نفس الأسلوب الأصلي */}
          {/* ... (بقية خطوات الكود الأصلية لضمان عدم حدوث أخطاء) */}
          {step === 'comment' && (
             <motion.div key="comment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col gap-5">
                <h2 className="text-xl font-bold text-foreground">{isRtl ? 'هل تريد إضافة تعليق؟' : 'Any additional comments?'}</h2>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-card border border-border rounded-2xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={isRtl ? 'اكتب ملاحظاتك هنا...' : 'Write your comments here...'}
                />
                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 bg-secondary text-secondary-foreground rounded-2xl py-3 font-semibold">{isRtl ? 'رجوع' : 'Back'}</button>
                  <button onClick={handleSubmit} disabled={isSubmitting} className="flex-[2] bg-primary text-primary-foreground rounded-2xl py-3 font-bold">
                    {isSubmitting ? 'جاري الإرسال...' : (isRtl ? 'إرسال التقييم' : 'Submit')}
                  </button>
                </div>
             </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center gap-6 pt-6 text-center">
              <span className="text-8xl">🎉</span>
              <h2 className="text-2xl font-bold text-foreground">{isRtl ? 'شكراً لك!' : 'Thank you!'}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{isRtl ? 'تم إرسال تقييمك بنجاح.' : 'Your feedback has been submitted.'}</p>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}