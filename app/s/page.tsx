'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { QuestionCard } from '@/components/survey/question-card'
import { DEPARTMENTS, RATING_EMOJIS, type Language, type Department } from '@/lib/feedback-data'
import { cn } from '@/lib/utils'

type Step = 'welcome' | 'questions' | 'comment' | 'success'

export default function SurveyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams()
  const deptParam = searchParams.get('dept')

  const [lang, setLang] = useState<Language>('ar')
  const [step, setStep] = useState<Step>('welcome')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')

  // Find department from query param
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
      // حساب متوسط التقييم من الإجابات
      const scores = Object.values(answers);
      const averageRating = scores.length 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
        : 0;

      // الإرسال الحقيقي للبيانات
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
      setIsSubmitting(false); // نعيد تفعيل الزر فقط في حالة الخطأ
    }
  }
  // Get current rating emoji
  const currentRating = department ? answers[department.questions[currentQuestion]?.id] : 0
  const ratingEmoji = RATING_EMOJIS.find((r) => r.score === currentRating)

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      {/* Header - minimal, no bottom nav */}
      <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">ه</span>
          </div>
          <span className="font-bold text-foreground text-sm hidden sm:block">
            {isRtl ? 'أسواق هلا' : 'Hala Markets'}
          </span>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
          {(['ar', 'en'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                lang === l
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {l === 'ar' ? 'عربي' : 'EN'}
            </button>
          ))}
        </div>
      </header>

      {/* Progress bar */}
      {step !== 'welcome' && step !== 'success' && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{isRtl ? 'التقدم في الاستبيان' : 'Survey Progress'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Main content - no bottom navigation */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 max-w-lg mx-auto w-full gap-4">
        <AnimatePresence mode="wait">
          {/* ─── Welcome ─── */}
          {step === 'welcome' && department && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="w-full flex flex-col items-center gap-6 pt-4"
            >
              {/* Store image with department label */}
              <div className="w-full rounded-2xl overflow-hidden relative aspect-video shadow-md">
                <Image
                  src="/hala-store.jpg"
                  alt="Hala Markets Store"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 right-4 text-white text-right">
                  <p className="font-bold text-lg text-balance">
                    {isRtl ? 'استبيان رضا العملاء' : 'Customer Satisfaction Survey'}
                  </p>
                  <p className="text-sm text-white/80 mt-1 flex items-center gap-2 justify-end">
                    <span>{department.emoji}</span>
                    <span>{isRtl ? department.nameAr : department.nameEn}</span>
                  </p>
                </div>
              </div>

              {/* Welcome text */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground text-balance">
                  {isRtl ? 'أهلاً وسهلاً بك' : 'Welcome!'}
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed text-balance">
                  {isRtl
                    ? 'رأيك يهمنا ويساعدنا على تقديم أفضل تجربة لك في كل زيارة'
                    : 'Your feedback helps us provide the best experience on every visit'}
                </p>
              </div>

              {/* Department info card */}
              <div className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-4xl">{department.emoji}</span>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <p className="font-bold text-foreground text-sm">
                    {isRtl ? `تقييم قسم ${department.nameAr}` : `${department.nameEn} Department Review`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isRtl ? `${department.questions.length} أسئلة` : `${department.questions.length} questions`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('questions')
                  setCurrentQuestion(0)
                  setAnswers({})
                }}
                className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md"
              >
                {isRtl ? (
                  <>
                    <ArrowLeft className="w-5 h-5" />
                    متابعة
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* ─── Questions with Stars + Emoji ─── */}
          {step === 'questions' && department && (
            <motion.div
              key={`q-${currentQuestion}`}
              initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 30 : -30 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col gap-5"
            >
              {/* Dept label */}
              <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                <span className="text-xl">{department.emoji}</span>
                <span>{isRtl ? department.nameAr : department.nameEn}</span>
              </div>

              {/* Question Card with Emoji Reaction */}
              <QuestionCard
                question={department.questions[currentQuestion]}
                questionIndex={currentQuestion}
                totalQuestions={department.questions.length}
                value={answers[department.questions[currentQuestion].id] ?? 0}
                onChange={(v) => handleAnswer(department.questions[currentQuestion].id, v)}
                language={lang}
              />

              {/* Emoji reaction display */}
              {ratingEmoji && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-2 py-2"
                >
                  <motion.span 
                    key={ratingEmoji.score}
                    initial={{ scale: 0.5, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-6xl"
                  >
                    {ratingEmoji.emoji}
                  </motion.span>
                  <span 
                    className="text-sm font-bold"
                    style={{ color: ratingEmoji.color }}
                  >
                    {isRtl ? ratingEmoji.label : ratingEmoji.labelEn}
                  </span>
                </motion.div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-secondary text-secondary-foreground rounded-2xl py-3 font-semibold text-sm hover:bg-secondary/80 transition-all"
                >
                  {isRtl ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!answers[department.questions[currentQuestion].id]}
                  className={cn(
                    'flex-[2] rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all',
                    answers[department.questions[currentQuestion].id]
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {currentQuestion < department.questions.length - 1
                    ? isRtl ? (<><ArrowLeft className="w-4 h-4" /> التالي</>) : (<>Next <ArrowRight className="w-4 h-4" /></>)
                    : isRtl ? (<><ArrowLeft className="w-4 h-4" /> إضافة تعليق</>) : (<>Add Comment <ArrowRight className="w-4 h-4" /></>)
                  }
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── Comment ─── */}
          {step === 'comment' && (
            <motion.div
              key="comment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col gap-5"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground text-balance">
                  {isRtl ? 'هل تريد إضافة تعليق؟' : 'Any additional comments?'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRtl ? 'اختياري – شاركنا أي ملاحظات إضافية' : 'Optional – share any additional feedback'}
                </p>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isRtl ? 'اكتب ملاحظاتك هنا...' : 'Write your comments here...'}
                dir={dir}
                rows={5}
                className="w-full bg-card border border-border rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-secondary text-secondary-foreground rounded-2xl py-3 font-semibold text-sm hover:bg-secondary/80 transition-all"
                >
                  {isRtl ? 'رجوع' : 'Back'}
                </button>
                <button
  onClick={handleSubmit}
  disabled={isSubmitting} // الزر يتعطل إذا كان جاري الإرسال
  className={cn(
    "flex-[2] rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all",
    isSubmitting ? "bg-muted cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"
  )}
>
  {isSubmitting ? (
    <>جاري الإرسال...</>
  ) : (
    <>
      <CheckCircle2 className="w-4 h-4" />
      {isRtl ? 'إرسال التقييم' : 'Submit Feedback'}
    </>
  )}
</button>
              </div>
            </motion.div>
          )}

          {/* ─── Success ─── */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-full flex flex-col items-center gap-6 pt-6 text-center"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-8xl"
              >
                🎉
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground text-balance">
                  {isRtl ? 'شكراً لك!' : 'Thank you!'}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed text-balance max-w-xs">
                  {isRtl
                    ? 'تم إرسال تقييمك بنجاح. رأيك يساعدنا على تحسين خدماتنا باستمرار'
                    : 'Your feedback has been submitted. Your opinion helps us continuously improve our services.'}
                </p>
              </div>

              <div className="w-full bg-primary/10 border border-primary/20 rounded-2xl p-4 text-primary text-sm font-semibold">
                {isRtl ? 'نتطلع لرؤيتك مجدداً في أسواق هلا 🌿' : 'We look forward to seeing you again at Hala Markets!'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
