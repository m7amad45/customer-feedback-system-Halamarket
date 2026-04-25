'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { StarRating } from './star-rating'
import { Question } from '@/lib/feedback-data'
import {
  Leaf, Star, User, SparklesIcon as Sparkles, CheckCircle2, Tag, Zap,
  ListOrdered, Calendar, Thermometer, Wind,
} from 'lucide-react'

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
}

interface QuestionCardProps {
  question: Question
  questionIndex: number
  totalQuestions: number
  value: number
  onChange: (value: number) => void
  language?: 'ar' | 'en'
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  value,
  onChange,
  language = 'ar',
}: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: language === 'ar' ? -40 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: language === 'ar' ? 40 : -40 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col gap-5"
      >
        {/* Question header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {ICON_MAP[question.icon] ?? <Star className="w-5 h-5" />}
          </div>
          <div className="flex-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <p className="text-xs text-muted-foreground mb-1">
              {language === 'ar'
                ? `السؤال ${questionIndex + 1} من ${totalQuestions}`
                : `Question ${questionIndex + 1} of ${totalQuestions}`}
            </p>
            <p className="font-semibold text-foreground leading-relaxed text-sm md:text-base">
              {language === 'ar' ? question.ar : question.en}
            </p>
          </div>
        </div>

        {/* Rating */}
        <StarRating value={value} onChange={onChange} language={language} />
      </motion.div>
    </AnimatePresence>
  )
}
