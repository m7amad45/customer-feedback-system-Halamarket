'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  language?: 'ar' | 'en'
}

export function StarRating({ value, onChange, language = 'ar' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stars */}
      <div
        className="flex gap-2"
        dir="ltr"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.15 }}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
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

      {/* Slider track visual */}
      <div className="w-full max-w-[220px] relative h-1 bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-amber-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((hovered || value) / 5) * 100}%` }}
          transition={{ duration: 0.15 }}
        />
        <div className="absolute inset-0 flex justify-between px-1">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div 
              key={dot} 
              className={cn(
                'w-1.5 h-1.5 rounded-full -mt-0.5 transition-colors',
                dot <= (hovered || value) ? 'bg-amber-600' : 'bg-border'
              )} 
            />
          ))}
        </div>
      </div>
    </div>
  )
}
