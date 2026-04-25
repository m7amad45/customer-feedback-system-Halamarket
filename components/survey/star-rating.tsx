'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  onHoverChange?: (value: number) => void
  language?: 'ar' | 'en'
}

export function StarRating({ value, onChange, onHoverChange, language = 'ar' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const isRtl = language === 'ar'

  return (
    <div className="flex flex-col items-center gap-4">
      {/* حاوية النجوم فقط */}
      <div
        className={cn(
          "flex gap-2",
          isRtl ? "flex-row-reverse" : "flex-row"
        )}
        dir="ltr"
onMouseLeave={() => { setHovered(0); onHoverChange?.(0); }}      >
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.15 }}
onMouseEnter={() => { setHovered(star); onHoverChange?.(star); }}            onClick={() => onChange(star)}
            className="focus:outline-none"
            aria-label={`${star} star`}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill={star <= (hovered || value) ? '#f59e0b' : 'none'}
              stroke={star <= (hovered || value) ? '#f59e0b' : '#d1d5db'}
              strokeWidth="1.5"
              className={cn('transition-all duration-150')}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </motion.button>
        ))}
      </div>

      {/* تم حذف كود Slider track visual من هنا بالكامل */}
    </div>
  )
}