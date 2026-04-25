'use client'

import { useState, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, ExternalLink, Copy, Check } from 'lucide-react'
import { DEPARTMENTS, type Department } from '@/lib/feedback-data'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

function getBaseUrl() {
  // 1. إذا كان الموقع شغال في المتصفح، يأخذ الرابط الحالي
  if (typeof window !== 'undefined') return window.location.origin;

  // 2. إذا كان يتم بناؤه على السيرفر، يأخذ رابط الفيرسل أو الرابط الافتراضي
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  return 'http://localhost:3000'; // الرابط الاحتياطي
}

function getSurveyUrl(deptId: string) {
  return `${getBaseUrl()}/s?dept=${deptId}`
}

interface QRCardProps {
  department: Department
}

function QRCard({ department }: QRCardProps) {
  const [copied, setCopied] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const surveyUrl = getSurveyUrl(department.id)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(surveyUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [surveyUrl])

  const handleDownload = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const img = new window.Image()
    const size = 400
    canvas.width = size
    canvas.height = size
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      const a = document.createElement('a')
      a.download = `qr-${department.id}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }, [department.id])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{department.emoji}</span>
          <div>
            <h3 className="font-bold text-foreground text-sm">{department.nameAr}</h3>
            <p className="text-xs text-muted-foreground">{department.nameEn}</p>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex items-center justify-center py-5 px-4">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-border">
          <QRCodeSVG
            ref={svgRef}
            value={surveyUrl}
            size={160}
            level="M"
            includeMargin={false}
            fgColor="#1a2e1a"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        {/* Preview link */}
        <a
          href={surveyUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full border border-border rounded-xl py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          معاينة الاستبيان
        </a>

        <div className="flex gap-2">
          {/* Copy URL */}
          <button
            onClick={handleCopy}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all',
              copied
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
            )}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'تم النسخ' : 'نسخ الرابط'}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-xl py-2 text-xs font-semibold hover:bg-primary/90 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            تنزيل
          </button>
        </div>

        {/* URL preview */}
        <p className="text-[10px] text-muted-foreground truncate text-center mt-1" dir="ltr">
          {surveyUrl}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function QRsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-foreground">إدارة رموز QR</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          تحميل وطباعة رموز QR الخاصة بالأقسام
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="font-semibold text-foreground text-sm">كيفية الاستخدام</p>
          <p className="text-xs text-muted-foreground mt-1">
            قم بتحميل رمز QR الخاص بكل قسم وضعه بالقرب من المنتجات. عند مسح الرمز، سيتم توجيه العميل مباشرة لأسئلة تقييم ذلك القسم.
          </p>
        </div>
      </div>

      {/* QR Cards Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {DEPARTMENTS.map((dept) => (
          <QRCard key={dept.id} department={dept} />
        ))}
      </motion.div>
    </div>
  )
}
