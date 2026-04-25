'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Star, TrendingUp, BarChart3, Download, Eye, ChevronDown,
} from 'lucide-react'
import {
  MOCK_FEEDBACK, DEPARTMENTS, generateChartData, getDepartmentStats,
  type FeedbackEntry,
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
  const chartData = useMemo(() => generateChartData(), [])
  const deptStats = useMemo(() => getDepartmentStats(), [])

  const filtered: FeedbackEntry[] = selectedDept === 'all'
    ? MOCK_FEEDBACK
    : MOCK_FEEDBACK.filter((f) => f.departmentId === selectedDept)

  const totalFeedbacks = filtered.length
  const avgRating = filtered.length
    ? (filtered.reduce((s, f) => s + f.averageRating, 0) / filtered.length).toFixed(1)
    : '—'
  const topDept = deptStats[0]
  const activeDepts = deptStats.length

  function exportCSV() {
    const headers = ['القسم', 'التقييم', 'التعليق', 'التاريخ']
    const rows = filtered.map((f) => [
      f.departmentNameAr,
      f.averageRating,
      `"${f.comment}"`,
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

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-foreground">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            تقييمات رضا العملاء · جميع الأقسام
          </p>
        </div>

        {/* Department filter */}
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
          sub="قسم به تقييمات"
          icon={BarChart3}
        />
        <StatCard
          title="متوسط التقييم"
          value={`${avgRating}/5`}
          sub="عبر جميع الأقسام"
          icon={Star}
        />
        <StatCard
          title="إجمالي التقييمات"
          value={totalFeedbacks}
          sub="هذا الشهر"
          icon={BarChart3}
        />
      </div>

      {/* Chart + Department Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-foreground text-sm">معدل التقييم (آخر 30 يوم)</p>
              <p className="text-xs text-muted-foreground mt-0.5">عدد التقييمات اليومية بياناً</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                domain={[0, 5]}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: 'var(--foreground)',
                }}
                formatter={(val: number) => [`${val}/5`, 'متوسط التقييم']}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="var(--hala-orange)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: 'var(--hala-orange)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department ranking */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="font-bold text-foreground text-sm">ترتيب الأقسام</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">حسب متوسط رضا العملاء</p>
          <div className="space-y-3">
            {deptStats.slice(0, 5).map((s, i) => (
              <div key={s.department.id} className={cn('rounded-xl p-3', i === 0 ? 'bg-accent/10 border border-accent/20' : 'bg-secondary/50')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-black', i === 0 ? 'text-accent' : 'text-muted-foreground')}>
                      #{i + 1}
                    </span>
                    <span className="text-lg">{s.department.emoji}</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{s.avg}/5</span>
                </div>
                <div className="text-xs font-semibold text-foreground mb-1.5 truncate">{s.department.nameAr}</div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', i === 0 ? 'bg-accent' : 'bg-primary')}
                    style={{ width: `${(s.avg / 5) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{s.count} تقييم</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="font-bold text-foreground text-sm">أحدث التقييمات</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              آخر {filtered.length} تقييم
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/70 text-secondary-foreground rounded-xl text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            تصدير CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right bg-secondary/40">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">القسم</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">التقييم</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">التعليق</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">التاريخ</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice().reverse().map((entry) => {
                const dept = DEPARTMENTS.find(d => d.id === entry.departmentId)
                return (
                  <tr key={entry.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{dept?.emoji}</span>
                        <div>
                          <p className="font-semibold text-foreground text-xs">{entry.departmentNameAr}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{entry.departmentNameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <RatingBadge rating={entry.averageRating} />
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell max-w-[220px]">
                      <p className="text-xs text-muted-foreground truncate">
                        {entry.comment || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="text-primary hover:text-primary/70 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground text-center">
          عرض {filtered.length} تقييم
        </div>
      </div>
    </div>
  )
}
