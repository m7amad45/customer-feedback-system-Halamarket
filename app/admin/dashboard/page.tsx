'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'edge' // جرب إضافة هذا السطر لتهريب الصفحة من نظام الـ Build التقليدي
import { useState, useMemo, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Star, TrendingUp, BarChart3, Download, Eye, ChevronDown,
} from 'lucide-react'
import {
  DEPARTMENTS,
} from '@/lib/feedback-data'
import { cn } from '@/lib/utils'

const RATING_COLORS: Record<number, string> = {
  1: 'bg-destructive/15 text-destructive border-destructive/30',
  2: 'bg-orange-100 text-orange-700 border-orange-200',
  3: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  4: 'bg-lime-100 text-lime-700 border-lime-200',
  5: 'bg-green-100 text-green-700 border-green-200',
}

const RATING_LABELS: Record<number, string> = {
  1: 'سيئ جداً',
  2: 'سيئ',
  3: 'جيد',
  4: 'جيد جداً',
  5: 'ممتاز',
}

function RatingBadge({ rating }: { rating: number }) {
  const r = Math.round(rating)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border',
        RATING_COLORS[r] ?? 'bg-muted text-muted-foreground border-border'
      )}
    >
      <Star className="w-2.5 h-2.5 fill-current" />
      {rating.toFixed(1)} – {RATING_LABELS[r] ?? ''}
    </span>
  )
}

function StatCard({
  title, value, sub, icon: Icon, accent = false,
}: {
  title: string
  value: string | number
  sub: string
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <div className={cn('bg-card border border-border rounded-2xl p-5 flex flex-col gap-3', accent && 'border-primary/30 bg-primary/5')}>
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', accent ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground')}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
      <p className="text-xs font-semibold text-foreground/70">{title}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 1. جلب البيانات من الداتابيز
  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        const res = await fetch('/api/feedback')
        const data = await res.json()
        setFeedbacks(data)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeedbacks()
  }, [])

  // 2. تصفية البيانات حسب القسم
  const filtered = useMemo(() => {
    return selectedDept === 'all'
      ? feedbacks
      : feedbacks.filter((f) => f.departmentId === selectedDept)
  }, [selectedDept, feedbacks])

  // 3. حساب الإحصائيات
  const totalFeedbacks = filtered.length
  const avgRating = filtered.length
    ? (filtered.reduce((s, f) => s + f.overallRating, 0) / filtered.length).toFixed(1)
    : '0.0'

  const deptStats = useMemo(() => {
    const stats: any = {}
    feedbacks.forEach(f => {
      if (!stats[f.departmentId]) {
        stats[f.departmentId] = { id: f.departmentId, nameAr: f.departmentName, sum: 0, count: 0 }
      }
      stats[f.departmentId].sum += f.overallRating
      stats[f.departmentId].count += 1
    })
    return Object.values(stats)
      .map((s: any) => ({
        department: DEPARTMENTS.find(d => d.id === s.id) || { nameAr: s.nameAr, emoji: '📍', id: s.id },
        avg: (s.sum / s.count).toFixed(1),
        count: s.count
      }))
      .sort((a, b) => Number(b.avg) - Number(a.avg))
  }, [feedbacks])

  const topDept = deptStats[0]
  const activeDepts = deptStats.length

  // بيانات الرسم البياني (بشكل مبسط للأيام الأخيرة)
  const chartData = useMemo(() => {
    if (!Array.isArray(feedbacks) || feedbacks.length === 0) return [];

    const days: Record<string, { sum: number; count: number }> = {};

    // 1. تجميع البيانات حسب التاريخ
    feedbacks.forEach(f => {
      if (!f.createdAt) return;
      // تحويل التاريخ لصيغة (يوم/شهر)
      const date = new Date(f.createdAt).toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      if (!days[date]) {
        days[date] = { sum: 0, count: 0 };
      }
      days[date].sum += (f.overallRating || 0);
      days[date].count += 1;
    });

    // 2. تحويل البيانات لشكل يفهمه الشارت وترتيبها زمنياً
    return Object.keys(days)
      .map(date => ({
        date,
        rating: Number((days[date].sum / days[date].count).toFixed(1))
      }))
      .reverse(); // عكس القائمة ليكون الترتيب من الأقدم للأحدث (يسار لليمين)
  }, [feedbacks]);

  function exportCSV() {
    const headers = ['القسم', 'التقييم', 'التعليق', 'التاريخ']
    const rows = filtered.map((f) => [
      f.departmentName,
      f.overallRating,
      `"${f.comment || ''}"`,
      new Date(f.createdAt).toLocaleDateString('ar-SA'),
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'feedback-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) return <div className="p-10 text-center font-bold">جاري تحميل تقييمات أسواق هلا...</div>

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-foreground">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            تقييمات رضا العملاء الحقيقية · {selectedDept === 'all' ? 'جميع الأقسام' : 'قسم محدد'}
          </p>
        </div>

        <div className="relative">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="appearance-none bg-card border border-border rounded-xl px-4 py-2 text-sm font-semibold text-foreground pr-9 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">كل الأقسام</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>{d.emoji} {d.nameAr}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="أفضل قسم"
          value={topDept ? `${topDept.department.emoji} ${topDept.department.nameAr}` : '—'}
          sub={topDept ? `${topDept.avg}/5` : ''}
          icon={TrendingUp}
          accent
        />
        <StatCard
          title="الأقسام النشطة"
          value={activeDepts}
          sub="أقسام استلمت تقييمات"
          icon={BarChart3}
        />
        <StatCard
          title="متوسط التقييم"
          value={`${avgRating}/5`}
          sub="إجمالي رضا العملاء"
          icon={Star}
        />
        <StatCard
          title="إجمالي التقييمات"
          value={totalFeedbacks}
          sub="تقييم حقيقي"
          icon={BarChart3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <p className="font-bold text-foreground text-sm mb-4">معدل التقييم (بيانات حية)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={3} dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="font-bold text-foreground text-sm">ترتيب الأقسام</p>
          </div>
          <div className="space-y-3">
            {deptStats.map((s: any, i: number) => (
              <div key={s.department.id} className="bg-secondary/30 p-3 rounded-xl">
                <div className="flex justify-between text-xs font-bold">
                  <span>{s.department.emoji} {s.department.nameAr}</span>
                  <span>{s.avg}/5</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(s.avg / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="font-bold text-foreground text-sm">أحدث التقييمات من Supabase</p>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-xl text-xs font-bold">
            <Download className="w-3.5 h-3.5" /> تصدير CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-secondary/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3">القسم</th>
                <th className="px-5 py-3">التقييم</th>
                <th className="px-5 py-3">التعليق</th>
                <th className="px-5 py-3">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((entry) => (
                <tr key={entry.id} className="text-xs hover:bg-secondary/20">
                  <td className="px-5 py-3 font-bold">{entry.departmentName}</td>
                  <td className="px-5 py-3"><RatingBadge rating={entry.overallRating} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{entry.comment || '—'}</td>
                  <td className="px-5 py-3">{new Date(entry.createdAt).toLocaleDateString('ar-SA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}