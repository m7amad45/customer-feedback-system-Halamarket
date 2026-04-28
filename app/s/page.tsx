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
    /* 1. ضبط الطول الكامل ومنع السكرول الخارجي */
    <div
      className="h-screen bg-background flex flex-col overflow-hidden relative"
      dir={dir}
    >
      {/* Header */}
      <header
        className="w-full grid grid-cols-3 items-center px-6 py-4 z-10"
        dir="ltr"
      >
        <div className="flex justify-start items-center">
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
        </div>
      </header>

      {/* Progress Bar */}
      {step !== "welcome" && step !== "success" && department && (
        <div className="w-full max-w-lg mx-auto px-6 pt-2 pb-2 flex items-center justify-center gap-1.5 z-50">
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

      {/* 2. منطقة المحتوى: استخدام justify-between لدفع الأزرار للقاع */}
      <main className="flex-1 flex flex-col items-center justify-between px-4 py-2 max-w-lg mx-auto w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center gap-8 py-10"
            >
              <div className="relative w-56 h-28">
                <Image
                  src="/E33.png"
                  alt="Hala Markets"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-extrabold text-foreground">
                  {isRtl ? "أهلاً وسهلاً بك" : "Welcome!"}
                </h1>
                <p className="text-muted-foreground text-base max-w-[260px] mx-auto italic">
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
                className="w-full max-w-[280px] bg-primary text-primary-foreground rounded-2xl h-14 font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
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

          {/* Questions Step */}
          {step === "questions" && department && (
            <motion.div
              key={`q-${currentQuestion}`}
              initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 30 : -30 }}
              className="w-full h-full flex flex-col items-center justify-between"
            >
              {/* الجزء العلوي: السؤال والإيموجي */}
              <div className="w-full flex flex-col items-center gap-2">
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-primary font-bold opacity-80">
                    <span>{department.emoji}</span>
                    <span className="text-[10px] uppercase tracking-widest">
                      {isRtl ? department.nameAr : department.nameEn}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-foreground leading-tight">
                    {department.questions[currentQuestion][isRtl ? "ar" : "en"]}
                  </h2>
                </div>
                <div className="h-20 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {currentRating > 0 && ratingEmoji && (
                      <motion.div
                        key={ratingEmoji.score}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <span className="text-6xl mb-1">
                          {ratingEmoji.emoji}
                        </span>
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: ratingEmoji.color }}
                        >
                          {isRtl ? ratingEmoji.label : ratingEmoji.labelEn}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* المنتصف: النجوم والأسباب */}
              <div className="w-full flex-1 flex items-center justify-center overflow-y-auto px-1 py-2">
                <QuestionCard
                  question={department.questions[currentQuestion]}
                  questionIndex={currentQuestion}
                  totalQuestions={department.questions.length}
                  value={answers[department.questions[currentQuestion].id] ?? 0}
                  onChange={(v) =>
                    handleAnswer(department.questions[currentQuestion].id, v)
                  }
                  language={lang}
                  minimal
                />
              </div>

              {/* القاع: الأزرار */}
              <div className="w-full flex flex-col-reverse items-center gap-2 pt-2 pb-4">
                <button
                  onClick={handleNext}
                  disabled={!answers[department.questions[currentQuestion].id]}
                  className={cn(
                    "w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all",
                    answers[department.questions[currentQuestion].id]
                      ? "bg-primary text-primary-foreground shadow-primary/20"
                      : "bg-muted text-muted-foreground opacity-50",
                  )}
                >
                  {currentQuestion < department.questions.length - 1
                    ? isRtl
                      ? "التالي"
                      : "Next"
                    : isRtl
                      ? "تعليق"
                      : "Comment"}
                  {isRtl ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="py-1 text-muted-foreground hover:text-foreground text-[11px] font-bold bg-transparent border-none"
                >
                  {isRtl ? "السابق" : "Back"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Comment Step */}
          {step === "comment" && (
            <motion.div
              key="comment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-full flex flex-col items-center justify-between pb-4"
            >
              <div className="w-full flex flex-col gap-6 pt-10 text-center">
                <h2 className="text-2xl font-black">
                  {isRtl ? "هل تريد إضافة تعليق؟" : "Any comments?"}
                </h2>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-card border border-border rounded-2xl p-4 h-40 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder={
                    isRtl ? "اكتب ملاحظاتك هنا..." : "Your feedback here..."
                  }
                />
              </div>
              <div className="w-full flex flex-col-reverse items-center gap-2">
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
                  className="py-2 text-muted-foreground text-xs font-bold bg-transparent"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-full flex flex-col items-center justify-center gap-10 py-10 text-center"
            >
              <div
                onClick={resetToWelcome}
                className="relative w-64 h-32 cursor-pointer active:scale-95 transition-transform"
              >
                <Image
                  src="/E33.png"
                  alt="Hala Markets"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <div className="space-y-6 px-6">
                <h2 className="text-4xl font-extrabold text-foreground flex items-center justify-center gap-3">
                  {isRtl ? "شكراً لك!" : "Thank you!"}
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="inline-block origin-bottom"
                  >
                    🎉
                  </motion.span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-[280px] mx-auto italic">
                  {isRtl
                    ? "تم إرسال تقييمك بنجاح. نسعد دائماً بزيارتك لأسواق هلا."
                    : "Your feedback has been submitted successfully."}
                </p>
                <button
                  onClick={resetToWelcome}
                  className="text-primary font-black text-sm hover:underline underline-offset-8"
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
