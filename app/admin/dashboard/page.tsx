"use client";

export const dynamic = "force-dynamic";
export const runtime = "edge"; // جرب إضافة هذا السطر لتهريب الصفحة من نظام الـ Build التقليدي
import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Star,
  TrendingUp,
  BarChart3,
  Download,
  Eye,
  ChevronDown,
} from "lucide-react";
import {
  DEPARTMENTS,
  BRANCHES, // 👈 أضفنا BRANCHES هنا لاستدعاء الفروع في الداشبورد
} from "@/lib/feedback-data";
import { cn } from "@/lib/utils";

function ReasonsList({ answers }: { answers: any }) {
  if (!answers) return null;

  // دالة ذكية للبحث عن نص السؤال بالعربي من ملف البيانات
  const getQuestionText = (id: string) => {
    // نبحث في كل الأقسام
    for (const dept of DEPARTMENTS) {
      // نحدد النوع هنا كـ any لتجاوز قيود الـ Interface المؤقتة
      const q = dept.questions.find((question: any) => question.id === id);

      // نتحقق أن السؤال موجود وأن لديه خاصية ar
      if (q && typeof q === "object" && "ar" in q) {
        return (q.ar as string).replace("؟", "");
      }
    }
    return id; // إذا لم يجد شيئاً يعيد الـ id كـ fallback
  };
  return (
    <div className="flex flex-col gap-2 mt-2">
      {Object.entries(answers).map(([key, data]: [string, any]) => {
        // نتحقق إذا كانت الإجابة كائن يحتوي على أسباب (يعني تقييم منخفض)
        if (
          typeof data === "object" &&
          data.reasons &&
          data.reasons.length > 0
        ) {
          return (
            <div
              key={key}
              className="flex flex-col gap-1 items-start bg-secondary/20 p-2 rounded-lg border border-border/50"
            >
              {/* عرض نص السؤال العربي تلقائياً */}
              <span className="text-[10px] font-bold text-primary">
                {getQuestionText(key)}:
              </span>

              <div className="flex flex-wrap gap-1">
                {data.reasons.map((reason: string) => (
                  <span
                    key={reason}
                    className="bg-destructive/10 text-destructive text-[10px] px-2 py-0.5 rounded-full border border-destructive/20 font-semibold"
                  >
                    {reason === "أخرى" && data.other
                      ? `أخرى: ${data.other}`
                      : reason}
                  </span>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

const RATING_COLORS: Record<number, string> = {
  1: "bg-destructive/15 text-destructive border-destructive/30",
  2: "bg-orange-100 text-orange-700 border-orange-200",
  3: "bg-yellow-100 text-yellow-700 border-yellow-200",
  4: "bg-lime-100 text-lime-700 border-lime-200",
  5: "bg-green-100 text-green-700 border-green-200",
};

const RATING_LABELS: Record<number, string> = {
  1: "سيئ جداً",
  2: "سيئ",
  3: "جيد",
  4: "جيد جداً",
  5: "ممتاز",
};

function RatingBadge({ rating }: { rating: number }) {
  const r = Math.round(rating);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border",
        RATING_COLORS[r] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      <Star className="w-2.5 h-2.5 fill-current" />
      {rating.toFixed(1)} – {RATING_LABELS[r] ?? ""}
    </span>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl p-5 flex flex-col gap-3",
        accent && "border-primary/30 bg-primary/5",
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            accent
              ? "bg-primary/20 text-primary"
              : "bg-secondary text-muted-foreground",
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
      <p className="text-xs font-semibold text-foreground/70">{title}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [selectedDept, setSelectedDept] = useState<string>("all");
  // 🆕 أضفنا State لتخزين الفرع المختار وافتراضياً "all" يعني كل الفروع
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🆕 الحقول الجديدة للترتيب المتقدم، نطاق التواريخ، وحجم الصفحة
  const [sortBy, setSortBy] = useState<string>("newest"); // الخيارات: newest, oldest, highest, lowest
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10); // افتراضياً يعرض 10 تقييمات في الصفحة
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 1. جلب البيانات من الداتابيز
  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        const res = await fetch("/api/feedback");
        const data = await res.json();
        setFeedbacks(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeedbacks();
  }, []);

  // 2. تصفية البيانات حسب القسم
  // 2. تصفية وترتيب البيانات بشكل متقدم وديناميكي
  const filteredAndSorted = useMemo(() => {
    let result = feedbacks.filter((f) => {
      // أ) فلترة حسب الفرع
      const matchBranch =
        selectedBranch === "all" ? true : f.branchId === selectedBranch;
      // ب) فلترة حسب القسم
      const matchDept =
        selectedDept === "all" ? true : f.departmentId === selectedDept;

      // ج) فلترة حسب نطاق التواريخ المحددة
      let matchDate = true;
      if (startDate || endDate) {
        const feedbackDate = new Date(f.createdAt).setHours(0, 0, 0, 0);
        if (startDate) {
          const start = new Date(startDate).setHours(0, 0, 0, 0);
          if (feedbackDate < start) matchDate = false;
        }
        if (endDate) {
          const end = new Date(endDate).setHours(23, 59, 59, 999);
          if (feedbackDate > end) matchDate = false;
        }
      }

      return matchBranch && matchDept && matchDate;
    });

    // د) الترتيب (Sort) من الأعلى، الأقل، الأحدث، الأقدم
    if (sortBy === "highest") {
      result.sort((a, b) => b.overallRating - a.overallRating);
    } else if (sortBy === "lowest") {
      result.sort((a, b) => a.overallRating - b.overallRating);
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else {
      // الافتراضي: الأحدث أولاً 'newest'
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return result;
  }, [feedbacks, selectedBranch, selectedDept, sortBy, startDate, endDate]);

  // 🆕 حسابات الترقيم وتوزيع الصفحات (Pagination)
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // إعادة تعيين الصفحة إلى 1 تلقائياً عند تغيير أي فلتر لمنع الأخطاء البصرية
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBranch, selectedDept, sortBy, startDate, endDate, pageSize]);

  // 🆕 استقطاع تقييمات الصفحة النشطة فقط لعرضها بالجدول ومنع السكرول اللانهائي
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  // 3. حساب الإحصائيات (محدث ليرتبط بالفلاتر الجديدة لتتحدث بطاقات الأرقام فوراً)
  const totalFeedbacks = filteredAndSorted.length;
  const avgRating = filteredAndSorted.length
    ? (
        filteredAndSorted.reduce((s, f) => s + f.overallRating, 0) /
        filteredAndSorted.length
      ).toFixed(1)
    : "0.0";

  const deptStats = useMemo(() => {
    const stats: any = {};
    feedbacks.forEach((f) => {
      if (!stats[f.departmentId]) {
        stats[f.departmentId] = {
          id: f.departmentId,
          nameAr: f.departmentName,
          sum: 0,
          count: 0,
        };
      }
      stats[f.departmentId].sum += f.overallRating;
      stats[f.departmentId].count += 1;
    });
    return Object.values(stats)
      .map((s: any) => ({
        department: DEPARTMENTS.find((d) => d.id === s.id) || {
          nameAr: s.nameAr,
          emoji: "📍",
          id: s.id,
        },
        avg: (s.sum / s.count).toFixed(1),
        count: s.count,
      }))
      .sort((a, b) => Number(b.avg) - Number(a.avg));
  }, [feedbacks]);

  const topDept = deptStats[0];
  const activeDepts = deptStats.length;

  // بيانات الرسم البياني (بشكل مبسط للأيام الأخيرة)
  const chartData = useMemo(() => {
    if (!Array.isArray(feedbacks) || feedbacks.length === 0) return [];

    const days: Record<string, { sum: number; count: number }> = {};

    // 1. تجميع البيانات حسب التاريخ
    feedbacks.forEach((f) => {
      if (!f.createdAt) return;
      // تحويل التاريخ لصيغة (يوم/شهر)
      const date = new Date(f.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });

      if (!days[date]) {
        days[date] = { sum: 0, count: 0 };
      }
      days[date].sum += f.overallRating || 0;
      days[date].count += 1;
    });

    // 2. تحويل البيانات لشكل يفهمه الشارت وترتيبها زمنياً
    return Object.keys(days)
      .map((date) => ({
        date,
        rating: Number((days[date].sum / days[date].count).toFixed(1)),
      }))
      .reverse(); // عكس القائمة ليكون الترتيب من الأقدم للأحدث (يسار لليمين)
  }, [feedbacks]);

  function exportCSV() {
    const headers = [
      "القسم",
      "التقييم",
      "التعليق",
      "الأسباب التفصيلية",
      "التاريخ",
    ];

    // دالة مساعدة لجلب نص السؤال من ملف البيانات
    const getQuestionText = (id: string) => {
      // نبحث في كل الأقسام
      for (const dept of DEPARTMENTS) {
        // نحدد النوع هنا كـ any لتجاوز قيود الـ Interface المؤقتة
        const q = dept.questions.find((question: any) => question.id === id);

        // نتحقق أن السؤال موجود وأن لديه خاصية ar
        if (q && typeof q === "object" && "ar" in q) {
          return (q.ar as string).replace("؟", "");
        }
      }
      return id; // إذا لم يجد شيئاً يعيد الـ id كـ fallback
    };

    const rows = filteredAndSorted.map((f) => {
      // تجميع الأسباب بنصوص عربية واضحة بدلاً من التاقات
      const allReasons = Object.entries(f.answers || {})
        .map(([key, data]: [string, any]) => {
          if (
            typeof data === "object" &&
            data.reasons &&
            data.reasons.length > 0
          ) {
            const questionLabel = getQuestionText(key); // تحويل الـ ID لاسم عربي
            const reasonsList = data.reasons.join(" - ");
            const otherText = data.other ? ` (أخرى: ${data.other})` : "";
            return `${questionLabel}: [${reasonsList}${otherText}]`;
          }
          return "";
        })
        .filter(Boolean)
        .join(" | "); // الفاصل بين كل سؤال وسؤال

      return [
        f.departmentName,
        f.overallRating,
        `"${f.comment || ""}"`,
        `"${allReasons}"`,
        new Date(f.createdAt).toLocaleDateString("ar-SA"),
      ];
    });

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    // نستخدم \ufeff لضمان أن الإكسل يفتح اللغة العربية بدون رموز غريبة
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `تقرير-تقييمات-هلا-${new Date().toLocaleDateString("ar-SA")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading)
    return (
      <div className="p-10 text-center font-bold">
        جاري تحميل تقييمات أسواق هلا...
      </div>
    );

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Page header & Advanced Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-foreground">لوحة التحكم</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              تقييمات رضا العملاء الحقيقية لأسواق هلا ·{" "}
              {selectedBranch === "all"
                ? "جميع الفروع"
                : BRANCHES.find((b) => b.id === selectedBranch)?.nameAr}
            </p>
          </div>
        </div>

        {/* 🆕 شريط الفلاتر المتقدم الخماسي */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
          {/* 1. فلتر الفروع */}
          <div className="flex flex-col gap-1 relative">
            <span className="text-[10px] font-bold text-muted-foreground">
              الفلترة حسب الفرع
            </span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full appearance-none bg-secondary/40 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">كل الفروع</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  📍 {b.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* 2. فلتر الأقسام */}
          <div className="flex flex-col gap-1 relative">
            <span className="text-[10px] font-bold text-muted-foreground">
              الفلترة حسب القسم
            </span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full appearance-none bg-secondary/40 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">كل الأقسام</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.emoji} {d.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* 3. فرز وترتيب التقييمات */}
          <div className="flex flex-col gap-1 relative">
            <span className="text-[10px] font-bold text-muted-foreground">
              ترتيب وتصنيف حسب
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none bg-secondary/40 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="oldest">الأقدم أولاً</option>
              <option value="highest">التقييم الأعلى</option>
              <option value="lowest">التقييم الأقل</option>
            </select>
          </div>

          {/* 4. تاريخ البدء */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground">
              من تاريخ
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-secondary/40 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* 5. تاريخ الانتهاء */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground">
              إلى تاريخ
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-secondary/40 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="أفضل قسم"
          value={
            topDept
              ? `${topDept.department.emoji} ${topDept.department.nameAr}`
              : "—"
          }
          sub={topDept ? `${topDept.avg}/5` : ""}
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
          <p className="font-bold text-foreground text-sm mb-4">
            معدل التقييم (بيانات حية)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={true}
              />
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
              <div
                key={s.department.id}
                className="bg-secondary/30 p-3 rounded-xl"
              >
                <div className="flex justify-between text-xs font-bold">
                  <span>
                    {s.department.emoji} {s.department.nameAr}
                  </span>
                  <span>{s.avg}/5</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(s.avg / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="font-bold text-foreground text-sm">أحدث التقييمات</p>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-xl text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" /> تصدير CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-secondary/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3">الفرع</th>
                <th className="px-5 py-3">القسم</th>
                {/* 🆕 عمود عناوين العميل الجديد */}
                <th className="px-5 py-3">بيانات العميل</th>
                <th className="px-5 py-3">التقييم</th>
                <th className="px-5 py-3">التعليق</th>
                <th className="px-5 py-3">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* 🆕 غيرنا المصفوفة هنا لتقرأ البيانات المقسمة لصفحات */}
              {paginatedFeedbacks.map((entry) => (
                <tr key={entry.id} className="text-xs hover:bg-secondary/20">
                  {/* 🆕 عرض اسم الفرع بالعربي بناءً على الـ branchId المخزن بسوبا بيس */}
                  <td className="px-5 py-3 font-bold whitespace-nowrap">
                    {BRANCHES.find((b) => b.id === entry.branchId)?.nameAr ||
                      "فرع عام"}
                  </td>
                  <td className="px-5 py-3 font-bold">
                    {entry.departmentName}
                  </td>

                  <td className="px-5 py-3">
                    <RatingBadge rating={entry.overallRating} />
                  </td>

                  {/* عودة عمود التعليق لشغله الأصلي النظيف والملموم */}
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground/90 font-medium">
                        {entry.comment || "—"}
                      </span>
                      <ReasonsList answers={entry.answers} />
                    </div>
                  </td>

                  {/* 🆕 العمود الجديد: يعرض الاسم والرقم منسقين عمودياً وبلون هادئ ومقاس محكم */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    {entry.customerName || entry.customerPhone ? (
                      <div className="flex flex-col gap-0.5 text-[11px] font-bold">
                        {entry.customerName && (
                          <span className="text-foreground flex items-center gap-1">
                            👤 {entry.customerName}
                          </span>
                        )}
                        {entry.customerPhone && (
                          <span className="text-primary flex items-center gap-1">
                            📞 <span dir="ltr">{entry.customerPhone}</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40 italic text-[11px]">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {new Date(entry.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🆕 شريط التحكم بالصفحات: لاصق ومتكامل مع بوكس التقييمات الأبيض ومربعات أصغر */}
        <div
          className="flex items-center justify-between px-5 py-4 border-t border-border flex-wrap gap-4 bg-card"
          dir="rtl"
        >
          {/* جهة اليمين: أزرار الأرقام والأقواس بحجم أصغر وناعم */}
          <div className="flex items-center gap-1">
            {/* زر الانتقال لأول صفحة << */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="w-7 h-7 rounded-lg border border-border bg-card flex items-center justify-center text-[11px] font-bold text-foreground disabled:opacity-30 disabled:pointer-events-none hover:bg-secondary hover:text-primary transition-all"
              title="الصفحة الأولى"
            >
              {"<<"}
            </button>

            {/* زر السابق < */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="w-7 h-7 rounded-lg border border-border bg-card flex items-center justify-center text-[11px] font-bold text-foreground disabled:opacity-30 disabled:pointer-events-none hover:bg-secondary hover:text-primary transition-all ml-1"
              title="الصفحة السابقة"
            >
              {"<"}
            </button>

            {/* 🔢 توليد أرقام الصفحات ديناميكياً بحجم أصغر متناسق */}
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                Math.abs(pageNumber - currentPage) <= 1
              ) {
                const isActive = pageNumber === currentPage;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={cn(
                      "w-7 h-7 rounded-lg text-[11px] font-bold transition-all border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary scale-105 shadow-sm" // الأخضر المعتمد #005F13
                        : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {pageNumber}
                  </button>
                );
              }

              if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <span
                    key={pageNumber}
                    className="w-5 text-center text-[11px] text-muted-foreground font-bold"
                  >
                    ...
                  </span>
                );
              }

              return null;
            })}

            {/* زر التالي > */}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="w-7 h-7 rounded-lg border border-border bg-card flex items-center justify-center text-[11px] font-bold text-foreground disabled:opacity-30 disabled:pointer-events-none hover:bg-secondary hover:text-primary transition-all mr-1"
              title="الصفحة التالية"
            >
              {">"}
            </button>

            {/* زر الانتقال لآخر صفحة >> */}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="w-7 h-7 rounded-lg border border-border bg-card flex items-center justify-center text-[11px] font-bold text-foreground disabled:opacity-30 disabled:pointer-events-none hover:bg-secondary hover:text-primary transition-all"
              title="الصفحة الأخيرة"
            >
              {">>"}
            </button>
          </div>

          {/* جهة اليسار: صندوق الاختيار العصري وحسبة عدد العناصر */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-muted-foreground">عرض:</span>

            {/* 🆕 القائمة العصرية المخصصة البديلة للـ Select التقليدي */}
            <div className="relative inline-block text-right">
              {/* زر عرض القائمة النشط */}
              <button
                type="button"
                onClick={() => {
                  // فتح وإغلاق القائمة عند الضغط (نحتاج لتعريف state سريع أو استخدام حيلة التركيز)
                  const menu = document.getElementById("custom-size-menu");
                  if (menu) menu.classList.toggle("hidden");
                }}
                onBlur={() => {
                  // إغلاق القائمة تلقائياً عند الضغط خارجها
                  setTimeout(() => {
                    const menu = document.getElementById("custom-size-menu");
                    if (menu) menu.classList.add("hidden");
                  }, 200);
                }}
                className="bg-card border border-border rounded-xl py-1 pl-6 pr-2.5 font-bold text-foreground focus:outline-none cursor-pointer text-[11px] w-22 flex items-center justify-between hover:bg-secondary/50 transition-all select-none"
              >
                <span>{pageSize} تقييمات</span>
                <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground stroke-[2.5]" />
              </button>

              {/* 📌 قائمة الخيارات العصرية (تظهر وتختفي ديناميكياً) */}
              <div
                id="custom-size-menu"
                className="hidden absolute left-0 bottom-full mb-1.5 w-25 bg-card border border-border rounded-xl shadow-lg py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                {[10, 20, 50, 100].map((size) => {
                  const isSelected = pageSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        const menu =
                          document.getElementById("custom-size-menu");
                        if (menu) menu.classList.add("hidden");
                      }}
                      className={cn(
                        "w-full text-right px-3 py-1.5 text-[11px] font-bold block transition-all hover:bg-secondary",
                        isSelected
                          ? "text-primary bg-primary/5" // تلوين الخيار المختار بالأخضر الرسمي #005F13 وبخلفية ناعمة
                          : "text-foreground",
                      )}
                    >
                      {size} {size === 10 ? "تقييمات" : "تقييم"}{" "}
                      {/* 👈 نفس الشرط لكي تظهر الخيارات في القائمة مضبوطة وموزونة لغوياً */}{" "}
                    </button>
                  );
                })}
              </div>
            </div>

            <span className="text-muted-foreground mr-1">
              من إجمالي{" "}
              <strong className="text-foreground font-black">
                {totalItems} {totalItems === 10 ? "تقييمات" : "تقييم"}{" "}
              </strong>{" "}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
