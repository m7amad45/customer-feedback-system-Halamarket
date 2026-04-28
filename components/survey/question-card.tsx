"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarRating } from "./star-rating";
import { Question } from "@/lib/feedback-data";
import { cn } from "@/lib/utils";
import {
  Leaf,
  Star,
  User,
  SparklesIcon as Sparkles,
  CheckCircle2,
  Tag,
  Zap,
  ListOrdered,
  Calendar,
  Thermometer,
  Wind,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  bread: <Star className="w-5 h-5" />,
  leaf: <Leaf className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  user: <User className="w-5 h-5" />,
  sparkles: <Sparkles className="w-5 h-5" />,
  check: <CheckCircle2 className="w-5 h-5" />,
  tag: <Tag className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  list: <ListOrdered className="w-5 h-5" />,
  calendar: <Calendar className="w-5 h-5" />,
  thermometer: <Thermometer className="w-5 h-5" />,
  wind: <Wind className="w-5 h-5" />,
};

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  value: any; // غيّرناها لتقبل object أو number
  onChange: (payload: any) => void;
  language?: "ar" | "en";
  minimal?: boolean; //
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  value,
  onChange,
  language = "ar",
  minimal = false, // استلم الخاصية هنا وضع قيمتها الافتراضية false
}: QuestionCardProps) {
  // استخراج التقييم الفعلي سواء كان القيمة رقماً أو كائناً
  const ratingValue = typeof value === "object" ? value.rating : value;
  const [selectedReasons, setSelectedReasons] = useState<string[]>(
    value?.reasons || [],
  );
  const [otherText, setOtherText] = useState(value?.other || "");

  // تصقير الـ State عند الانتقال لسؤال جديد
  useEffect(() => {
    setSelectedReasons(value?.reasons || []);
    setOtherText(value?.other || "");
  }, [question.id]);

  const handleRatingChange = (newRating: number) => {
    if (newRating > 2) {
      // إذا التقييم عالي، نرسل الرقم فقط ونمسح الأسباب
      setSelectedReasons([]);
      setOtherText("");
      onChange(newRating);
    } else {
      // إذا التقييم منخفض، نرسل كائن يحتوي الأسباب الحالية
      onChange({
        rating: newRating,
        reasons: selectedReasons,
        other: otherText,
      });
    }
  };

  const toggleReason = (reason: string) => {
    const newReasons = selectedReasons.includes(reason)
      ? selectedReasons.filter((r) => r !== reason)
      : [...selectedReasons, reason];
    setSelectedReasons(newReasons);
    onChange({ rating: ratingValue, reasons: newReasons, other: otherText });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        // تعديل الـ className ليتأثر بخاصية minimal
        className={cn(
          "flex flex-col gap-5 transition-all duration-300",
          minimal
            ? "bg-transparent border-none p-0 shadow-none items-center" // التنسيق الجديد بدون كارد
            : "bg-card rounded-2xl shadow-sm border border-border p-6", // التنسيق القديم بالكارد
        )}
      >
        {/* إذا كان minimal مفعل، قد ترغب في إخفاء الهيدر لأنه موجود بالفعل في الصفحة الرئيسية */}
        {!minimal && (
          <div className="flex items-start gap-3">
            {/* ... كود الهيدر القديم ... */}
          </div>
        )}

        {/* Rating */}
        <StarRating
          value={ratingValue}
          onChange={handleRatingChange}
          language={language}
        />

        {/* ─── Low Rating Options (The New Part) ─── */}
        <AnimatePresence>
          {ratingValue > 0 && ratingValue <= 2 && question.lowRatingOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-dashed border-border"
            >
              <p className="text-xs font-bold text-destructive mb-3 text-center">
                {language === "ar"
                  ? "يؤسفنا ذلك، ما هي المشكلة؟"
                  : "What went wrong?"}
              </p>

              <div className="flex flex-wrap gap-2 justify-center">
                {question.lowRatingOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleReason(option)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all border",
                      selectedReasons.includes(option)
                        ? "bg-destructive text-white border-destructive shadow-sm"
                        : "bg-secondary/50 text-muted-foreground border-transparent hover:border-destructive/30",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {selectedReasons.includes("أخرى") && (
                <motion.input
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  type="text"
                  placeholder={
                    language === "ar" ? "وضح لنا أكثر..." : "Tell us more..."
                  }
                  className="w-full mt-3 p-3 bg-secondary/30 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-destructive/30"
                  value={otherText}
                  onChange={(e) => {
                    setOtherText(e.target.value);
                    onChange({
                      rating: ratingValue,
                      reasons: selectedReasons,
                      other: e.target.value,
                    });
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
