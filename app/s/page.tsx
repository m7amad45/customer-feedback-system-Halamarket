"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";
import { QuestionCard } from "@/components/survey/question-card";
import {
  DEPARTMENTS,
  BRANCHES,
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
  const branchParam = searchParams.get("branch") ?? "jeddah";

  // 🆕 السطر الذكي: يبحث في المصفوفة عن الفرع المطابق للـ ID الممرر في الرابط
  const currentBranch =
    BRANCHES.find((b) => b.id === branchParam) ?? BRANCHES[0]; // 👈 سطر جديد: لقط الفرع وإذا لم يجد فرع بالرابط يضع "jeddah" كافتراضي

  const [lang, setLang] = useState<Language>("ar");
  const [step, setStep] = useState<Step>("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

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

    // 1. 🆕 حساب متوسط التقييم الحالي لمعرفة حالة العميل
    const scores = Object.values(answers).map((ans: any) => {
      if (typeof ans === "object" && ans !== null) return ans.rating;
      return typeof ans === "number" ? ans : 0;
    });
    const averageRating = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // هل العميل غير راضٍ؟ (تقييمه الحقيقي نزل لـ 2 أو أقل)
    const isCustomerAngry = averageRating > 0 && averageRating <= 2;
    const isPhoneValid = /^05\d{8}$/.test(customerPhone.trim());
    // 2. 🚨 قفل الأمان الصارم: منع الإرسال لو العميل زعلان ولم يكتب بيانات التواصل
    if (isCustomerAngry && (!customerName.trim() || !customerPhone.trim())) {
      alert(
        isRtl
          ? "لأن تقييمك محل اهتمامنا، يرجى كتابة الاسم ورقم الجوال لنتمكن من التواصل معك ومعالجة المشكلة فوراً."
          : "Please provide your name and phone number so we can reach out and make it right.",
      );
      return; // يوقف الفنكشن هنا تماماً ويمنع الـ fetch للـ API
    }
    if (customerPhone.trim() && !isPhoneValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: branchParam,
          departmentId: department?.id,
          departmentName:
            lang === "ar" ? department?.nameAr : department?.nameEn,
          overallRating: averageRating,
          comment: comment,
          answers: answers,
          // 3. 🆕 إرسال الاسم ورقم الهاتف الملقوطين من الواجهة إلى الـ API
          customerName: customerName,
          customerPhone: customerPhone,
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
      className="min-h-dvh w-full bg-survey-bg flex flex-col overflow-y-auto relative pb-6"
      dir={dir}
    >
      {/* Header - تقليل البادينج */}
      <header
        className="w-full flex items-center justify-between px-6 py-3 z-60 sticky top-0 bg-survey-bg"
        dir="ltr"
      >
        <div className="flex items-center gap-1 bg-secondary-foreground rounded-full p-1 shadow-sm">
          {(["ar", "en"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300",
                lang === l
                  ? "bg-survey-accent-2 text-primary-foreground shadow-md"
                  : "text-muted hover:text-muted-foreground",
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
              className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden relative"
            >
              <motion.div
                className="absolute inset-0 bg-survey-accent-1 rounded-full shadow-[0_0_8px_rgba(192,213,108,0.5)]"
                initial={{ width: index < currentQuestion ? "100%" : "0%" }}
                animate={{ width: index <= currentQuestion ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 2. Main Container: تم ضغط المسافات (py-2) وتثبيت العناصر */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto w-full relative min-h-0">
        {" "}
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex-1 flex flex-col items-center justify-center gap-8 min-h-[70dvh]"
            >
              <div className="relative w-64 h-36">
                <Image
                  src="/lo25.png"
                  alt="Hala Markets"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              {/* العبارة الترحيبية الديناميكية الموحدة بالمسطرة تتبع ملف الـ Data */}
              <div className="text-center px-4 max-w-sm mx-auto">
                <h1 className="text-2xl font-black text-white leading-relaxed">
                  {isRtl ? (
                    <>
                      مرحباً بك في{" "}
                      <span className="text-survey-accent-1 font-black">
                        {department?.nameAr} - {currentBranch?.nameAr}
                      </span>
                    </>
                  ) : (
                    <>
                      Welcome to{" "}
                      <span className="text-survey-accent-1 font-black">
                        {department?.nameEn} Dept - {currentBranch?.nameEn}{" "}
                      </span>
                    </>
                  )}
                </h1>

                {/* رسالة فرعية ناعمة تحتها */}
                <p className="text-white/70 text-xs italic mt-3">
                  {isRtl
                    ? "يسعدنا أن تشاركنا رأيك السريع لمساعدتنا في تقديم الأفضل لك دائماً"
                    : "Your feedback helps us improve your experience"}
                </p>
              </div>
              {/* زر ابدأ التقييم: حدود برتقالية نارية ونص أبيض ناصع عالي التباين */}
              {/* زر ابدأ التقييم: تصميم مربع ملموم باللون البرتقالي الكامل يطابق نمط الصورة */}
              <button
                onClick={() => {
                  setStep("questions");
                  setCurrentQuestion(0);
                  setAnswers({});
                }}
                // التنسيق: عرض ملموم (w-56)، خلفية برتقالية كاملة، حواف دائرية متوسطة، ونص أبيض فخم
                className="w-38 h-10 bg-survey-accent-1 hover:bg-[#d4490c] text-white rounded-none font-bold text-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all duration-200"
              >
                {isRtl ? (
                  <>
                    <span>ابدأ التقييم</span>
                    {/* السهم يلتفت لليسار في العربي ليقود المستخدم للخطوة التالية */}
                    <ArrowLeft className="w-4 h-4 text-white/90" />
                  </>
                ) : (
                  <>
                    <span>Get started</span>
                    {/* السهم يلتفت لليمن في الإنجليزي ليتماشى مع اتجاه القراءة */}
                    <ArrowRight className="w-4 h-4 text-white/90" />
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
                    ? "h-36 opacity-100 mt-4"
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
                      <div className="relative w-24 h-24 mb-2">
                        <Image
                          src={ratingEmoji.image}
                          alt={isRtl ? ratingEmoji.label : ratingEmoji.labelEn}
                          fill
                          className="object-contain"
                          priority // هذه الخاصية تجعل الصورة تظهر فوراً عند التحميل
                          quality={100} // لضمان جودة الصورة بدون ضغط زائد يؤخر المعالجة
                        />
                      </div>

                      <span
                        className="text-xs font-black px-4 py-1.5 rounded-full text-white leading-none flex items-center justify-center min-h-fit"
                        style={{
                          backgroundColor: `${ratingEmoji.color}80`, // الخلفية تصبغ باللون كامل بدون شفافية
                        }}
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
                <div className="text-center space-y-2">
                  {/* تاق القسم بلون فستقي ليموني منور */}
                  <div className="flex items-center justify-center gap-2 text-survey-accent-1 font-bold text-sm">
                    <span>{department.emoji}</span>
                    <span className="uppercase tracking-wider">
                      {isRtl ? department.nameAr : department.nameEn}
                    </span>
                  </div>

                  {/* نص السؤال باللون الأبيض الناصع عالي التباين */}
                  <h2 className="text-2xl font-black text-white leading-snug text-center max-w-sm mx-auto">
                    {department.questions[currentQuestion][isRtl ? "ar" : "en"]}
                  </h2>
                </div>
              </motion.div>

              {/* 3. النجوم */}
              <motion.div
                layout
                className="w-full flex-1 flex items-start justify-center pt-6 pb-6"
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
                  className="flex items-center justify-center gap-2 w-32 py-2 text-white hover:opacity-80 transition-all duration-300 font-bold text-sm bg-transparent border-none outline-none"
                >
                  {isRtl ? (
                    /* ترتيب العربي: السهم يميناً (قبل الكلمة) ثم النص */
                    <>
                      <ArrowRight className="w-5 h-5 text-survey-accent-1" />
                      <span>السابق</span>
                    </>
                  ) : (
                    /* ترتيب الإنجليزي: السهم يساراً ثم النص */
                    <>
                      <ArrowLeft className="w-5 h-5 text-survey-accent-1" />
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
                    "flex items-center justify-center gap-2 w-32 py-2 text-white hover:opacity-80 transition-all duration-300 font-bold text-sm bg-transparent border-none outline-none", // التغيير البصري: يضيء الزر عند اختيار إجابة
                    answers[department.questions[currentQuestion].id]
                      ? "opacity-100 cursor-pointer"
                      : "opacity-30 cursor-not-allowed",
                  )}
                >
                  {isRtl ? (
                    /* ترتيب العربي: النص ثم السهم يساراً (بعد الكلمة) */
                    <>
                      <span>التالي</span>
                      <ArrowLeft className="w-5 h-5 text-survey-accent-1" />
                    </>
                  ) : (
                    /* ترتيب الإنجليزي: النص ثم السهم يميناً */
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-5 h-5 text-survey-accent-1" />
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
              <div className="w-full flex flex-col gap-4 pt-4">
                {/* 1. حساب حالة العميل بشكل حي لمعرفة التنسيق المطلوب */}
                {(() => {
                  const scores = Object.values(answers).map((ans: any) => {
                    if (typeof ans === "object" && ans !== null)
                      return ans.rating;
                    return typeof ans === "number" ? ans : 0;
                  });
                  const averageRating = scores.length
                    ? Math.round(
                        scores.reduce((a, b) => a + b, 0) / scores.length,
                      )
                    : 0;
                  const isCustomerAngry =
                    averageRating > 0 && averageRating <= 2;

                  return (
                    <>
                      {/* عنوان الشاشة الذكي: يتغير حسب نفسية العميل (راضي أو زعلان) */}
                      <h2 className="text-xl font-black text-center text-white">
                        {isCustomerAngry
                          ? isRtl
                            ? "نعتذر منك ونريد سماعك!"
                            : "We apologize and want to make it right!"
                          : isRtl
                            ? "هل تريد إضافة تعليق؟"
                            : "Any comments?"}
                      </h2>

                      {/* 🆕 2. خانات بيانات العميل الجديدة (الاسم والرقْم) */}
                      <div className="grid grid-cols-1 gap-3 w-full text-right mt-2">
                        {/* حقل الاسم الكامل */}
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-white">
                            {isRtl ? "الاسم الكامل" : "Full Name"}

                            {/* لو زعلان تظهر عبارة إجباري ومعها النجمة بنفس شكلها الأصلي، ولو راضي تظهر اختياري فقط */}
                            {isCustomerAngry ? (
                              <>
                                <span className="text-destructive font-light text-lg leading-none mr-1">
                                  *
                                </span>
                                <span className="text-destructive mr-1 text-[10px] font-black">
                                  (إجباري لمتابعة الشكوى)
                                </span>
                              </>
                            ) : (
                              <span className="text-muted/80 mr-1 text-[10px] font-normal">
                                (اختياري)
                              </span>
                            )}
                          </span>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder={
                              isRtl ? "اكتب اسمك هنا..." : "Your name..."
                            }
                            className={cn(
                              "w-full bg-card border rounded-sm p-3 text-sm focus:outline-none transition-all",
                              isCustomerAngry
                                ? "bg-background border-border focus:ring-2 focus:ring-survey-accent-1"
                                : "bg-background border-border focus:ring-2 focus:ring-survey-accent-1",
                            )}
                          />
                        </div>

                        {/* حقل رقم الجوال */}
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-white">
                            {isRtl ? "رقم الجوال" : "Phone Number"}

                            {isCustomerAngry ? (
                              <>
                                <span className="text-destructive font-light text-lg leading-none mr-1">
                                  *
                                </span>
                                <span className="text-destructive mr-1 text-[10px] font-black">
                                  (إجباري لمتابعة الشكوى)
                                </span>
                              </>
                            ) : (
                              <span className="text-muted/80 mr-1 text-[10px] font-normal">
                                (اختياري)
                              </span>
                            )}
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={customerPhone}
                            onChange={(e) =>
                              setCustomerPhone(
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            placeholder={isRtl ? "05xxxxxxxx" : "05xxxxxxxx"}
                            className={cn(
                              "w-full bg-card border rounded-sm p-3 text-sm focus:outline-none transition-all text-right",
                              isCustomerAngry
                                ? "bg-background border-border focus:ring-2 focus:ring-survey-accent-1"
                                : "bg-background border-border focus:ring-2 focus:ring-survey-accent-1",
                            )}
                          />
                          {customerPhone.length > 0 &&
                            (!customerPhone.startsWith("05") ||
                              customerPhone.length < 10) && (
                              <span className="text-muted/80 text-[10px] font-bold mt-0.5 px-1">
                                {isRtl
                                  ? "⚠️ يجب أن يبدأ الرقم بـ 05 ويتكون من 10 أرقام بالكامل"
                                  : "⚠️ Must start with 05 and be exactly 10 digits"}
                              </span>
                            )}
                        </div>
                      </div>

                      {/* 3. حقل الملاحظات والتعليقات الأصلي ملموم ومنسق */}
                      <div className="flex flex-col gap-1 text-right">
                        <span className="text-xs font-bold text-white ">
                          {isRtl ? "ملاحظات إضافية" : "Additional Comments"}
                          <span className="text-muted/80 text-[10px] font-normal mr-1">
                            (اختياري)
                          </span>
                        </span>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full bg-background border border-border rounded-sm p-4 h-24 focus:ring-2 focus:ring-survey-accent-1 focus:outline-none text-sm resize-none"
                          placeholder={
                            isRtl
                              ? "اكتب ملاحظاتك هنا..."
                              : "Your feedback here..."
                          }
                        />
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* الأزرار التحتية الأصلية للإرسال والرجوع */}
              <div className="w-full flex flex-col-reverse items-center gap-1 mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-10 bg-survey-accent-1 hover:bg-[#e6540e] text-white rounded-ss-none font-bold text-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all duration-200"
                >
                  {isSubmitting
                    ? "جاري الإرسال..."
                    : isRtl
                      ? "إرسال التقييم"
                      : "Submit Feedback"}
                </button>
                <button
                  onClick={handleBack}
                  className="py-2 text-muted text-xs font-bold"
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
                className="relative w-64 h-36 cursor-pointer"
              >
                <Image
                  src="/lo25.png"
                  alt="Hala Markets"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <div className="space-y-4 px-6">
                <h2 className="text-3xl font-extrabold text-survey-accent-1  flex items-center justify-center gap-2">
                  {isRtl ? "شكراً لك!" : "Thank you!"}
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="inline-block"
                  >
                    🎉
                  </motion.span>
                </h2>
                <p className="text-muted text-base max-w-60 mx-auto leading-relaxed">
                  {isRtl
                    ? "تم إرسال تقييمك بنجاح. نسعد دائماً بزيارتك لأسواق هلا ورأيك محل اهتمامنا."
                    : "Your feedback has been submitted successfully."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
