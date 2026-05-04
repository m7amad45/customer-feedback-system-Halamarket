"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { QuestionCard } from "@/components/survey/question-card";
import {
  DEPARTMENTS,
  RATING_EMOJIS,
  type Language,
  type Department,
} from "@/lib/feedback-data";
import { cn } from "@/lib/utils";

type Step = "welcome" | "questions" | "comment" | "success";

export default function SurveyPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <SurveyContent />
    </Suspense>
  );
}

function SurveyContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const deptParam = searchParams.get("dept");

  const [lang, setLang] = useState<Language>("ar");
  const [step, setStep] = useState<Step>("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [comment, setComment] = useState("");

  const department: Department | undefined =
    DEPARTMENTS.find((d) => d.id === deptParam) ?? DEPARTMENTS[0];

  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  const rawAnswer = department
    ? answers[department.questions[currentQuestion]?.id]
    : 0;
  const currentRating =
    typeof rawAnswer === "object" && rawAnswer !== null
      ? (rawAnswer as any).rating
      : rawAnswer;
  const ratingEmoji = RATING_EMOJIS.find((r) => r.score === currentRating);

  const resetToWelcome = () => {
    setStep("welcome");
    setCurrentQuestion(0);
    setAnswers({});
    setComment("");
    setIsSubmitting(false);
  };

  function handleAnswer(questionId: string, value: any) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  // دالة جديدة تسمح بإلغاء الاختيار عند الضغط مرتين
  function handleRatingToggle(questionId: string, rating: number) {
    // إذا كان التقييم المختار حالياً هو نفسه الذي ضغطت عليه، نجعله 0 (إلغاء)
    if (currentRating === rating) {
      handleAnswer(questionId, 0);
    } else {
      // إذا كان مختلفاً، نحدث القيمة بشكل طبيعي
      handleAnswer(questionId, rating);
    }
  }

  function handleNext() {
    if (!department) return;
    if (answers[department.questions[currentQuestion].id] === undefined) return;
    if (currentQuestion < department.questions.length - 1) {
      setCurrentQuestion((p) => p + 1);
    } else {
      setStep("comment");
    }
  }

  function handleBack() {
    if (step === "questions") {
      if (currentQuestion > 0) {
        setCurrentQuestion((p) => p - 1);
      } else {
        setStep("welcome");
      }
    } else if (step === "comment") {
      setStep("questions");
    }
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const scores = Object.values(answers).map((ans: any) => {
        if (typeof ans === "object" && ans !== null) return ans.rating;
        return typeof ans === "number" ? ans : 0;
      });
      const averageRating = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: department?.id,
          departmentName:
            lang === "ar" ? department?.nameAr : department?.nameEn,
          overallRating: averageRating,
          comment: comment,
          answers: answers,
        }),
      });
      if (response.ok) setStep("success");
      else throw new Error("Failed to submit");
    } catch (error) {
      setIsSubmitting(false);
      alert(
        isRtl ? "عذراً، حدث خطأ أثناء الإرسال." : "Error submitting feedback.",
      );
    }
  }

  return (
    /* 1. استخدام dvh لضمان المقاس الصحيح على الجوال ومنع السكرول نهائياً */
    <div
      className="min-h-dvh w-full bg-background flex flex-col overflow-y-auto relative pb-6"
      dir={dir}
    >
      {/* Header - تقليل البادينج */}
      <header
        className="w-full flex items-center justify-between px-6 py-3 z-60 sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50"
        dir="ltr"
      >
        <div className="flex items-center gap-1 bg-secondary rounded-full p-1 shadow-sm border border-border/50">
          {(["ar", "en"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300",
                lang === l
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l === "ar" ? "عربي" : "EN"}
            </button>
          ))}
        </div>
      </header>

      {/* Progress Bar - تقليل المسافات */}
      {step !== "welcome" && step !== "success" && department && (
        <div className="w-full max-w-lg mx-auto px-6 py-1 flex items-center justify-center gap-1.5 z-50">
          {department.questions.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-gray-200/60 rounded-full overflow-hidden relative"
            >
              <motion.div
                className="absolute inset-0 bg-primary rounded-full"
                initial={{ width: index < currentQuestion ? "100%" : "0%" }}
                animate={{ width: index <= currentQuestion ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 2. Main Container: تم ضغط المسافات (py-2) وتثبيت العناصر */}
      <main className="flex-1 flex flex-col items-center justify-between px-4 py-2 max-w-lg mx-auto w-full relative">
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center gap-6"
            >
              <div className="relative w-52 h-24">
                <Image
                  src="/E33.png"
                  alt="Hala Markets"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-extrabold text-foreground">
                  {isRtl ? "أهلاً وسهلاً بك" : "Welcome!"}
                </h1>
                <p className="text-muted-foreground text-sm max-w-60 mx-auto italic">
                  {isRtl
                    ? "نسعد بخدمتكم دائماً في أسواق هلا"
                    : "We are happy to serve you at Hala Markets"}
                </p>
              </div>
              <button
                onClick={() => {
                  setStep("questions");
                  setCurrentQuestion(0);
                  setAnswers({});
                }}
                className="w-full max-w-60 bg-primary text-primary-foreground rounded-2xl h-14 font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
              >
                {isRtl ? (
                  <>
                    <span>ابدأ التقييم</span>
                    <ArrowLeft />
                  </>
                ) : (
                  <>
                    <span>Start Survey</span>
                    <ArrowRight />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {step === "questions" && department && (
            <motion.div
              key={`q-${currentQuestion}`}
              initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 30 : -30 }}
              layout // إضافة layout لضمان انسيابية حركة العناصر عند ظهور الإيموجي فوقها
              className="w-full h-full flex flex-col items-center px-4"
            >
              {/* 1. حاوية الإيموجي "الشبح" (فوق السؤال) */}
              <motion.div
                layout
                className={cn(
                  "w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ease-in-out",
                  currentRating > 0
                    ? "h-32 opacity-100 mt-2"
                    : "h-0 opacity-0 mt-0",
                )}
              >
                <AnimatePresence mode="wait">
                  {currentRating > 0 && ratingEmoji && (
                    <motion.div
                      key={ratingEmoji.score}
                      initial={{ scale: 0.5, opacity: 0, y: -10 }}
                      animate={{ scale: 1.1, opacity: 1, y: 0 }} // تكبير بسيط عند الظهور ليعطي حياة
                      transition={{
                        type: "spring",
                        stiffness: 260, // زيادة الصلابة لسرعة الاستجابة
                        damping: 20, // زيادة التخميد لجعل الحركة تستقر بنعومة دون اهتزاز زائد
                        mass: 1, // وزن طبيعي للعنصر
                      }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-6xl mb-2">{ratingEmoji.emoji}</span>
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full bg-secondary"
                        style={{ color: ratingEmoji.color }}
                      >
                        {isRtl ? ratingEmoji.label : ratingEmoji.labelEn}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* 2. قسم السؤال (ينزلق للأسفل عند ظهور الإيموجي) */}
              <motion.div
                layout
                className="w-full flex flex-col items-center gap-1 pt-4"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-primary font-bold opacity-80 mb-1">
                    <span>{department.emoji}</span>
                    <span className="text-[10px] uppercase tracking-widest">
                      {isRtl ? department.nameAr : department.nameEn}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-foreground leading-tight text-center w-full">
                    {department.questions[currentQuestion][isRtl ? "ar" : "en"]}
                  </h2>
                </div>
              </motion.div>

              {/* 3. النجوم */}
              <motion.div
                layout
                className="w-full flex-1 flex items-start justify-center pt-6"
              >
                <QuestionCard
                  question={department.questions[currentQuestion]}
                  questionIndex={currentQuestion}
                  totalQuestions={department.questions.length}
                  value={answers[department.questions[currentQuestion].id] ?? 0}
                  onChange={(v) =>
                    handleRatingToggle(
                      department.questions[currentQuestion].id,
                      v,
                    )
                  }
                  language={lang}
                  minimal
                />
              </motion.div>

              {/* 4. الأزرار في الأسفل - توزيع يمين ويسار بتصميم شفاف */}
              {/* حاوية الأزرار: تضمن توزيع الأزرار يميناً ويساراً وتوحيد الهوية البصرية */}
              <motion.div
                layout
                className="w-full flex flex-row items-center justify-between gap-4 pb-8 px-2"
              >
                {/* زر السابق: تم توحيد الحجم وتعديل ترتيب السهم بناءً على اللغة */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  // التنسيق: جعلنا العرض متناسباً مع المحتوى مع ضمان نفس مساحة الضغط
                  className="flex items-center justify-center gap-2 w-32 py-2 text-primary hover:opacity-80 transition-all duration-300 font-bold text-sm bg-transparent border-none outline-none"
                >
                  {isRtl ? (
                    /* ترتيب العربي: السهم يميناً (قبل الكلمة) ثم النص */
                    <>
                      <ArrowRight className="w-5 h-5" />
                      <span>السابق</span>
                    </>
                  ) : (
                    /* ترتيب الإنجليزي: السهم يساراً ثم النص */
                    <>
                      <ArrowLeft className="w-5 h-5" />
                      <span>Back</span>
                    </>
                  )}
                </motion.button>

                {/* زر التالي: يطابق حجم زر السابق ويتغير لونه عند تفعيل الإجابة */}
                <motion.button
                  whileTap={
                    answers[department.questions[currentQuestion].id]
                      ? { scale: 0.95 }
                      : {}
                  }
                  onClick={handleNext}
                  disabled={!answers[department.questions[currentQuestion].id]}
                  className={cn(
                    "flex items-center justify-center gap-2 w-32 py-2 font-black text-sm transition-all duration-500 bg-transparent border-none outline-none",
                    // التغيير البصري: يضيء الزر عند اختيار إجابة
                    "text-primary",
                    answers[department.questions[currentQuestion].id]
                      ? "opacity-100 cursor-pointer"
                      : "opacity-30 cursor-not-allowed",
                  )}
                >
                  {isRtl ? (
                    /* ترتيب العربي: النص ثم السهم يساراً (بعد الكلمة) */
                    <>
                      <span>التالي</span>
                      <ArrowLeft className="w-5 h-5" />
                    </>
                  ) : (
                    /* ترتيب الإنجليزي: النص ثم السهم يميناً */
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Comment Step */}
          {step === "comment" && (
            <motion.div
              key="comment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col items-center justify-between pb-4"
            >
              <div className="w-full flex flex-col gap-4 pt-4 text-center">
                <h2 className="text-xl font-black">
                  {isRtl ? "هل تريد إضافة تعليق؟" : "Any comments?"}
                </h2>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-card border border-border rounded-2xl p-4 h-32 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder={
                    isRtl ? "اكتب ملاحظاتك هنا..." : "Your feedback here..."
                  }
                />
              </div>
              <div className="w-full flex flex-col-reverse items-center gap-1">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-black shadow-lg"
                >
                  {isSubmitting
                    ? "جاري الإرسال..."
                    : isRtl
                      ? "إرسال التقييم"
                      : "Submit Feedback"}
                </button>
                <button
                  onClick={handleBack}
                  className="py-2 text-muted-foreground text-xs font-bold"
                >
                  {isRtl ? "رجوع للأسئلة" : "Back to questions"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col items-center justify-center gap-8 py-10 text-center"
            >
              <div
                onClick={resetToWelcome}
                className="relative w-52 h-24 cursor-pointer"
              >
                <Image
                  src="/E33.png"
                  alt="Hala Markets"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <div className="space-y-4 px-6">
                <h2 className="text-3xl font-extrabold text-foreground flex items-center justify-center gap-2">
                  {isRtl ? "شكراً لك!" : "Thank you!"}
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="inline-block"
                  >
                    🎉
                  </motion.span>
                </h2>
                <p className="text-muted-foreground text-base max-w-60 mx-auto italic leading-relaxed">
                  {isRtl
                    ? "تم إرسال تقييمك بنجاح. نسعد دائماً بزيارتك لأسواق هلا ورأيك محل اهتمامنا."
                    : "Your feedback has been submitted successfully."}
                </p>
                <button
                  onClick={resetToWelcome}
                  className="text-primary font-black text-sm hover:underline underline-offset-8 mt-4"
                >
                  {isRtl ? "إرسال تقييم لقسم آخر" : "Rate another department"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
